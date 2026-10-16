<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use App\Tenancy\TenantContext;
use Illuminate\Http\JsonResponse;

class TenantCurrentController extends Controller
{
    /**
     * Return information about the currently resolved tenant.
     */
    public function __invoke(TenantContext $context): JsonResponse
    {
        $tenant = $context->getTenantOrFail();

        return ApiResponse::success([
            'id' => $tenant->id,
            'name' => $tenant->name,
            'slug' => $tenant->slug,
            'type' => $tenant->type,
            'auth_mode' => $tenant->auth_mode ?? 'hybrid',
            'status' => $tenant->status,
            'logo_url' => $tenant->logo_url,
            'primary_color' => $tenant->primary_color ?? '#04c3c9',
            'secondary_color' => $tenant->secondary_color ?? '#0284c7',
            'brand_tagline' => $tenant->brand_tagline,
            'brand_settings' => $tenant->brand_settings ?? [],
            'domains' => $tenant->domains->pluck('domain')->values()->all(),
            'features' => $tenant->features->where('enabled', true)->pluck('feature_key')->values()->all(),
        ]);
    }
}
