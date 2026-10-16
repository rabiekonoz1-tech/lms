<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantDatabase;
use App\Models\TenantDomain;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RateLimitingGateTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'slug' => 'throttle-test',
            'name' => 'Throttle Test Academy',
            'type' => 'school',
            'status' => 'active',
        ]);

        TenantDomain::create([
            'tenant_id' => $this->tenant->id,
            'domain' => 'throttle-test.localhost',
            'active' => true,
        ]);

        TenantDatabase::create([
            'tenant_id' => $this->tenant->id,
            'connection_identifier' => 'tenant_'.$this->tenant->slug,
            'status' => 'ready',
        ]);

        $dbManager = app(TenantDatabaseManager::class);
        $dbManager->migrateTenant($this->tenant);
        $dbManager->configureConnection($this->tenant);
    }

    protected function tearDown(): void
    {
        DB::disconnect('tenant_'.$this->tenant->slug);
        $dbPath = database_path('tenants/tenant_'.$this->tenant->slug.'.sqlite');
        if (file_exists($dbPath)) {
            @unlink($dbPath);
        }
        parent::tearDown();
    }

    public function test_auth_login_is_throttled_after_rate_limit_exceeded()
    {
        $headers = [
            'X-Tenant' => 'throttle-test',
        ];

        // Send 10 rapid login attempts (allowed by throttle:auth limit of 10/min)
        for ($i = 0; $i < 10; $i++) {
            $response = $this->withHeaders($headers)->postJson('/api/v1/auth/login', [
                'email' => 'attacker@target.local',
                'password' => 'wrongpass'.$i,
            ]);

            // First 10 should fail authentication (401 or 422), but NOT be throttled (429)
            $this->assertNotEquals(429, $response->getStatusCode());
        }

        // The 11th request MUST be rate limited (429)
        $rateLimitedResponse = $this->withHeaders($headers)->postJson('/api/v1/auth/login', [
            'email' => 'attacker@target.local',
            'password' => 'wrongpass11',
        ]);

        $rateLimitedResponse->assertStatus(429)
            ->assertJsonPath('error.code', 'RATE_LIMIT_EXCEEDED');
    }
}
