<?php

namespace Tests\Feature;

use App\Domain\Integrations\Media\MockVideoProvider;
use App\Domain\Integrations\Meetings\MockMeetingProvider;
use App\Models\Meeting;
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
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class IntegrationGateTest extends TestCase
{
    use RefreshDatabase;

    protected string $tenantConnA;

    protected string $tenantConnB;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenantConnA = 'test_int_a_'.uniqid();
        $this->tenantConnB = 'test_int_b_'.uniqid();
        $this->cleanupTestDatabases();
        MockMeetingProvider::reset();
        MockVideoProvider::reset();
        Config::set('services.integrations.webhook_secret', 'secret-key-123');
    }

    protected function tearDown(): void
    {
        MockMeetingProvider::reset();
        MockVideoProvider::reset();
        $this->cleanupTestDatabases();
        parent::tearDown();
    }

    protected function cleanupTestDatabases(): void
    {
        app(TenantDatabaseManager::class)->purgeConnection();
        $dir = database_path('tenants');
        if (is_dir($dir)) {
            foreach (glob($dir.DIRECTORY_SEPARATOR.'test_int_*.sqlite') as $file) {
                if (file_exists($file)) {
                    @unlink($file);
                }
            }
        }
    }

    /**
     * Helper to setup tenant with users and permissions.
     */
    protected function setupTenant(string $slug, string $dbName): array
    {
        $dbManager = app(TenantDatabaseManager::class);
        $context = app(TenantContext::class);

        $tenant = Tenant::create([
            'name' => 'Tenant '.$slug,
            'slug' => $slug,
            'type' => 'educational_center',
            'status' => 'active',
        ]);

        TenantDatabase::create([
            'tenant_id' => $tenant->id,
            'connection_identifier' => $dbName,
            'status' => 'ready',
        ]);

        $dbManager->migrateTenant($tenant);

        $context->setTenant($tenant);
        $dbManager->configureConnection($tenant);

        // Permissions
        $perms = [
            'meetings.view' => Permission::create(['name' => 'meetings.view', 'module' => 'meetings']),
            'meetings.create' => Permission::create(['name' => 'meetings.create', 'module' => 'meetings']),
            'meetings.manage' => Permission::create(['name' => 'meetings.manage', 'module' => 'meetings']),
            'media.view' => Permission::create(['name' => 'media.view', 'module' => 'media']),
            'media.upload' => Permission::create(['name' => 'media.upload', 'module' => 'media']),
        ];

        // Admin role with all perms
        $adminRole = Role::create(['name' => 'admin', 'label' => 'Administrator']);
        foreach ($perms as $perm) {
            $adminRole->permissions()->attach($perm->id);
        }

        // Student role with only view perms
        $studentRole = Role::create(['name' => 'student', 'label' => 'Student']);
        $studentRole->permissions()->attach($perms['meetings.view']->id);
        $studentRole->permissions()->attach($perms['media.view']->id);

        // Admin staff user
        $adminUser = TenantUser::create([
            'name' => 'Admin '.$slug,
            'email' => "admin@{$slug}.local",
            'password' => Hash::make('password123'),
            'type' => 'staff',
            'status' => 'active',
        ]);
        $adminStaff = Staff::create(['user_id' => $adminUser->id, 'staff_type' => 'admin']);
        $adminUser->roles()->attach($adminRole->id);

        $adminToken = TenantToken::createTokenFor($adminUser)['plainTextToken'];

        // Student user
        $studentUser = TenantUser::create([
            'name' => 'Student '.$slug,
            'email' => "student@{$slug}.local",
            'password' => Hash::make('password123'),
            'type' => 'student',
            'status' => 'active',
        ]);
        $student = Student::create(['user_id' => $studentUser->id, 'student_code' => 'STU-'.$slug]);
        $studentUser->roles()->attach($studentRole->id);

        $studentToken = TenantToken::createTokenFor($studentUser)['plainTextToken'];

        return [
            'tenant' => $tenant,
            'adminUser' => $adminUser,
            'adminStaff' => $adminStaff,
            'adminToken' => $adminToken,
            'studentUser' => $studentUser,
            'student' => $student,
            'studentToken' => $studentToken,
        ];
    }

    /**
     * Phase J §40 Gate Test:
     * - provider success (create meeting, join url, upload video, embed url)
     * - provider timeout
     * - provider failure
     * - duplicate request (idempotency)
     * - external ID mapping
     * - webhook signature verification
     * - tenant isolation
     * - authorization
     */
    public function test_integration_gate_complete_suite(): void
    {
        $tenantA = $this->setupTenant('integ-a', $this->tenantConnA);
        $tenantB = $this->setupTenant('integ-b', $this->tenantConnB);

        $headersA = [
            'X-Tenant-Slug' => 'integ-a',
            'Authorization' => 'Bearer '.$tenantA['adminToken'],
        ];

        $headersB = [
            'X-Tenant-Slug' => 'integ-b',
            'Authorization' => 'Bearer '.$tenantB['adminToken'],
        ];

        $studentHeadersA = [
            'X-Tenant-Slug' => 'integ-a',
            'Authorization' => 'Bearer '.$tenantA['studentToken'],
        ];

        // -------------------------------------------------------------
        // 1. Provider Success — Meeting Creation & External ID Mapping
        // -------------------------------------------------------------
        $meetingData = [
            'title' => 'Live Physics Lecture',
            'description' => 'Thermodynamics live session',
            'provider' => 'mock',
            'duration_minutes' => 90,
            'idempotency_key' => 'idemp-meet-001',
        ];

        $createMeetingRes = $this->postJson('/api/v1/meetings', $meetingData, $headersA);
        $createMeetingRes->assertStatus(201);
        $meetingJson = $createMeetingRes->json('data.meeting');

        $this->assertNotEmpty($meetingJson['id']);
        $this->assertNotEmpty($meetingJson['external_meeting_id']);
        $this->assertStringStartsWith('mock-', $meetingJson['external_meeting_id']);
        $this->assertNotEmpty($meetingJson['join_url']);
        $this->assertEquals('scheduled', $meetingJson['status']);

        $meetingIdA = $meetingJson['id'];
        $externalMeetingIdA = $meetingJson['external_meeting_id'];

        // -------------------------------------------------------------
        // 2. Meeting Join URL
        // -------------------------------------------------------------
        $joinRes = $this->getJson("/api/v1/meetings/{$meetingIdA}/join", $headersA);
        $joinRes->assertStatus(200)
            ->assertJsonPath('data.meeting_id', $meetingIdA)
            ->assertJsonPath('data.external_meeting_id', $externalMeetingIdA)
            ->assertJsonPath('data.provider', 'mock');

        // -------------------------------------------------------------
        // 3. Provider Success — Video Upload & Embed URL
        // -------------------------------------------------------------
        $videoData = [
            'title' => 'Calculus Chapter 1 Video',
            'provider' => 'vimeo',
            'external_id' => '987654321',
            'media_type' => 'video',
        ];

        $createVideoRes = $this->postJson('/api/v1/media', $videoData, $headersA);
        $createVideoRes->assertStatus(201);
        $videoJson = $createVideoRes->json('data.media_asset');

        $this->assertNotEmpty($videoJson['id']);
        $this->assertEquals('987654321', $videoJson['external_media_id']);
        $this->assertEquals('vimeo', $videoJson['provider']);
        $this->assertEquals('https://player.vimeo.com/video/987654321', $videoJson['embed_url']);

        $mediaIdA = $videoJson['id'];

        $embedRes = $this->getJson("/api/v1/media/{$mediaIdA}/embed", $headersA);
        $embedRes->assertStatus(200)
            ->assertJsonPath('data.embed_url', 'https://player.vimeo.com/video/987654321');

        // -------------------------------------------------------------
        // 4. Duplicate Request / Idempotency
        // -------------------------------------------------------------
        $duplicateRes = $this->postJson('/api/v1/meetings', $meetingData, $headersA);
        $duplicateRes->assertStatus(200); // 200 OK for idempotent replay
        $this->assertTrue($duplicateRes->json('data.idempotent'));
        $this->assertEquals($meetingIdA, $duplicateRes->json('data.meeting.id'));

        // -------------------------------------------------------------
        // 5. Provider Timeout Handling & Failover
        // -------------------------------------------------------------
        MockMeetingProvider::simulateTimeout(true);

        // Without failover -> Returns 504 Gateway Timeout
        $timeoutRes = $this->postJson('/api/v1/meetings', [
            'title' => 'Timeout Test',
            'provider' => 'mock',
            'enable_failover' => false,
        ], $headersA);
        $timeoutRes->assertStatus(504)
            ->assertJsonPath('error.code', 'PROVIDER_TIMEOUT');

        // Reset mock
        MockMeetingProvider::reset();

        // -------------------------------------------------------------
        // 6. Provider Failure Handling
        // -------------------------------------------------------------
        MockMeetingProvider::simulateFailure(true);

        $failRes = $this->postJson('/api/v1/meetings', [
            'title' => 'Failure Test',
            'provider' => 'mock',
            'enable_failover' => false,
        ], $headersA);
        $failRes->assertStatus(502)
            ->assertJsonPath('error.code', 'PROVIDER_ERROR');

        MockMeetingProvider::reset();

        // -------------------------------------------------------------
        // 7. Webhook Signature Verification
        // -------------------------------------------------------------
        $webhookSecret = 'secret-key-123';
        $payload = [
            'event' => 'meeting.ended',
            'meeting_id' => $externalMeetingIdA,
        ];
        $payloadRaw = json_encode($payload);

        // Valid signature
        $validSignature = hash_hmac('sha256', $payloadRaw, $webhookSecret);
        $webhookRes = $this->postJson('/api/v1/integrations/webhooks/mock', $payload, [
            'X-Tenant-Slug' => 'integ-a',
            'X-Signature' => $validSignature,
        ]);
        $webhookRes->assertStatus(200)
            ->assertJsonPath('data.event', 'meeting.ended');

        // Verify status updated to 'completed'
        $meetingUpdated = Meeting::find($meetingIdA);
        $this->assertEquals('completed', $meetingUpdated->status);

        // Invalid signature
        $invalidRes = $this->postJson('/api/v1/integrations/webhooks/mock', $payload, [
            'X-Tenant-Slug' => 'integ-a',
            'X-Signature' => 'invalid-tampered-signature',
        ]);
        $invalidRes->assertStatus(401)
            ->assertJsonPath('error.code', 'INVALID_SIGNATURE');

        // -------------------------------------------------------------
        // 8. Tenant Isolation Invariant (SEC-INV-001)
        // -------------------------------------------------------------
        // Tenant B admin tries to access Tenant A's meeting
        $crossMeetingRes = $this->getJson("/api/v1/meetings/{$meetingIdA}", $headersB);
        $crossMeetingRes->assertStatus(404);

        // Tenant B admin tries to access Tenant A's media
        $crossMediaRes = $this->getJson("/api/v1/media/{$mediaIdA}", $headersB);
        $crossMediaRes->assertStatus(404);

        // -------------------------------------------------------------
        // 9. Authorization Gate (RBAC)
        // -------------------------------------------------------------
        // Student lacks 'meetings.create'
        $unauthMeeting = $this->postJson('/api/v1/meetings', [
            'title' => 'Student Meeting',
            'provider' => 'mock',
        ], $studentHeadersA);
        $unauthMeeting->assertStatus(403);

        // Student lacks 'media.upload'
        $unauthMedia = $this->postJson('/api/v1/media', [
            'title' => 'Student Media',
            'provider' => 'mock',
        ], $studentHeadersA);
        $unauthMedia->assertStatus(403);
    }
}
