<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\TenantDatabase;
use App\Models\TenantToken;
use App\Models\TenantUser;
use App\Tenancy\TenantContext;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthorizationGateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->cleanupTestDatabases();
    }

    protected function tearDown(): void
    {
        $this->cleanupTestDatabases();
        parent::tearDown();
    }

    protected function cleanupTestDatabases(): void
    {
        app(TenantDatabaseManager::class)->purgeConnection();
        $dir = database_path('tenants');
        if (is_dir($dir)) {
            foreach (glob($dir.DIRECTORY_SEPARATOR.'test_authz_*.sqlite') as $file) {
                if (file_exists($file)) {
                    @unlink($file);
                }
            }
        }
    }

    /**
     * Test Authorization Gate (Phase J §21):
     * - Teacher role with courses.create succeeds
     * - Assistant role without courses.create denied (403 FORBIDDEN)
     * - Student role without courses.create denied (403 FORBIDDEN)
     * - Unauthenticated call denied (401 UNAUTHENTICATED)
     * - Default deny policy enforced
     */
    public function test_authorization_gate_role_and_permission_enforcement(): void
    {
        $dbManager = app(TenantDatabaseManager::class);
        $context = app(TenantContext::class);

        // 1. Provision Tenant
        $tenant = Tenant::create([
            'name' => 'Excellence Academy',
            'slug' => 'excellence',
            'type' => 'educational_center',
            'status' => 'active',
        ]);
        TenantDatabase::create([
            'tenant_id' => $tenant->id,
            'connection_identifier' => 'test_authz_tenant',
            'status' => 'ready',
        ]);
        $dbManager->migrateTenant($tenant);

        $context->setTenant($tenant);
        $dbManager->configureConnection($tenant);

        // 2. Setup Permissions
        $permCourseCreate = Permission::create([
            'name' => 'courses.create',
            'module' => 'education',
            'description' => 'Create courses',
        ]);

        $permAttendanceRecord = Permission::create([
            'name' => 'attendance.record',
            'module' => 'attendance',
            'description' => 'Record session attendance',
        ]);

        // 3. Setup Roles
        $teacherRole = Role::create([
            'name' => 'teacher',
            'label' => 'Teacher',
            'is_system' => true,
        ]);
        $teacherRole->permissions()->attach($permCourseCreate->id);

        $assistantRole = Role::create([
            'name' => 'assistant',
            'label' => 'Assistant',
            'is_system' => true,
        ]);
        $assistantRole->permissions()->attach($permAttendanceRecord->id);

        $studentRole = Role::create([
            'name' => 'student',
            'label' => 'Student',
            'is_system' => true,
        ]);

        // 4. Create Teacher User
        $teacherUser = TenantUser::create([
            'name' => 'Mr. Bilal',
            'email' => 'bilal@excellence.sa',
            'password' => Hash::make('password123'),
            'type' => 'staff',
            'status' => 'active',
        ]);
        $teacherUser->roles()->attach($teacherRole->id);
        Staff::create([
            'user_id' => $teacherUser->id,
            'staff_type' => 'teacher',
            'status' => 'active',
        ]);
        $teacherToken = TenantToken::createTokenFor($teacherUser)['plainTextToken'];

        // 5. Create Assistant User
        $assistantUser = TenantUser::create([
            'name' => 'Assistant Huda',
            'email' => 'huda@excellence.sa',
            'password' => Hash::make('password123'),
            'type' => 'staff',
            'status' => 'active',
        ]);
        $assistantUser->roles()->attach($assistantRole->id);
        Staff::create([
            'user_id' => $assistantUser->id,
            'staff_type' => 'assistant',
            'status' => 'active',
        ]);
        $assistantToken = TenantToken::createTokenFor($assistantUser)['plainTextToken'];

        // 6. Create Student User
        $studentUser = TenantUser::create([
            'name' => 'Student Sarah',
            'email' => 'sarah@excellence.sa',
            'password' => Hash::make('password123'),
            'type' => 'student',
            'status' => 'active',
        ]);
        $studentUser->roles()->attach($studentRole->id);
        Student::create([
            'user_id' => $studentUser->id,
            'student_code' => 'STU-EXC-001',
            'status' => 'active',
        ]);
        $studentToken = TenantToken::createTokenFor($studentUser)['plainTextToken'];

        // --- Execute Gate Assertions ---

        // A. Unauthenticated request -> 401 UNAUTHENTICATED
        $unauthResp = $this->withHeaders([
            'X-Tenant-Slug' => 'excellence',
        ])->postJson('/api/v1/courses');

        $unauthResp->assertStatus(401)
            ->assertJsonPath('error.code', 'UNAUTHENTICATED');

        // B. Teacher with courses.create -> 200 OK
        $teacherResp = $this->withHeaders([
            'X-Tenant-Slug' => 'excellence',
            'Authorization' => 'Bearer '.$teacherToken,
        ])->postJson('/api/v1/courses');

        $teacherResp->assertStatus(200)
            ->assertJsonPath('data.message', 'Course created successfully.');

        // C. Assistant without courses.create -> 403 FORBIDDEN
        $assistantResp = $this->withHeaders([
            'X-Tenant-Slug' => 'excellence',
            'Authorization' => 'Bearer '.$assistantToken,
        ])->postJson('/api/v1/courses');

        $assistantResp->assertStatus(403)
            ->assertJsonPath('error.code', 'FORBIDDEN');

        // D. Student without courses.create -> 403 FORBIDDEN
        $studentResp = $this->withHeaders([
            'X-Tenant-Slug' => 'excellence',
            'Authorization' => 'Bearer '.$studentToken,
        ])->postJson('/api/v1/courses');

        $studentResp->assertStatus(403)
            ->assertJsonPath('error.code', 'FORBIDDEN');
    }
}
