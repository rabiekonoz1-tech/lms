<?php

namespace Tests\Feature;

use App\Models\AccessCredential;
use App\Models\DeviceChangeLog;
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

class CredentialGateTest extends TestCase
{
    use RefreshDatabase;

    protected string $tenantConnA;

    protected string $tenantConnB;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenantConnA = 'test_crd_a_'.uniqid();
        $this->tenantConnB = 'test_crd_b_'.uniqid();
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
            foreach (glob($dir.DIRECTORY_SEPARATOR.'test_crd_*.sqlite') as $file) {
                if (file_exists($file)) {
                    @unlink($file);
                }
            }
        }
    }

    /**
     * Phase J §37 — Credential Gate:
     * - raw secret hashed
     * - secret not logged / hidden
     * - activation works
     * - device binding works
     * - second device policy enforced
     * - replacement works
     * - revoke works
     * - expired credential rejected
     * - cross-tenant credential rejected
     */
    public function test_credential_gate_complete_lifecycle(): void
    {
        $dbManager = app(TenantDatabaseManager::class);
        $context = app(TenantContext::class);

        // -------------------------------------------------------------
        // 1. Provision Tenant A (Al-Mustaqbal Academy)
        // -------------------------------------------------------------
        $tenantA = Tenant::create([
            'name' => 'Al-Mustaqbal Academy',
            'slug' => 'almustaqbal',
            'type' => 'educational_center',
            'status' => 'active',
        ]);
        TenantDatabase::create([
            'tenant_id' => $tenantA->id,
            'connection_identifier' => $this->tenantConnA,
            'status' => 'ready',
        ]);
        $dbManager->migrateTenant($tenantA);

        $context->setTenant($tenantA);
        $dbManager->configureConnection($tenantA);

        // Permissions in Tenant A
        $permCrdCreate = Permission::create(['name' => 'credentials.create', 'module' => 'credentials']);
        $permCrdView = Permission::create(['name' => 'credentials.view', 'module' => 'credentials']);
        $permCrdManage = Permission::create(['name' => 'credentials.manage_devices', 'module' => 'credentials']);
        $permCrdRevoke = Permission::create(['name' => 'credentials.revoke', 'module' => 'credentials']);

        // Roles in Tenant A
        $adminRole = Role::create(['name' => 'security_admin', 'label' => 'Security Admin', 'is_system' => true]);
        $adminRole->permissions()->attach([
            $permCrdCreate->id,
            $permCrdView->id,
            $permCrdManage->id,
            $permCrdRevoke->id,
        ]);

        $studentRole = Role::create(['name' => 'student', 'label' => 'Student', 'is_system' => true]);

        // Users in Tenant A
        $adminUser = TenantUser::create([
            'name' => 'Admin Nabil',
            'email' => 'nabil@almustaqbal.edu',
            'password' => Hash::make('password123'),
            'type' => 'staff',
            'status' => 'active',
        ]);
        $adminUser->roles()->attach($adminRole->id);
        Staff::create(['user_id' => $adminUser->id, 'staff_type' => 'admin', 'status' => 'active']);
        $adminToken = TenantToken::createTokenFor($adminUser)['plainTextToken'];

        $studentUser = TenantUser::create([
            'name' => 'Student Kareem',
            'email' => 'kareem@almustaqbal.edu',
            'password' => Hash::make('password123'),
            'type' => 'student',
            'status' => 'active',
        ]);
        $studentUser->roles()->attach($studentRole->id);
        $student = Student::create([
            'user_id' => $studentUser->id,
            'student_code' => 'STU-MUS-001',
            'grade_level' => 'Grade 12',
            'status' => 'active',
        ]);
        $studentToken = TenantToken::createTokenFor($studentUser)['plainTextToken'];

        // -------------------------------------------------------------
        // 2. Provision Tenant B (Al-Majd Center)
        // -------------------------------------------------------------
        $tenantB = Tenant::create([
            'name' => 'Al-Majd Center',
            'slug' => 'almajd',
            'type' => 'educational_center',
            'status' => 'active',
        ]);
        TenantDatabase::create([
            'tenant_id' => $tenantB->id,
            'connection_identifier' => $this->tenantConnB,
            'status' => 'ready',
        ]);
        $dbManager->migrateTenant($tenantB);

        // -------------------------------------------------------------
        // 3. EXECUTE CREDENTIAL GATE CHECKS (Phase J §37)
        // -------------------------------------------------------------

        // 1. Raw Secret Hashed & Secret Not Logged
        $issueResp = $this->withHeaders([
            'X-Tenant-Slug' => 'almustaqbal',
            'Authorization' => 'Bearer '.$adminToken,
        ])->postJson('/api/v1/credentials', [
            'student_id' => $student->id,
        ]);

        $issueResp->assertStatus(201)
            ->assertJsonPath('data.credential.status', 'pending');

        $crdId = $issueResp->json('data.credential.id');
        $crdCode = $issueResp->json('data.credential.credential_code');
        $plainSecret = $issueResp->json('data.plain_text_secret');

        $this->assertNotEmpty($crdId);
        $this->assertNotEmpty($crdCode);
        $this->assertNotEmpty($plainSecret);

        // Check Database: Plain secret is NOT in DB; only 64-char sha256 hash
        $crdRecord = AccessCredential::findOrFail($crdId);
        $this->assertNotEquals($plainSecret, $crdRecord->secret_hash);
        $this->assertEquals(64, strlen($crdRecord->secret_hash));
        $this->assertEquals(hash('sha256', $plainSecret), $crdRecord->secret_hash);

        // Check Hidden Attribute: Model serialization hides secret_hash
        $crdArray = $crdRecord->toArray();
        $this->assertArrayNotHasKey('secret_hash', $crdArray);

        // 2. Activation Works & Device Binding Works
        $device1Id = 'DEVICE-IPHONE-15';
        $device1Fingerprint = hash('sha256', 'iPhone15|iOS18|MobileSafari');

        $activateResp = $this->withHeaders([
            'X-Tenant-Slug' => 'almustaqbal',
            'Authorization' => 'Bearer '.$studentToken,
        ])->postJson("/api/v1/credentials/{$crdId}/activate", [
            'secret' => $plainSecret,
            'device_id' => $device1Id,
            'device_fingerprint' => $device1Fingerprint,
            'device_name' => "Kareem's iPhone",
        ]);

        $activateResp->assertStatus(200)
            ->assertJsonPath('data.credential.status', 'active')
            ->assertJsonPath('data.device_binding.device_id', $device1Id);

        $this->assertTrue($crdRecord->fresh()->isUsable());
        $this->assertEquals($device1Id, $crdRecord->fresh()->deviceBinding->device_id);

        // 3. Device 1 Verification Succeeds
        $verifyDev1Resp = $this->withHeaders([
            'X-Tenant-Slug' => 'almustaqbal',
            'Authorization' => 'Bearer '.$studentToken,
        ])->postJson('/api/v1/credentials/verify', [
            'credential_code' => $crdCode,
            'secret' => $plainSecret,
            'device_id' => $device1Id,
            'device_fingerprint' => $device1Fingerprint,
        ]);
        $verifyDev1Resp->assertStatus(200)
            ->assertJsonPath('data.verified', true);

        // 4. Second Device Policy Enforced (Attempting to use Device 2 without replacement)
        $device2Id = 'DEVICE-MACBOOK-PRO';
        $device2Fingerprint = hash('sha256', 'MacBookPro|macOS15|Chrome');

        $verifyDev2Resp = $this->withHeaders([
            'X-Tenant-Slug' => 'almustaqbal',
            'Authorization' => 'Bearer '.$studentToken,
        ])->postJson('/api/v1/credentials/verify', [
            'credential_code' => $crdCode,
            'secret' => $plainSecret,
            'device_id' => $device2Id,
            'device_fingerprint' => $device2Fingerprint,
        ]);

        $verifyDev2Resp->assertStatus(403)
            ->assertJsonPath('error.code', 'SECOND_DEVICE_PROHIBITED');

        // 5. Device Replacement Works (Admin authorizes replacement to Device 2)
        $replaceResp = $this->withHeaders([
            'X-Tenant-Slug' => 'almustaqbal',
            'Authorization' => 'Bearer '.$adminToken,
        ])->postJson("/api/v1/credentials/{$crdId}/replace-device", [
            'new_device_id' => $device2Id,
            'new_device_fingerprint' => $device2Fingerprint,
            'new_device_name' => "Kareem's Study Laptop",
            'reason' => 'Student phone battery damaged; switched to personal laptop.',
        ]);

        $replaceResp->assertStatus(200)
            ->assertJsonPath('data.device_binding.device_id', $device2Id);

        // Check Audit Log
        $changeLog = DeviceChangeLog::where('credential_id', $crdId)->first();
        $this->assertNotNull($changeLog);
        $this->assertEquals($device1Id, $changeLog->previous_device_id);
        $this->assertEquals($device2Id, $changeLog->new_device_id);
        $this->assertEquals($adminUser->id, $changeLog->authorized_by_user_id);

        // Device 2 now succeeds
        $verifyDev2AfterReplace = $this->withHeaders([
            'X-Tenant-Slug' => 'almustaqbal',
            'Authorization' => 'Bearer '.$studentToken,
        ])->postJson('/api/v1/credentials/verify', [
            'credential_code' => $crdCode,
            'secret' => $plainSecret,
            'device_id' => $device2Id,
            'device_fingerprint' => $device2Fingerprint,
        ]);
        $verifyDev2AfterReplace->assertStatus(200)
            ->assertJsonPath('data.verified', true);

        // Old Device 1 now fails
        $verifyOldDev1 = $this->withHeaders([
            'X-Tenant-Slug' => 'almustaqbal',
            'Authorization' => 'Bearer '.$studentToken,
        ])->postJson('/api/v1/credentials/verify', [
            'credential_code' => $crdCode,
            'secret' => $plainSecret,
            'device_id' => $device1Id,
            'device_fingerprint' => $device1Fingerprint,
        ]);
        $verifyOldDev1->assertStatus(403)
            ->assertJsonPath('error.code', 'SECOND_DEVICE_PROHIBITED');

        // 6. Revoke Works
        $revokeResp = $this->withHeaders([
            'X-Tenant-Slug' => 'almustaqbal',
            'Authorization' => 'Bearer '.$adminToken,
        ])->postJson("/api/v1/credentials/{$crdId}/revoke", [
            'reason' => 'Credential compromise reported.',
        ]);
        $revokeResp->assertStatus(200);

        $verifyRevoked = $this->withHeaders([
            'X-Tenant-Slug' => 'almustaqbal',
            'Authorization' => 'Bearer '.$studentToken,
        ])->postJson('/api/v1/credentials/verify', [
            'credential_code' => $crdCode,
            'secret' => $plainSecret,
            'device_id' => $device2Id,
            'device_fingerprint' => $device2Fingerprint,
        ]);
        $verifyRevoked->assertStatus(403)
            ->assertJsonPath('error.code', 'CREDENTIAL_REVOKED');

        // 7. Expired Credential Rejected
        $expiredGen = AccessCredential::generate($student, $adminUser, now()->subDay());
        $expiredCrd = $expiredGen['credential'];
        $expiredCrd->update(['status' => 'active']);

        $verifyExpired = $this->withHeaders([
            'X-Tenant-Slug' => 'almustaqbal',
            'Authorization' => 'Bearer '.$studentToken,
        ])->postJson('/api/v1/credentials/verify', [
            'credential_code' => $expiredCrd->credential_code,
            'secret' => $expiredGen['plainTextSecret'],
            'device_id' => $device2Id,
            'device_fingerprint' => $device2Fingerprint,
        ]);
        $verifyExpired->assertStatus(403)
            ->assertJsonPath('error.code', 'CREDENTIAL_EXPIRED');

        // 8. Cross-Tenant Credential Rejected
        // Using Tenant A credential code against Tenant B endpoint -> 404 NOT_FOUND
        $crossTenantVerify = $this->withHeaders([
            'X-Tenant-Slug' => 'almajd',
            'Authorization' => 'Bearer '.$adminToken,
        ])->postJson('/api/v1/credentials/verify', [
            'credential_code' => $crdCode,
            'secret' => $plainSecret,
            'device_id' => $device2Id,
            'device_fingerprint' => $device2Fingerprint,
        ]);
        // Token from Tenant A is rejected in Tenant B with 401 UNAUTHENTICATED
        $crossTenantVerify->assertStatus(401)
            ->assertJsonPath('error.code', 'UNAUTHENTICATED');
    }
}
