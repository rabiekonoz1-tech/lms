<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GlobalIdentity extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'global_identities';

    protected $fillable = [
        'phone',
        'email',
        'name',
        'type',
        'status',
    ];

    /**
     * Tenant links mapping this global student to specific tenants.
     */
    public function tenantLinks(): HasMany
    {
        return $this->hasMany(StudentIdentityLink::class, 'global_identity_id');
    }

    /**
     * Check if identity is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
