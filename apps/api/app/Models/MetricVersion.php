<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MetricVersion extends TenantModel
{
    use HasUuids;

    protected $table = 'metric_versions';

    protected $fillable = [
        'metric_definition_id',
        'version',
        'formula_definition',
        'effective_from',
        'changelog',
    ];

    protected $casts = [
        'version' => 'integer',
        'formula_definition' => 'array',
        'effective_from' => 'datetime',
    ];

    public function metricDefinition(): BelongsTo
    {
        return $this->belongsTo(MetricDefinition::class, 'metric_definition_id');
    }

    public function measurements(): HasMany
    {
        return $this->hasMany(MetricMeasurement::class, 'metric_version_id');
    }
}
