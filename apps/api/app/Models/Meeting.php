<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Meeting extends TenantModel
{
    use HasUuids;

    protected $table = 'meetings';

    protected $fillable = [
        'title',
        'description',
        'provider',
        'external_meeting_id',
        'join_url',
        'host_url',
        'passcode',
        'idempotency_key',
        'start_time',
        'duration_minutes',
        'status',
        'course_id',
        'session_id',
        'host_staff_id',
        'metadata',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'duration_minutes' => 'integer',
        'metadata' => 'array',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class, 'session_id');
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'host_staff_id');
    }
}
