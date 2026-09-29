<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Question extends TenantModel
{
    protected $table = 'questions';

    protected $fillable = [
        'exam_id',
        'question_text',
        'question_type',
        'points',
        'options',
        'correct_answer',
        'sort_order',
    ];

    protected $casts = [
        'points' => 'decimal:2',
        'options' => 'array',
        'sort_order' => 'integer',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }
}
