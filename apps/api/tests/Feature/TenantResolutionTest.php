<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Models\TenantFeature;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantResolutionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test tenant resolution via X-Tenant-Slug header.
     */
    public function test_resolves_tenant_via_slug_header(): void
    {
        $tenant = Tenant::create([
            'name' => 'Al-Amal Educational Center',
            'slug' => 'al-amal',
            'type' => 'educational_center',
            'status' => 'active',
        ]);

        TenantFeature::create([
            'tenant_id' => $tenant->id,
            'feature_key' => 'online_exams',
            'enabled' => true,
        ]);

        $response = $this->withHeaders([
            'X-Tenant-Slug' => 'al-amal',
        ])->getJson('/api/v1/tenant/current');

        $response->assertStatus(200)
            ->assertHeader('X-Tenant-ID', $tenant->id)
            ->assertHeader('X-Tenant-Slug', 'al-amal')
            ->assertJsonPath('data.id', $tenant->id)
            ->assertJsonPath('data.slug', 'al-amal')
            ->assertJsonPath('data.name', 'Al-Amal Educational Center')
            ->assertJsonPath('data.features', ['online_exams']);
    }

    /**
     * Test tenant resolution via X-Tenant-ID header.
     */
    public function test_resolves_tenant_via_id_header(): void
    {
        $tenant = Tenant::create([
            'name' => 'Teacher Ahmed Academy',
            'slug' => 'teacher-ahmed',
            'type' => 'individual_teacher',
            'status' => 'active',
        ]);

        $response = $this->withHeaders([
            'X-Tenant-ID' => $tenant->id,
        ])->getJson('/api/v1/tenant/current');

        $response->assertStatus(200)
            ->assertJsonPath('data.slug', 'teacher-ahmed');
    }

    /**
     * Test tenant resolution via registered custom domain.
     */
    public function test_resolves_tenant_via_domain_mapping(): void
    {
        $tenant = Tenant::create([
            'name' => 'Riyadh Center',
            'slug' => 'riyadh-center',
            'type' => 'educational_center',
            'status' => 'active',
        ]);

        TenantDomain::create([
            'tenant_id' => $tenant->id,
            'domain' => 'academy.riyadh.sa',
            'type' => 'custom',
            'active' => true,
        ]);

        $response = $this->getJson('http://academy.riyadh.sa/api/v1/tenant/current');

        $response->assertStatus(200)
            ->assertJsonPath('data.slug', 'riyadh-center');
    }

    /**
     * Test non-existent tenant returns 404 TENANT_NOT_FOUND.
     */
    public function test_unknown_tenant_returns_404_tenant_not_found(): void
    {
        $response = $this->withHeaders([
            'X-Tenant-Slug' => 'non-existent-tenant',
        ])->getJson('/api/v1/tenant/current');

        $response->assertStatus(404)
            ->assertJsonPath('error.code', 'TENANT_NOT_FOUND');
    }

    /**
     * Test suspended or inactive tenant returns 403 TENANT_INACTIVE.
     */
    public function test_suspended_tenant_returns_403_tenant_inactive(): void
    {
        Tenant::create([
            'name' => 'Suspended Center',
            'slug' => 'suspended-center',
            'type' => 'educational_center',
            'status' => 'suspended',
        ]);

        $response = $this->withHeaders([
            'X-Tenant-Slug' => 'suspended-center',
        ])->getJson('/api/v1/tenant/current');

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'TENANT_INACTIVE');
    }
}
