<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantCourse;
use App\Models\TenantDatabase;
use App\Tenancy\TenantContext;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
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
            foreach (glob($dir.DIRECTORY_SEPARATOR.'test_tenant_*.sqlite') as $file) {
                if (file_exists($file)) {
                    @unlink($file);
                }
            }
        }
    }

    /**
     * Test Tenant Gate: Strict isolation between Tenant A and Tenant B databases.
     */
    public function test_tenant_database_isolation_gate(): void
    {
        $dbManager = app(TenantDatabaseManager::class);
        $context = app(TenantContext::class);
        $runId = uniqid();

        // 1. Provision Tenant A
        $tenantA = Tenant::create([
            'name' => 'Tenant A Academy',
            'slug' => 'tenant-a-'.$runId,
            'type' => 'individual_teacher',
            'status' => 'active',
        ]);

        TenantDatabase::create([
            'tenant_id' => $tenantA->id,
            'connection_identifier' => 'test_tenant_a_'.$runId,
            'status' => 'ready',
        ]);

        // 2. Provision Tenant B
        $tenantB = Tenant::create([
            'name' => 'Tenant B Center',
            'slug' => 'tenant-b-'.$runId,
            'type' => 'educational_center',
            'status' => 'active',
        ]);

        TenantDatabase::create([
            'tenant_id' => $tenantB->id,
            'connection_identifier' => 'test_tenant_b_'.$runId,
            'status' => 'ready',
        ]);

        // 3. Migrate both tenant databases
        $dbManager->migrateTenant($tenantA);
        $dbManager->migrateTenant($tenantB);

        // 4. Populate Tenant A data
        $context->setTenant($tenantA);
        $dbManager->configureConnection($tenantA);

        $courseA = TenantCourse::create([
            'title' => 'Math 101',
            'code' => 'MATH101',
        ]);

        $this->assertEquals(1, TenantCourse::count());
        $this->assertEquals('Math 101', TenantCourse::first()->title);

        // 5. Populate Tenant B data
        $context->setTenant($tenantB);
        $dbManager->configureConnection($tenantB);

        $courseB = TenantCourse::create([
            'title' => 'Physics 201',
            'code' => 'PHYS201',
        ]);

        $this->assertEquals(1, TenantCourse::count());
        $this->assertEquals('Physics 201', TenantCourse::first()->title);

        // 6. Verify Tenant B CANNOT see Tenant A data
        $this->assertFalse(TenantCourse::where('title', 'Math 101')->exists());
        $this->assertNull(TenantCourse::find($courseA->id));

        // 7. Switch back to Tenant A and verify Tenant A CANNOT see Tenant B data
        $context->setTenant($tenantA);
        $dbManager->configureConnection($tenantA);

        $this->assertEquals(1, TenantCourse::count());
        $this->assertEquals('Math 101', TenantCourse::first()->title);
        $this->assertFalse(TenantCourse::where('title', 'Physics 201')->exists());
        $this->assertNull(TenantCourse::find($courseB->id));
    }
}
