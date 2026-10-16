<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Staff;
use App\Models\Tenant;
use App\Models\TenantDatabase;
use App\Models\TenantDomain;
use App\Models\TenantToken;
use App\Models\TenantUser;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AbacAuthorizationGateTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected TenantUser $teacher1;

    protected TenantUser $teacher2;

    protected Course $course1;

    protected string $token1;

    protected string $token2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'slug' => 'test-abac',
            'name' => 'Test ABAC Academy',
            'type' => 'school',
            'status' => 'active',
        ]);

        TenantDatabase::create([
            'tenant_id' => $this->tenant->id,
            'connection_identifier' => 'tenant_'.$this->tenant->slug,
            'status' => 'ready',
        ]);

        TenantDomain::create([
            'tenant_id' => $this->tenant->id,
            'domain' => 'test-abac.localhost',
            'active' => true,
        ]);

        $dbManager = app(TenantDatabaseManager::class);
        $dbManager->migrateTenant($this->tenant);
        $dbManager->configureConnection($this->tenant);

        // Create the 'teacher' role with 'courses.update' permission
        $role = Role::create([
            'name' => 'teacher',
            'label' => 'Teacher Role',
            'description' => 'Can teach and manage own courses',
        ]);

        $permission = Permission::create([
            'name' => 'courses.update',
            'label' => 'Update Courses',
            'module' => 'courses',
            'description' => 'Update courses',
        ]);
        $role->permissions()->attach($permission->id);

        $this->teacher1 = TenantUser::create([
            'name' => 'Teacher One',
            'email' => 't1@abac.com',
            'password' => 'secret',
            'type' => 'staff',
            'status' => 'active',
        ]);
        $this->teacher1->roles()->attach($role->id);

        $staff1 = Staff::create([
            'user_id' => $this->teacher1->id,
            'department' => 'Math',
            'status' => 'active',
        ]);

        $this->teacher2 = TenantUser::create([
            'name' => 'Teacher Two',
            'email' => 't2@abac.com',
            'password' => 'secret',
            'type' => 'staff',
            'status' => 'active',
        ]);
        $this->teacher2->roles()->attach($role->id);

        $staff2 = Staff::create([
            'user_id' => $this->teacher2->id,
            'department' => 'Science',
            'status' => 'active',
        ]);

        // Teacher 1 creates a course
        $this->course1 = Course::create([
            'teacher_staff_id' => $staff1->id,
            'title' => 'Math 101',
            'status' => 'published',
        ]);

        $this->token1 = TenantToken::createTokenFor($this->teacher1)['plainTextToken'];
        $this->token2 = TenantToken::createTokenFor($this->teacher2)['plainTextToken'];
    }

    protected function tearDown(): void
    {
        app(TenantDatabaseManager::class)->configureConnection($this->tenant);
        DB::disconnect('tenant_'.$this->tenant->slug);

        $dbPath = database_path('tenants/tenant_'.$this->tenant->slug.'.sqlite');
        if (file_exists($dbPath)) {
            @unlink($dbPath);
        }

        parent::tearDown();
    }

    public function test_teacher_can_update_own_course()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$this->token1,
            'X-Tenant' => 'test-abac',
        ])->putJson("/api/v1/courses/{$this->course1->id}", [
            'title' => 'Advanced Math 101',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Advanced Math 101', $this->course1->fresh()->title);
    }

    public function test_teacher_cannot_update_other_teachers_course()
    {
        // Teacher 2 tries to update Teacher 1's course
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$this->token2,
            'X-Tenant' => 'test-abac',
        ])->putJson("/api/v1/courses/{$this->course1->id}", [
            'title' => 'Hacked Math 101',
        ]);

        // Should be forbidden by ABAC Engine (Deny Precedence)
        $response->assertStatus(403);
    }
}
