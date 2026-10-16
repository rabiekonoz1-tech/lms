<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Support\ApiResponse;
use App\Tenancy\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * List audit logs strictly scoped to the current tenant.
     */
    public function index(Request $request, TenantContext $context): JsonResponse
    {
        $tenant = $context->getTenantOrFail();

        $query = AuditLog::where('tenant_id', $tenant->id)->orderBy('created_at', 'desc');

        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }

        if ($request->filled('actor_id')) {
            $query->where('actor_id', $request->query('actor_id'));
        }

        $perPage = min((int) $request->query('per_page', 25), 100);
        $logs = $query->paginate($perPage);

        return ApiResponse::success([
            'audit_logs' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }
}
