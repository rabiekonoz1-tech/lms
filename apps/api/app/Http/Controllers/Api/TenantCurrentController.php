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
            'status' => $tenant->status,
            'domains' => $tenant->domains->pluck('domain')->values()->all(),
            'features' => $tenant->features->where('enabled', true)->pluck('feature_key')->values()->all(),
        ]);
    }
}
