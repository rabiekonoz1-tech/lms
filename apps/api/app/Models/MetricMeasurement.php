<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetricMeasurement extends TenantModel
{
    use HasUuids;

    protected $table = 'metric_measurements';

    protected $fillable = [
        'student_id',
        'metric_definition_id',
        'metric_version_id',
        'value',
        'period_start',
        'period_end',
        'context_type',
        'context_id',
        'metadata',
        'recorded_at',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'period_start' => 'date',
        'period_end' => 'date',
        'metadata' => 'array',
        'recorded_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function metricDefinition(): BelongsTo
    {
        return $this->belongsTo(MetricDefinition::class, 'metric_definition_id');
    }

    public function metricVersion(): BelongsTo
    {
        return $this->belongsTo(MetricVersion::class, 'metric_version_id');
    }
}
