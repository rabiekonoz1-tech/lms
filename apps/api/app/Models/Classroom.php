<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Classroom extends TenantModel
{
    protected $table = 'classrooms';

    protected $fillable = [
        'branch_id',
        'name',
        'capacity',
        'status',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(ClassSession::class, 'classroom_id');
    }
}
