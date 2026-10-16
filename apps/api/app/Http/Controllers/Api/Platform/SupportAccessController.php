<?php

namespace App\Http\Controllers\Api\Platform;

use App\Http\Controllers\Controller;
use App\Models\SupportAccessLog;
use App\Models\Tenant;
use App\Models\TenantToken;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use App\Support\Audit\AuditLogger;
use App\Tenancy\TenantDatabaseManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SupportAccessController extends Controller
{
    /**
     * Generate a temporary access token for a tenant.
     */
    public function generateToken(Request $request, string $tenantId): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|min:5|max:255',
        ]);

        $tenant = Tenant::findOrFail($tenantId);

        // Platform user (Control DB)
        // Since we don't have full Sanctum on control DB yet in these tests, we might mock the user or assume it's passed.
        // For production, the platform admin is authenticated via a web guard or global sanctum guard.
        // We will default to a placeholder platform_user_id for now if not authenticated globally.
        $platformUserId = $request->user()?->id ?? 1;

        // 1. Audit Log (Control DB)
        $log = SupportAccessLog::create([
            'platform_user_id' => $platformUserId,
            'tenant_id' => $tenant->id,
            'reason' => $validated['reason'],
            'ip_address' => $request->ip(),
            'accessed_at' => now(),
            'expires_at' => now()->addHours(2),
        ]);

        AuditLogger::log(
            action: 'support.access_granted',
            tenantId: $tenant->id,
            entityType: 'Tenant',
            entityId: $tenant->id,
            payload: ['reason' => $validated['reason'], 'expires_in_hours' => 2],
            actorType: 'support',
            actorId: (string) $platformUserId
        );

        // 2. Connect to Tenant DB
        $dbManager = app(TenantDatabaseManager::class);
        $dbManager->configureConnection($tenant);

        // 3. Find or Create Support User in Tenant DB
        $supportEmail = 'support@platform.local';

        $supportUser = TenantUser::firstOrCreate(
            ['email' => $supportEmail],
            [
                'name' => 'Platform Support',
                'password' => Hash::make(Str::random(32)),
                'type' => 'support',
                'status' => 'active',
            ]
        );

        // Optional: Ensure the support user has a support role (RBAC).
        // For now, type='support' might be enough to grant broad permissions in policies.

        // 4. Generate Token (Expires in 2 hours)
        // Note: Sanctum doesn't natively support token expiry in the token itself without custom logic,
        // but our frontend or middleware can enforce it based on the log or a custom ability.
        $tokenData = TenantToken::createTokenFor($supportUser, 'support_token', 120);

        // Restore default connection just in case
        DB::purge('tenant');

        return ApiResponse::success([
            'message' => 'Support access granted.',
            'tenant' => $tenant->slug,
            'token' => $tokenData['plainTextToken'],
            'expires_at' => $log->expires_at,
            'audit_log_id' => $log->id,
        ]);
    }
}
