<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Student extends TenantModel
{
    protected $table = 'students';

    protected $fillable = [
        'user_id',
        'global_identity_id',
        'student_code',
        'grade_level',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }

    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(ParentProfile::class, 'student_parent', 'student_id', 'parent_id')
            ->withPivot('relation_type');
    }
}
