<?php

namespace App\Tenancy;

use App\Models\Tenant;
use App\Tenancy\Exceptions\BackupException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class TenantBackupService
{
    public function __construct(
        protected TenantDatabaseManager $dbManager
    ) {}

    /**
     * Create a verified backup snapshot of a tenant database.
     *
     * @return array{backup_path: string, checksum: string, size_bytes: int, timestamp: string}
     */
    public function createBackup(Tenant $tenant, ?string $destinationDir = null): array
    {
        $sourcePath = $this->dbManager->getDatabasePath($tenant);

        if (! $sourcePath || ! file_exists($sourcePath)) {
            throw new BackupException("Cannot backup tenant '{$tenant->slug}': Database file does not exist at '{$sourcePath}'.");
        }

        $destDir = $destinationDir ?? storage_path('app/backups/tenants');
        if (! File::isDirectory($destDir)) {
            File::makeDirectory($destDir, 0755, true, true);
        }

        $timestamp = date('Y-m-d_His');
        $fileName = "backup_{$tenant->slug}_{$timestamp}_".bin2hex(random_bytes(4)).'.sqlite';
        $destPath = $destDir.DIRECTORY_SEPARATOR.$fileName;

        if (! copy($sourcePath, $destPath)) {
            throw new BackupException("Failed to copy database file from '{$sourcePath}' to '{$destPath}'.");
        }

        $checksum = hash_file('sha256', $destPath);
        $sizeBytes = filesize($destPath);

        return [
            'backup_path' => $destPath,
            'checksum' => $checksum,
            'size_bytes' => $sizeBytes,
            'timestamp' => now()->toIso8601String(),
        ];
    }

    /**
     * Restore a tenant database from a verified backup file.
     */
    public function restoreBackup(Tenant $tenant, string $backupPath, ?string $expectedChecksum = null): bool
    {
        if (! file_exists($backupPath)) {
            throw new BackupException("Backup file not found at: '{$backupPath}'.");
        }

        if ($expectedChecksum !== null) {
            $actualChecksum = hash_file('sha256', $backupPath);
            if ($actualChecksum !== $expectedChecksum) {
                throw new BackupException("Backup file checksum mismatch. Expected: {$expectedChecksum}, got: {$actualChecksum}. Integrity compromised.");
            }
        }

        $targetPath = $this->dbManager->getDatabasePath($tenant);
        if (! $targetPath) {
            throw new BackupException("Cannot restore tenant '{$tenant->slug}': Target database path cannot be determined.");
        }

        // Purge active connection to release file lock
        $this->dbManager->purgeConnection();

        $targetDir = dirname($targetPath);
        if (! File::isDirectory($targetDir)) {
            File::makeDirectory($targetDir, 0755, true, true);
        }

        if (! copy($backupPath, $targetPath)) {
            throw new BackupException("Failed to restore backup from '{$backupPath}' to '{$targetPath}'.");
        }

        // Reconnect and verify integrity
        $this->dbManager->configureConnection($tenant);
        $this->verifyIntegrity($tenant);

        return true;
    }

    /**
     * Verify database file integrity via SQLite PRAGMA integrity_check.
     */
    public function verifyIntegrity(Tenant $tenant): bool
    {
        $this->dbManager->configureConnection($tenant);

        $driver = config('database.connections.tenant.driver', 'sqlite');
        if ($driver === 'sqlite') {
            $result = DB::connection('tenant')->select('PRAGMA integrity_check');
            $status = $result[0]->integrity_check ?? null;

            if ($status !== 'ok') {
                throw new BackupException("Integrity check failed for tenant '{$tenant->slug}': Status is '{$status}'.");
            }
        }

        return true;
    }
}
