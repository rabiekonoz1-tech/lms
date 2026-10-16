<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantDatabase;
use App\Models\TenantDomain;
use App\Models\TenantToken;
use App\Models\TenantUser;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SystemAlertNotification extends Notification
{
    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title' => 'System Alert',
            'message' => 'This is a test alert.',
        ];
    }
}

class NotificationGateTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected TenantUser $user;

    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create a dummy tenant
        $this->tenant = Tenant::create([
            'slug' => 'test-academy',
            'name' => 'Test Academy',
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
            'domain' => 'test-academy.localhost',
            'active' => true,
        ]);

        // 2. Migrate the tenant DB
        $dbManager = app(TenantDatabaseManager::class);
        $dbManager->migrateTenant($this->tenant);
        $dbManager->configureConnection($this->tenant);

        // 3. Create a tenant user
        $this->user = TenantUser::create([
            'name' => 'John Doe',
            'email' => 'john@test-academy.com',
            'password' => 'secret',
            'type' => 'student',
            'status' => 'active',
        ]);

        // 4. Create token
        $tokenData = TenantToken::createTokenFor($this->user);
        $this->token = $tokenData['plainTextToken'];
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

    public function test_can_fetch_notifications()
    {
        $this->user->notify(new SystemAlertNotification);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$this->token,
            'X-Tenant' => 'test-academy',
        ])->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'notifications' => [
                        '*' => ['id', 'data', 'read_at', 'created_at'],
                    ],
                    'meta' => ['unread_count'],
                ],
            ]);

        $this->assertEquals(1, $response->json('data.meta.unread_count'));
        $this->assertCount(1, $response->json('data.notifications'));
    }

    public function test_can_mark_notification_as_read()
    {
        $this->user->notify(new SystemAlertNotification);
        $notification = $this->user->notifications()->first();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$this->token,
            'X-Tenant' => 'test-academy',
        ])->postJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(200);

        $this->assertNotNull($notification->fresh()->read_at);

        $response2 = $this->withHeaders([
            'Authorization' => 'Bearer '.$this->token,
            'X-Tenant' => 'test-academy',
        ])->getJson('/api/v1/notifications');

        $this->assertEquals(0, $response2->json('data.meta.unread_count'));
    }

    public function test_can_mark_all_notifications_as_read()
    {
        $this->user->notify(new SystemAlertNotification);
        $this->user->notify(new SystemAlertNotification);

        $this->assertEquals(2, $this->user->unreadNotifications()->count());

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$this->token,
            'X-Tenant' => 'test-academy',
        ])->postJson('/api/v1/notifications/read-all');

        $response->assertStatus(200);

        $this->assertEquals(0, $this->user->unreadNotifications()->count());
    }
}
