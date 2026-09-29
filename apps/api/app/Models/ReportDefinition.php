<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReportDefinition extends TenantModel
{
    use HasUuids;

    protected $table = 'report_definitions';

    protected $fillable = [
        'key',
        'name',
        'description',
        'type',
        'supported_formats',
    ];

    protected $casts = [
        'supported_formats' => 'array',
    ];

    public function instances(): HasMany
    {
        return $this->hasMany(ReportInstance::class, 'report_definition_id');
    }
}
