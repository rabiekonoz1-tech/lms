<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaAsset extends TenantModel
{
    use HasUuids;

    protected $table = 'media_assets';

    protected $fillable = [
        'title',
        'provider',
        'external_media_id',
        'media_type',
        'embed_url',
        'playback_url',
        'status',
        'course_id',
        'lesson_id',
        'size_bytes',
        'duration_seconds',
        'metadata',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'duration_seconds' => 'integer',
        'metadata' => 'array',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }
}
