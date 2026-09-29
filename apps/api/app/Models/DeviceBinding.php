<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceBinding extends TenantModel
{
    protected $table = 'device_bindings';

    protected $fillable = [
        'credential_id',
        'device_id',
        'device_name',
        'device_fingerprint',
        'bound_at',
        'is_active',
    ];

    protected $casts = [
        'bound_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function credential(): BelongsTo
    {
        return $this->belongsTo(AccessCredential::class, 'credential_id');
    }

    public function matchesDevice(string $deviceId, string $fingerprint): bool
    {
        return $this->is_active && $this->device_id === $deviceId && hash_equals($this->device_fingerprint, $fingerprint);
    }
}
