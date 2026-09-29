<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignmentSubmission extends TenantModel
{
    protected $table = 'assignment_submissions';

    protected $fillable = [
        'assignment_id',
        'student_id',
        'content',
        'submitted_at',
        'is_late',
        'score',
        'feedback',
        'graded_by_user_id',
        'graded_at',
        'is_grade_published',
        'status',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'is_late' => 'boolean',
        'score' => 'decimal:2',
        'graded_at' => 'datetime',
        'is_grade_published' => 'boolean',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function gradedBy(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'graded_by_user_id');
    }
}
