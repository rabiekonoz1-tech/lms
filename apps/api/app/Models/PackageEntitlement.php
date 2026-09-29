<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageEntitlement extends TenantModel
{
    protected $table = 'package_entitlements';

    protected $fillable = [
        'package_id',
        'entitlement_key',
        'value',
    ];

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'package_id');
    }
}
