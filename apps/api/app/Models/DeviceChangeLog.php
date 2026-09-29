<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceChangeLog extends TenantModel
{
    protected $table = 'device_change_logs';

    protected $fillable = [
        'credential_id',
        'previous_device_id',
        'new_device_id',
        'reason',
        'authorized_by_user_id',
        'logged_at',
    ];

    protected $casts = [
        'logged_at' => 'datetime',
    ];

    public function credential(): BelongsTo
    {
        return $this->belongsTo(AccessCredential::class, 'credential_id');
    }

    public function authorizer(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'authorized_by_user_id');
    }
}
