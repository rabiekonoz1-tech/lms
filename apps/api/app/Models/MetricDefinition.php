<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MetricDefinition extends TenantModel
{
    use HasUuids;

    protected $table = 'metric_definitions';

    protected $fillable = [
        'key',
        'name',
        'description',
        'category',
        'current_version',
        'calculation_formula',
        'created_by_staff_id',
    ];

    protected $casts = [
        'current_version' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'created_by_staff_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(MetricVersion::class, 'metric_definition_id');
    }

    public function measurements(): HasMany
    {
        return $this->hasMany(MetricMeasurement::class, 'metric_definition_id');
    }

    public function currentVersion(): ?MetricVersion
    {
        return $this->versions()->where('version', $this->current_version)->first();
    }
}
