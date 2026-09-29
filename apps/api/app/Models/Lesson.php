<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lesson extends TenantModel
{
    protected $table = 'lessons';

    protected $fillable = [
        'course_id',
        'title',
        'content',
        'sort_order',
        'status',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
