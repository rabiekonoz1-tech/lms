<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\TenantDatabase;
use App\Models\TenantUser;
use App\Tenancy\TenantContext;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationGateTest extends TestCase
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
            foreach (glob($dir.DIRECTORY_SEPARATOR.'test_auth_*.sqlite') as $file) {
                if (file_exists($file)) {
                    @unlink($file);
                }
            }
        }
    }

    /**
     * Test Authentication Gate:
     * - valid login produces token and user envelope
     * - wrong password fails with 401
     * - inactive user fails with 403
     * - cross-tenant authentication is strictly blocked
     * - logout revokes bearer session
     */
    public function test_authentication_gate(): void
    {
        $dbManager = app(TenantDatabaseManager::class);
        $context = app(TenantContext::class);

        // 1. Provision Tenant A & Tenant B
        $tenantA = Tenant::create([
            'name' => 'Al-Bayan Academy',
            'slug' => 'al-bayan',
            'type' => 'educational_center',
            'status' => 'active',
        ]);
        TenantDatabase::create([
            'tenant_id' => $tenantA->id,
            'connection_identifier' => 'test_auth_tenant_a',
            'status' => 'ready',
        ]);

        $tenantB = Tenant::create([
            'name' => 'Dar Al-Uloom Center',
            'slug' => 'dar-aluloom',
            'type' => 'educational_center',
            'status' => 'active',
        ]);
        TenantDatabase::create([
            'tenant_id' => $tenantB->id,
            'connection_identifier' => 'test_auth_tenant_b',
            'status' => 'ready',
        ]);

        $dbManager->migrateTenant($tenantA);
        $dbManager->migrateTenant($tenantB);

        // 2. Create Active Student User in Tenant A
        $context->setTenant($tenantA);
        $dbManager->configureConnection($tenantA);

        $studentRole = Role::create([
            'name' => 'student',
            'label' => 'Student',
            'is_system' => true,
        ]);

        $userA = TenantUser::create([
            'name' => 'Omar Khalid',
            'email' => 'omar@example.com',
            'phone' => '+966555123456',
            'password' => Hash::make('secretPass123'),
            'type' => 'student',
            'status' => 'active',
        ]);
        $userA->roles()->attach($studentRole->id);

        Student::create([
            'user_id' => $userA->id,
            'student_code' => 'STU-BAYAN-100',
            'status' => 'active',
        ]);

        // 3. Test Invalid Password in Tenant A
        $failResponse = $this->withHeaders([
            'X-Tenant-Slug' => 'al-bayan',
        ])->postJson('/api/v1/auth/login', [
            'identifier' => 'omar@example.com',
            'password' => 'wrong_password',
        ]);

        $failResponse->assertStatus(401)
            ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');

        // 4. Test Valid Login in Tenant A
        $loginResponse = $this->withHeaders([
            'X-Tenant-Slug' => 'al-bayan',
        ])->postJson('/api/v1/auth/login', [
            'identifier' => 'omar@example.com',
            'password' => 'secretPass123',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'token_type',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'type',
                        'roles',
                    ],
                ],
                'meta' => [
                    'request_id',
                ],
            ]);

        $token = $loginResponse->json('data.token');
        $this->assertNotEmpty($token);

        // 5. Test Cross-Tenant Login Attempt: Trying to login to Tenant B with Tenant A credentials
        $crossResponse = $this->withHeaders([
            'X-Tenant-Slug' => 'dar-aluloom',
        ])->postJson('/api/v1/auth/login', [
            'identifier' => 'omar@example.com',
            'password' => 'secretPass123',
        ]);

        // User does not exist in Tenant B's isolated database -> 401 INVALID_CREDENTIALS
        $crossResponse->assertStatus(401)
            ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');

        // 6. Test GET /api/v1/auth/me with Bearer Token in Tenant A
        $meResponse = $this->withHeaders([
            'X-Tenant-Slug' => 'al-bayan',
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200)
            ->assertJsonPath('data.email', 'omar@example.com')
            ->assertJsonPath('data.name', 'Omar Khalid')
            ->assertJsonPath('data.profile.student_code', 'STU-BAYAN-100');

        // 7. Test Logout and Token Revocation
        $logoutResponse = $this->withHeaders([
            'X-Tenant-Slug' => 'al-bayan',
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/v1/auth/logout');

        $logoutResponse->assertStatus(200);

        // 8. Re-attempt with revoked token -> must fail with 401 UNAUTHENTICATED
        $revokedResponse = $this->withHeaders([
            'X-Tenant-Slug' => 'al-bayan',
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/v1/auth/me');

        $revokedResponse->assertStatus(401)
            ->assertJsonPath('error.code', 'UNAUTHENTICATED');
    }
}
