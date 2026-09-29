<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class AccessCredential extends TenantModel
{
    protected $table = 'access_credentials';

    protected $fillable = [
        'student_id',
        'credential_code',
        'secret_hash',
        'qr_payload',
        'status',
        'created_by_user_id',
        'issued_at',
        'activated_at',
        'expires_at',
        'revoked_at',
        'revocation_reason',
    ];

    protected $hidden = [
        'secret_hash',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'activated_at' => 'datetime',
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'created_by_user_id');
    }

    public function deviceBinding(): HasOne
    {
        return $this->hasOne(DeviceBinding::class, 'credential_id')->where('is_active', true);
    }

    public function deviceBindings(): HasMany
    {
        return $this->hasMany(DeviceBinding::class, 'credential_id');
    }

    public function deviceChangeLogs(): HasMany
    {
        return $this->hasMany(DeviceChangeLog::class, 'credential_id');
    }

    /**
     * Generate a new access credential with a hashed secret.
     *
     * @return array{credential: self, plainTextSecret: string}
     */
    public static function generate(
        Student $student,
        TenantUser $creator,
        ?\DateTimeInterface $expiresAt = null
    ): array {
        $plainSecret = 'CRD_SEC_'.Str::random(32);
        $code = 'CRD-'.strtoupper(Str::random(4)).'-'.mt_rand(100000, 999999);
        $qrPayload = 'QR:CRED:'.$code;

        $credential = self::create([
            'student_id' => $student->id,
            'credential_code' => $code,
            'secret_hash' => hash('sha256', $plainSecret),
            'qr_payload' => $qrPayload,
            'status' => 'pending',
            'created_by_user_id' => $creator->id,
            'issued_at' => now(),
            'expires_at' => $expiresAt,
        ]);

        return [
            'credential' => $credential,
            'plainTextSecret' => $plainSecret,
        ];
    }

    /**
     * Verify whether a raw plain-text secret matches the stored hash.
     */
    public function verifySecret(string $plainSecret): bool
    {
        return hash_equals($this->secret_hash, hash('sha256', $plainSecret));
    }

    /**
     * Check if credential is active and not expired or revoked.
     */
    public function isUsable(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->expires_at !== null && now()->greaterThan($this->expires_at)) {
            return false;
        }

        return true;
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired' || ($this->expires_at !== null && now()->greaterThan($this->expires_at));
    }

    public function isRevoked(): bool
    {
        return $this->status === 'revoked';
    }

    /**
     * Bind a device to this credential.
     */
    public function bindDevice(string $deviceId, string $fingerprint, ?string $name = null): DeviceBinding
    {
        // Deactivate old bindings if any
        $this->deviceBindings()->update(['is_active' => false]);

        return $this->deviceBindings()->create([
            'device_id' => $deviceId,
            'device_name' => $name,
            'device_fingerprint' => $fingerprint,
            'bound_at' => now(),
            'is_active' => true,
        ]);
    }

    /**
     * Replace device binding with audit logging.
     */
    public function replaceDevice(
        string $newDeviceId,
        string $newFingerprint,
        string $reason,
        TenantUser $authorizer,
        ?string $name = null
    ): DeviceBinding {
        $previousBinding = $this->deviceBinding;
        $previousDeviceId = $previousBinding?->device_id;

        $newBinding = $this->bindDevice($newDeviceId, $newFingerprint, $name);

        DeviceChangeLog::create([
            'credential_id' => $this->id,
            'previous_device_id' => $previousDeviceId,
            'new_device_id' => $newDeviceId,
            'reason' => $reason,
            'authorized_by_user_id' => $authorizer->id,
            'logged_at' => now(),
        ]);

        return $newBinding;
    }

    /**
     * Revoke credential.
     */
    public function revoke(string $reason): void
    {
        $this->update([
            'status' => 'revoked',
            'revoked_at' => now(),
            'revocation_reason' => $reason,
        ]);

        $this->deviceBindings()->update(['is_active' => false]);
    }
}
