<?php

namespace App\Http\Controllers\Api\Platform;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * List centralized audit logs with filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query()->orderBy('created_at', 'desc');

        if ($request->filled('tenant_id')) {
            $query->where('tenant_id', $request->query('tenant_id'));
        }

        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }

        if ($request->filled('actor_id')) {
            $query->where('actor_id', $request->query('actor_id'));
        }

        if ($request->filled('actor_type')) {
            $query->where('actor_type', $request->query('actor_type'));
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
