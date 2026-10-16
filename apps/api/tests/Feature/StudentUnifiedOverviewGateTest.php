<?php

namespace Tests\Feature;

use App\Models\GlobalIdentity;
use App\Models\StudentIdentityLink;
use App\Models\Tenant;
use App\Models\TenantDatabase;
use App\Models\TenantDomain;
use App\Models\TenantToken;
use App\Models\TenantUser;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class StudentUnifiedOverviewGateTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        foreach (['tenant_alpha', 'tenant_beta'] as $slug) {
            DB::disconnect($slug);
            $dbPath = database_path("tenants/{$slug}.sqlite");
            if (file_exists($dbPath)) {
                @unlink($dbPath);
            }
        }
        parent::tearDown();
    }

    public function test_student_can_fetch_unified_multi_tenant_academies_overview()
    {
        $dbManager = app(TenantDatabaseManager::class);

        // 1. Create Tenant Alpha
        $tenantAlpha = Tenant::create([
            'name' => 'Alpha Science Academy',
            'slug' => 'alpha',
            'type' => 'school',
            'status' => 'active',
            'primary_color' => '#04c3c9',
        ]);
        TenantDomain::create(['tenant_id' => $tenantAlpha->id, 'domain' => 'alpha.localhost', 'active' => true]);
        TenantDatabase::create(['tenant_id' => $tenantAlpha->id, 'connection_identifier' => 'tenant_alpha', 'status' => 'ready']);
        $dbManager->migrateTenant($tenantAlpha);

        // 2. Create Tenant Beta
        $tenantBeta = Tenant::create([
            'name' => 'Beta Language Institute',
            'slug' => 'beta',
            'type' => 'educational_center',
            'status' => 'active',
            'primary_color' => '#8b5cf6',
        ]);
        TenantDomain::create(['tenant_id' => $tenantBeta->id, 'domain' => 'beta.localhost', 'active' => true]);
        TenantDatabase::create(['tenant_id' => $tenantBeta->id, 'connection_identifier' => 'tenant_beta', 'status' => 'ready']);
        $dbManager->migrateTenant($tenantBeta);

        // 3. Create Global Identity for Student "Zaid"
        $globalZaid = GlobalIdentity::create([
            'name' => 'Zaid Al-Mansoor',
            'email' => 'zaid@student.local',
            'phone' => '+966501234567',
            'type' => 'student',
            'status' => 'active',
        ]);

        // 4. Create Tenant User in Alpha
        $dbManager->configureConnection($tenantAlpha);
        $userAlpha = TenantUser::create([
            'name' => 'Zaid Al-Mansoor',
            'email' => 'zaid@student.local',
            'phone' => '+966501234567',
            'password' => 'secret',
            'type' => 'student',
            'status' => 'active',
        ]);
        $tokenData = TenantToken::createTokenFor($userAlpha, 'alpha_token');

        // Link in Control DB
        StudentIdentityLink::create([
            'global_identity_id' => $globalZaid->id,
            'tenant_id' => $tenantAlpha->id,
            'tenant_student_id' => $userAlpha->id,
        ]);

        // Link in Beta
        StudentIdentityLink::create([
            'global_identity_id' => $globalZaid->id,
            'tenant_id' => $tenantBeta->id,
            'tenant_student_id' => '00000000-0000-0000-0000-000000000099',
        ]);

        // 5. Query /api/v1/student/academies from Alpha
        $response = $this->withHeaders([
            'X-Tenant' => 'alpha',
            'Authorization' => "Bearer {$tokenData['plainTextToken']}",
        ])->getJson('/api/v1/student/academies');

        $response->assertStatus(200)
            ->assertJsonPath('data.total_academies', 2)
            ->assertJsonPath('data.global_identity.name', 'Zaid Al-Mansoor')
            ->assertJsonPath('data.academies.0.name', 'Alpha Science Academy')
            ->assertJsonPath('data.academies.0.is_current', true)
            ->assertJsonPath('data.academies.1.name', 'Beta Language Institute')
            ->assertJsonPath('data.academies.1.is_current', false);
    }
}
