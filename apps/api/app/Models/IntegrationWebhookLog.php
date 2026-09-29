<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class IntegrationWebhookLog extends TenantModel
{
    use HasUuids;

    protected $table = 'integration_webhook_logs';

    protected $fillable = [
        'provider',
        'event_type',
        'payload',
        'signature',
        'status',
    ];

    protected $casts = [
        'payload' => 'array',
    ];
}
