<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends TenantModel
{
    protected $table = 'packages';

    protected $fillable = [
        'name',
        'code',
        'description',
        'price',
        'currency',
        'billing_cycle',
        'status',
        'features',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'features' => 'array',
    ];

    public function entitlements(): HasMany
    {
        return $this->hasMany(PackageEntitlement::class, 'package_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'package_id');
    }

    public function paymentRequests(): HasMany
    {
        return $this->hasMany(PaymentRequest::class, 'package_id');
    }
}
