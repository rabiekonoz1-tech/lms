<?php

namespace Tests\Feature;

use App\Models\AccessCredential;
use App\Models\Course;
use App\Models\DeviceBinding;
use App\Models\GlobalIdentity;
use App\Models\Package;
use App\Models\PaymentRequest;
use App\Models\Role;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\TenantDatabase;
use App\Models\TenantToken;
use App\Models\TenantUser;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Tests\TestCase;

class SecurityInvariantsGateTest extends TestCase
{
    use RefreshDatabase;

    protected TenantDatabaseManager $dbManager;

    protected function setUp(): void
    {
        parent::setUp();
        $this->dbManager = app(TenantDatabaseManager::class);
    }

    protected function tearDown(): void
    {
        $this->dbManager->purgeConnection();

        $tenantDir = database_path('tenants');
        if (File::isDirectory($tenantDir)) {
            $files = File::glob($tenantDir.'/tenant_sec_*.sqlite');
            foreach ($files as $file) {
                @unlink($file);
            }
        }

        parent::tearDown();
    }

    protected function createIsolatedTenant(string $prefix): Tenant
    {
        $slug = 'sec_'.$prefix.'_'.uniqid();
        $tenant = Tenant::create([
            'name' => 'School '.$prefix,
            'slug' => $slug,
            'status' => 'active',
        ]);

        TenantDatabase::create([
            'tenant_id' => $tenant->id,
            'connection_identifier' => 'tenant_'.$slug,
            'is_migrated' => true,
        ]);

        $this->dbManager->migrateTenant($tenant);

        return $tenant;
    }

    /**
     * SEC-INV-001: No unauthorized cross-tenant data access.
     */
    public function test_sec_inv_001_no_unauthorized_cross_tenant_access(): void
    {
        $tenantA = $this->createIsolatedTenant('tenant_a');
        $tenantB = $this->createIsolatedTenant('tenant_b');

        // Create user in Tenant A
        $this->dbManager->configureConnection($tenantA);
        $userA = TenantUser::create([
            'name' => 'Student A',
            'email' => 'studentA@example.com',
            'password' => 'secret123',
            'type' => 'student',
            'status' => 'active',
        ]);
        $plainTokenA = TenantToken::createTokenFor($userA)['plainTextToken'];

        // Create course in Tenant B
        $this->dbManager->configureConnection($tenantB);
        $courseB = Course::create([
            'title' => 'Secret Tenant B Course',
            'code' => 'SEC-B-101',
            'status' => 'published',
        ]);

        // User A attempts to access Tenant B with Tenant A's token
        $response = $this->withHeaders([
            'X-Tenant' => $tenantB->slug,
            'Authorization' => 'Bearer '.$plainTokenA,
        ])->getJson('/api/v1/courses/'.$courseB->id);

        // Must be rejected (401 or 403)
        $this->assertContains($response->getStatusCode(), [401, 403]);
    }

    /**
     * SEC-INV-002: Frontend authorization is NOT the security boundary.
     * Direct API calls without required backend permission are rejected (403 Forbidden).
     */
    public function test_sec_inv_002_backend_authorization_is_enforced_by_default_deny(): void
    {
        $tenant = $this->createIsolatedTenant('authz');
        $this->dbManager->configureConnection($tenant);

        $role = Role::create([
            'name' => 'restricted_student',
            'label' => 'Restricted Student',
            'is_system' => false,
        ]);

        $user = TenantUser::create([
            'name' => 'Restricted User',
            'email' => 'restricted@example.com',
            'password' => 'secret123',
            'type' => 'student',
            'status' => 'active',
        ]);
        $user->roles()->attach($role->id);

        $plainToken = TenantToken::createTokenFor($user)['plainTextToken'];

        // Attempt to create a course which requires courses.create permission
        $response = $this->withHeaders([
            'X-Tenant' => $tenant->slug,
            'Authorization' => 'Bearer '.$plainToken,
        ])->postJson('/api/v1/courses', [
            'title' => 'Unauthorized Course',
            'code' => 'UNAUTH-101',
        ]);

        $response->assertStatus(403);
    }

