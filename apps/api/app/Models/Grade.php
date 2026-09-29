<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends TenantModel
{
    protected $table = 'grades';

    protected $fillable = [
        'student_id',
        'gradable_type',
        'gradable_id',
        'score',
        'max_score',
        'percentage',
        'is_published',
        'graded_at',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'is_published' => 'boolean',
        'graded_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
