<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Tenant;
use App\Models\TenantDatabase;
use App\Tenancy\Exceptions\BackupException;
use App\Tenancy\TenantBackupService;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class TenantBackupRestoreGateTest extends TestCase
{
    use RefreshDatabase;

    protected TenantDatabaseManager $dbManager;

    protected TenantBackupService $backupService;

    protected string $testBackupsDir;

    protected function setUp(): void
    {
        parent::setUp();

        $this->dbManager = app(TenantDatabaseManager::class);
        $this->backupService = app(TenantBackupService::class);
        $this->testBackupsDir = storage_path('framework/testing/backups_test');

        if (! File::isDirectory($this->testBackupsDir)) {
            File::makeDirectory($this->testBackupsDir, 0755, true, true);
        }
    }

    protected function tearDown(): void
    {
        $this->dbManager->purgeConnection();

        if (File::isDirectory($this->testBackupsDir)) {
            File::deleteDirectory($this->testBackupsDir);
        }

        // Clean up any test tenant sqlite files
        $tenantDir = database_path('tenants');
        if (File::isDirectory($tenantDir)) {
            $files = File::glob($tenantDir.'/tenant_backup_test_*.sqlite');
            foreach ($files as $file) {
                @unlink($file);
            }
        }

        parent::tearDown();
    }

    protected function createTestTenant(string $slug): Tenant
    {
        $tenant = Tenant::create([
            'name' => 'Backup Test School',
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

    public function test_creates_verified_backup_with_sha256_checksum(): void
    {
        $slug = 'backup_test_'.uniqid();
        $tenant = $this->createTestTenant($slug);

        // Insert initial data
        Course::create([
            'title' => 'Biology 101',
            'code' => 'BIO-101',
            'description' => 'Introductory biology',
            'status' => 'published',
        ]);

        $this->assertDatabaseHas('courses', ['code' => 'BIO-101'], 'tenant');

        // Create backup
        $backupMeta = $this->backupService->createBackup($tenant, $this->testBackupsDir);

        $this->assertFileExists($backupMeta['backup_path']);
        $this->assertNotEmpty($backupMeta['checksum']);
        $this->assertGreaterThan(0, $backupMeta['size_bytes']);
        $this->assertEquals(hash_file('sha256', $backupMeta['backup_path']), $backupMeta['checksum']);
    }

    public function test_restores_tenant_database_after_data_loss(): void
    {
        $slug = 'backup_test_'.uniqid();
        $tenant = $this->createTestTenant($slug);

        Course::create([
            'title' => 'Chemistry 201',
            'code' => 'CHEM-201',
            'description' => 'Organic chemistry',
            'status' => 'published',
        ]);

        $backupMeta = $this->backupService->createBackup($tenant, $this->testBackupsDir);

        // Delete all courses (simulating accidental data loss or corruption)
        Course::truncate();
        $this->assertDatabaseMissing('courses', ['code' => 'CHEM-201'], 'tenant');
        $this->assertSame(0, Course::count());

        // Restore from backup
        $restored = $this->backupService->restoreBackup(
            $tenant,
            $backupMeta['backup_path'],
            $backupMeta['checksum']
        );

        $this->assertTrue($restored);

        // Verify data is completely restored
        $this->assertDatabaseHas('courses', ['code' => 'CHEM-201'], 'tenant');
        $this->assertSame(1, Course::count());
    }

    public function test_rejects_restoring_tampered_backup_with_checksum_mismatch(): void
    {
        $slug = 'backup_test_'.uniqid();
        $tenant = $this->createTestTenant($slug);

        Course::create([
            'title' => 'Math 101',
            'code' => 'MATH-101',
            'status' => 'published',
        ]);

        $backupMeta = $this->backupService->createBackup($tenant, $this->testBackupsDir);

        // Tamper with the backup file by appending junk data
        file_put_contents($backupMeta['backup_path'], 'CORRUPTED_BYTES', FILE_APPEND);

        $this->expectException(BackupException::class);
        $this->expectExceptionMessage('checksum mismatch');

        $this->backupService->restoreBackup(
            $tenant,
            $backupMeta['backup_path'],
            $backupMeta['checksum'] // original expected checksum
        );
    }

    public function test_sqlite_integrity_check_passes_on_valid_tenant_database(): void
    {
        $slug = 'backup_test_'.uniqid();
        $tenant = $this->createTestTenant($slug);

        $this->assertTrue($this->backupService->verifyIntegrity($tenant));
    }
}
