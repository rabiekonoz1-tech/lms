<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportInstance extends TenantModel
{
    use HasUuids;

    protected $table = 'report_instances';

    protected $fillable = [
        'report_definition_id',
        'title',
        'requested_by_user_id',
        'status',
        'format',
        'parameters',
        'data_payload',
        'file_path',
        'error_message',
        'completed_at',
    ];

    protected $casts = [
        'parameters' => 'array',
        'data_payload' => 'array',
        'completed_at' => 'datetime',
    ];

    public function definition(): BelongsTo
    {
        return $this->belongsTo(ReportDefinition::class, 'report_definition_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'requested_by_user_id');
    }
}
