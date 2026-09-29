<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamAnswer extends TenantModel
{
    protected $table = 'exam_answers';

    protected $fillable = [
        'attempt_id',
        'question_id',
        'answer_text',
        'is_correct',
        'awarded_points',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'awarded_points' => 'decimal:2',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
