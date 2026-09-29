<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Tenant extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tenants';

    protected $fillable = [
        'type',
        'status',
        'name',
        'slug',
    ];

    /**
     * Domains registered for this tenant.
     */
    public function domains(): HasMany
    {
        return $this->hasMany(TenantDomain::class, 'tenant_id');
    }

    /**
     * Database allocation for this tenant.
     */
    public function databaseConfig(): HasOne
    {
        return $this->hasOne(TenantDatabase::class, 'tenant_id');
    }

    /**
     * Feature toggles configured for this tenant.
     */
    public function features(): HasMany
    {
        return $this->hasMany(TenantFeature::class, 'tenant_id');
    }

    /**
     * Determine if tenant is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Determine if tenant has a specific feature enabled.
     */
    public function hasFeature(string $featureKey): bool
    {
        $feature = $this->features->firstWhere('feature_key', $featureKey);

        return $feature ? (bool) $feature->enabled : false;
    }
}
