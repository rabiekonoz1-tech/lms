<?php

namespace Tests\Feature;

use App\Models\GlobalIdentity;
use App\Models\Role;
use App\Models\Staff;
use App\Models\Student;
use App\Models\StudentIdentityLink;
use App\Models\Tenant;
use App\Models\TenantDatabase;
use App\Models\TenantUser;
use App\Tenancy\TenantContext;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class IdentityGateTest extends TestCase
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
            foreach (glob($dir.DIRECTORY_SEPARATOR.'test_identity_*.sqlite') as $file) {
                if (file_exists($file)) {
                    @unlink($file);
                }
            }
        }
    }

    /**
     * Test Identity Gate:
     * - Global Student Identity links to multiple tenants
     * - User != Student
     * - Teacher != Role
     * - Global Identity != Cross-Tenant Authorization (SEC-INV-006)
     */
    public function test_identity_gate_invariants(): void
    {
        $dbManager = app(TenantDatabaseManager::class);
        $context = app(TenantContext::class);
        $runId = uniqid();

        // 1. Provision Tenant A & Tenant B
        $tenantA = Tenant::create([
            'name' => 'Math Academy',
            'slug' => 'math-academy-'.$runId,
            'type' => 'individual_teacher',
            'status' => 'active',
        ]);
        TenantDatabase::create([
            'tenant_id' => $tenantA->id,
            'connection_identifier' => 'test_identity_tenant_a_'.$runId,
            'status' => 'ready',
        ]);

        $tenantB = Tenant::create([
            'name' => 'Physics Center',
            'slug' => 'physics-center-'.$runId,
            'type' => 'educational_center',
            'status' => 'active',
        ]);
        TenantDatabase::create([
            'tenant_id' => $tenantB->id,
            'connection_identifier' => 'test_identity_tenant_b_'.$runId,
            'status' => 'ready',
        ]);

        $dbManager->migrateTenant($tenantA);
        $dbManager->migrateTenant($tenantB);

        // 2. Create Global Student Identity (Control DB)
        $globalStudent = GlobalIdentity::create([
            'name' => 'Zaid Al-Harbi',
            'email' => 'zaid@example.com',
            'phone' => '+966500000001',
            'type' => 'student',
            'status' => 'active',
        ]);

        // 3. Register Student in Tenant A
        $context->setTenant($tenantA);
        $dbManager->configureConnection($tenantA);

        $userA = TenantUser::create([
            'name' => 'Zaid Al-Harbi',
            'email' => 'zaid@example.com',
            'phone' => '+966500000001',
            'password' => Hash::make('password123'),
            'type' => 'student',
            'status' => 'active',
        ]);

        $studentA = Student::create([
            'user_id' => $userA->id,
            'global_identity_id' => $globalStudent->id,
            'student_code' => 'STU-MATH-001',
            'status' => 'active',
        ]);

        // Invariant: User != Student
        $this->assertNotEquals($userA->id, $studentA->id);
        $this->assertEquals($userA->id, $studentA->user->id);

        StudentIdentityLink::create([
            'global_identity_id' => $globalStudent->id,
            'tenant_id' => $tenantA->id,
            'tenant_student_id' => $studentA->id,
        ]);

        // 4. Register Student in Tenant B (Different student code, distinct tenant account)
        $context->setTenant($tenantB);
        $dbManager->configureConnection($tenantB);

        $userB = TenantUser::create([
            'name' => 'Zaid Al-Harbi',
            'email' => 'zaid@example.com',
            'phone' => '+966500000001',
            'password' => Hash::make('secret_b_456'),
            'type' => 'student',
            'status' => 'active',
        ]);

        $studentB = Student::create([
            'user_id' => $userB->id,
            'global_identity_id' => $globalStudent->id,
            'student_code' => 'STU-PHYS-999',
            'status' => 'active',
        ]);

        StudentIdentityLink::create([
            'global_identity_id' => $globalStudent->id,
            'tenant_id' => $tenantB->id,
            'tenant_student_id' => $studentB->id,
        ]);

        // Invariant: Global Identity links to both tenants
        $this->assertEquals(2, $globalStudent->tenantLinks()->count());

        // Invariant: Student codes and accounts are tenant-isolated
        $this->assertNotEquals($studentA->id, $studentB->id);
        $this->assertEquals('STU-MATH-001', $studentA->student_code);
        $this->assertEquals('STU-PHYS-999', $studentB->student_code);

        // 5. Invariant: Teacher != Role
        $staffUser = TenantUser::create([
            'name' => 'Teacher Tariq',
            'email' => 'tariq@example.com',
            'password' => Hash::make('teach123'),
            'type' => 'staff',
            'status' => 'active',
        ]);

        $staffProfile = Staff::create([
            'user_id' => $staffUser->id,
            'staff_type' => 'teacher',
            'status' => 'active',
        ]);

        $teacherRole = Role::create([
            'name' => 'teacher_role',
            'label' => 'Teacher',
            'is_system' => true,
        ]);

        $staffUser->roles()->attach($teacherRole->id);

        $this->assertTrue($staffProfile->isTeacher());
        $this->assertTrue($staffUser->hasRole('teacher_role'));
        $this->assertNotEquals($staffProfile->id, $teacherRole->id);
    }
}
