<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends TenantModel
{
    protected $table = 'exams';

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'duration_minutes',
        'total_points',
        'is_published',
        'is_grades_published',
        'status',
    ];

    protected $casts = [
        'duration_minutes' => 'integer',
        'total_points' => 'decimal:2',
        'is_published' => 'boolean',
        'is_grades_published' => 'boolean',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'exam_id')->orderBy('sort_order', 'asc');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class, 'exam_id');
    }
}
