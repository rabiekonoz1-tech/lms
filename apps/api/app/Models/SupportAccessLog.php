<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportAccessLog extends Model
{
    use HasUuids;

    protected $table = 'support_access_logs';

    protected $fillable = [
        'platform_user_id',
        'tenant_id',
        'reason',
        'ip_address',
        'accessed_at',
        'expires_at',
    ];

    protected $casts = [
        'accessed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'platform_user_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }
}
