<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends TenantModel
{
    protected $table = 'branches';

    protected $fillable = [
        'name',
        'code',
        'status',
    ];

    public function classrooms(): HasMany
    {
        return $this->hasMany(Classroom::class, 'branch_id');
    }
}
