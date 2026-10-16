<?php

namespace App\Http\Controllers\Api\Platform;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantDatabase;
use App\Models\TenantDomain;
use App\Support\ApiResponse;
use App\Support\Audit\AuditLogger;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class TenantController extends Controller
{
    /**
     * List all tenants on the platform.
     */
    public function index(): JsonResponse
    {
        $tenants = Tenant::with(['domains', 'databaseConfig'])->get();

        return ApiResponse::success(['tenants' => $tenants]);
    }

    /**
     * Show a specific tenant.
     */
    public function show(string $id): JsonResponse
    {
        $tenant = Tenant::with(['domains', 'databaseConfig'])->findOrFail($id);

        return ApiResponse::success(['tenant' => $tenant]);
    }

    /**
     * Provision a new tenant.
     */
    public function store(Request $request, TenantDatabaseManager $dbManager): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:50|unique:tenants,slug',
            'type' => 'required|string',
            'auth_mode' => 'nullable|string|in:password,coupon,hybrid',
            'logo_url' => 'nullable|string|max:500',
            'primary_color' => 'nullable|string|max:30',
            'secondary_color' => 'nullable|string|max:30',
            'brand_tagline' => 'nullable|string|max:255',
            'brand_settings' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            $tenant = Tenant::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'type' => $validated['type'],
                'auth_mode' => $validated['auth_mode'] ?? 'hybrid',
                'status' => 'active',
                'logo_url' => $validated['logo_url'] ?? null,
                'primary_color' => $validated['primary_color'] ?? '#04c3c9',
                'secondary_color' => $validated['secondary_color'] ?? '#0284c7',
                'brand_tagline' => $validated['brand_tagline'] ?? null,
                'brand_settings' => $validated['brand_settings'] ?? null,
            ]);

            TenantDatabase::create([
                'tenant_id' => $tenant->id,
                'connection_identifier' => 'tenant_'.$tenant->slug,
                'status' => 'ready',
            ]);

            TenantDomain::create([
                'tenant_id' => $tenant->id,
                'domain' => $tenant->slug.'.localhost',
                'active' => true,
            ]);

            DB::commit();

            // Run migrations for the new tenant
            $dbManager->migrateTenant($tenant);

            $tenant->load(['domains', 'databaseConfig']);

            AuditLogger::log(
                action: 'tenant.created',
                tenantId: $tenant->id,
                entityType: 'Tenant',
                entityId: $tenant->id,
                payload: ['name' => $tenant->name, 'slug' => $tenant->slug, 'type' => $tenant->type],
                actorType: 'platform_admin'
            );

            return ApiResponse::success(['tenant' => $tenant], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            DB::rollBack();

            return ApiResponse::error(
                'TENANT_CREATION_FAILED',
                'Failed to provision tenant: '.$e->getMessage(),
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update tenant metadata or white-label branding.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string',
            'auth_mode' => 'sometimes|string|in:password,coupon,hybrid',
            'status' => 'sometimes|string|in:active,suspended,provisioning,archived',
            'logo_url' => 'nullable|string|max:500',
            'primary_color' => 'nullable|string|max:30',
            'secondary_color' => 'nullable|string|max:30',
            'brand_tagline' => 'nullable|string|max:255',
            'brand_settings' => 'nullable|array',
        ]);

        $tenant->update($validated);
        $tenant->load(['domains', 'databaseConfig', 'features']);

        AuditLogger::log(
            action: 'tenant.updated',
            tenantId: $tenant->id,
            entityType: 'Tenant',
            entityId: $tenant->id,
            payload: $validated,
            actorType: 'platform_admin'
        );

        return ApiResponse::success([
            'tenant' => $tenant,
            'message' => 'Tenant branding and details updated successfully',
        ]);
    }
}