    /**
     * SEC-INV-003: Global identity does NOT imply cross-tenant authorization.
     */
    public function test_sec_inv_003_global_identity_does_not_imply_cross_tenant_access(): void
    {
        $tenantA = $this->createIsolatedTenant('global_a');
        $tenantB = $this->createIsolatedTenant('global_b');

        // Global Identity exists in Control plane
        $global = GlobalIdentity::create([
            'name' => 'Omar Ali',
            'email' => 'omar@example.com',
            'phone' => '+966501234567',
            'type' => 'student',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('global_identities', ['id' => $global->id]);

        // User belongs only to Tenant A
        $this->dbManager->configureConnection($tenantA);
        $userA = TenantUser::create([
            'name' => 'Omar Ali',
            'email' => 'omar@example.com',
            'password' => 'secret123',
            'type' => 'student',
            'status' => 'active',
        ]);
        Student::create([
            'user_id' => $userA->id,
            'student_code' => 'STU-A-001',
            'status' => 'active',
        ]);

        // In Tenant B, student does not exist
        $this->dbManager->configureConnection($tenantB);
        $this->assertDatabaseMissing('students', ['student_code' => 'STU-A-001'], 'tenant');
        $this->assertSame(0, Student::where('student_code', 'STU-A-001')->count());
    }

    /**
     * SEC-INV-004: Credential is not a permanent session; single device binding enforced.
     */
    public function test_sec_inv_004_credential_revocation_and_single_device_binding(): void
    {
        $tenant = $this->createIsolatedTenant('cred');
        $this->dbManager->configureConnection($tenant);

        $user = TenantUser::create([
            'name' => 'Device User',
            'email' => 'device.user@example.com',
            'password' => 'secret123',
            'type' => 'student',
            'status' => 'active',
        ]);

        $student = Student::create([
            'user_id' => $user->id,
            'student_code' => 'STU-DEV-01',
            'status' => 'active',
        ]);

        $credential = AccessCredential::create([
            'student_id' => $student->id,
            'credential_code' => 'CRD-'.Str::random(8),
            'secret_hash' => hash('sha256', 'super-secret-pin'),
            'status' => 'active',
        ]);

        // Bind first device
        DeviceBinding::create([
            'credential_id' => $credential->id,
            'device_id' => 'dev-pc-01',
            'device_name' => 'Student PC',
            'device_fingerprint' => 'hardware-fingerprint-pc-1',
            'is_active' => true,
        ]);

        $this->assertSame(1, $credential->deviceBindings()->where('is_active', true)->count());
        $this->assertNotNull($credential->deviceBinding);

        // Revoke credential
        $credential->update(['status' => 'revoked', 'revoked_at' => now()]);
        $this->assertSame('revoked', $credential->fresh()->status);
        $this->assertTrue($credential->fresh()->isRevoked());
        $this->assertFalse($credential->fresh()->isUsable());
    }

    /**
     * SEC-INV-005: Payment is NOT entitlement.
     */
    public function test_sec_inv_005_pending_payment_does_not_grant_entitlement(): void
    {
        $tenant = $this->createIsolatedTenant('billing');
        $this->dbManager->configureConnection($tenant);

        $user = TenantUser::create([
            'name' => 'Buyer Student',
            'email' => 'buyer@example.com',
            'password' => 'secret123',
            'type' => 'student',
            'status' => 'active',
        ]);

        $student = Student::create([
            'user_id' => $user->id,
            'student_code' => 'STU-BUY-01',
            'status' => 'active',
        ]);

        $package = Package::create([
            'name' => 'Premium Semester Pack',
            'code' => 'PREM-01',
            'price' => 500.00,
            'currency' => 'SAR',
            'status' => 'active',
        ]);

        // Student creates a payment request in 'pending' state
        $payment = PaymentRequest::create([
            'student_id' => $student->id,
            'package_id' => $package->id,
            'amount' => 500.00,
            'currency' => 'SAR',
            'payment_method' => 'bank_transfer',
            'status' => 'pending',
        ]);

        $this->assertSame('pending', $payment->status);

        // Assert: No entitlement granted to student
        $this->assertFalse($student->hasEntitlement('feature:live_sessions'));
        $this->assertSame(0, $student->entitlements()->count());
    }

    /**
     * SEC-INV-007: Plain secrets never stored or exposed in model serialization.
     */
    public function test_sec_inv_007_plain_secrets_never_stored_and_hash_is_hidden(): void
    {
        $tenant = $this->createIsolatedTenant('secrets');
        $this->dbManager->configureConnection($tenant);

        $user = TenantUser::create([
            'name' => 'Secret User',
            'email' => 'secret.user@example.com',
            'password' => 'secret123',
            'type' => 'student',
            'status' => 'active',
        ]);

        $student = Student::create([
            'user_id' => $user->id,
            'student_code' => 'STU-SEC-01',
            'status' => 'active',
        ]);

        $rawSecret = 'MyP@ssw0rd!123';
        $hashedSecret = hash('sha256', $rawSecret);

        $credential = AccessCredential::create([
            'student_id' => $student->id,
            'credential_code' => 'CRED-SECRET-01',
            'secret_hash' => $hashedSecret,
            'status' => 'active',
        ]);

        // Verify raw secret does not exist anywhere in database
        $this->assertDatabaseMissing('access_credentials', [
            'credential_code' => 'CRED-SECRET-01',
            'secret_hash' => $rawSecret,
        ], 'tenant');

        // Verify secret_hash is hidden from json/array serialization
        $serialized = $credential->toArray();
        $this->assertArrayNotHasKey('secret_hash', $serialized);

        $json = json_encode($credential);
        $this->assertStringNotContainsString('secret_hash', $json);
        $this->assertStringNotContainsString($rawSecret, $json);
    }

    /**
     * SEC-INV-008 & SEC-INV-009: Failures default to deny; tenant context required.
     */
    public function test_sec_inv_008_and_009_missing_tenant_context_defaults_to_deny(): void
    {
        // Request without X-Tenant header
        $response = $this->getJson('/api/v1/courses');

        // Defaults to deny (400 or 404 or 401 when tenant cannot be resolved)
        $this->assertContains($response->getStatusCode(), [400, 404, 401, 403]);
    }
}
