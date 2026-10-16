<?php

namespace App\Domain\Credentials\Services;

use App\Models\AccessCredential;
use App\Models\DeviceBinding;
use App\Models\Student;
use App\Models\TenantUser;
use App\Support\Audit\AuditLogger;

class CredentialLifecycleService
{
    /**
     * Issue/Generate a new access credential for a student.
     * Enforces raw secret hashing (SHA-256); secret never stored in plain text or logged.
     *
     * @return array{credential: AccessCredential, plainTextSecret: string}
     */
    public function issueCredential(Student $student, TenantUser $issuer, ?\DateTimeInterface $expiresAt = null): array
    {
        $result = AccessCredential::generate($student, $issuer, $expiresAt);

        AuditLogger::log(
            action: 'credential.issued',
            entityType: 'AccessCredential',
            entityId: $result['credential']->id,
            payload: [
                'student_id' => $student->id,
                'credential_code' => $result['credential']->credential_code,
            ],
            actorType: 'staff',
            actorId: $issuer->id
        );

        return $result;
    }

    /**
     * Replace device binding with authorized staff approval and immutable audit record.
     */
    public function replaceDevice(
        AccessCredential $credential,
        TenantUser $staff,
        string $newDeviceId,
        string $newFingerprint,
        string $reason,
        ?string $name = null
    ): DeviceBinding {
        $previousDeviceId = $credential->deviceBinding?->device_id;

        $newBinding = $credential->replaceDevice(
            $newDeviceId,
            $newFingerprint,
            $reason,
            $staff,
            $name
        );

        AuditLogger::log(
            action: 'credential.device_replaced',
            entityType: 'AccessCredential',
            entityId: $credential->id,
            payload: [
                'old_device_id' => $previousDeviceId,
                'new_device_id' => $newDeviceId,
                'reason' => $reason,
            ],
            actorType: 'staff',
            actorId: $staff->id
        );

        return $newBinding;
    }

    /**
     * Revoke credential.
     */
    public function revoke(AccessCredential $credential, TenantUser $staff, string $reason): AccessCredential
    {
        $credential->revoke($reason);

        AuditLogger::log(
            action: 'credential.revoked',
            entityType: 'AccessCredential',
            entityId: $credential->id,
            payload: ['reason' => $reason],
            actorType: 'staff',
            actorId: $staff->id
        );

        return $credential->fresh();
    }
}
