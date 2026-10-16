<?php

namespace App\Support\Audit;

use App\Models\AuditLog;
use App\Tenancy\TenantContext;
use Illuminate\Support\Facades\Log;

class AuditLogger
{
    /**
     * Record a system or user action into the centralized audit log.
     */
    public static function log(
        string $action,
        ?string $tenantId = null,
        ?string $entityType = null,
        ?string $entityId = null,
        ?array $payload = null,
        string $actorType = 'user',
        ?string $actorId = null,
        ?string $actorEmail = null
    ): ?AuditLog {
        try {
            $request = request();

            // Auto-resolve tenant if not passed
            if ($tenantId === null && app()->bound(TenantContext::class)) {
                $tenantContext = app(TenantContext::class);
                if ($tenantContext->hasTenant()) {
                    $tenantId = $tenantContext->getTenant()?->id;
                }
            }

            // Auto-resolve actor if available
            if ($actorId === null && $request) {
                $user = $request->user();
                if ($user) {
                    $actorId = $user->id;
                    $actorEmail = $actorEmail ?? $user->email;
                }
            }

            $ipAddress = $request ? $request->ip() : null;
            $userAgent = $request ? substr((string) $request->userAgent(), 0, 500) : null;

            return AuditLog::create([
                'tenant_id' => $tenantId,
                'actor_id' => $actorId,
                'actor_type' => $actorType,
                'actor_email' => $actorEmail,
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'payload' => $payload,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Centralized Audit Logging failed: '.$e->getMessage(), [
                'action' => $action,
                'tenant_id' => $tenantId,
                'exception' => $e,
            ]);

            return null;
        }
    }
}
