<?php

namespace App\Http\Controllers\Api\Analytics;

use App\Http\Controllers\Controller;
use App\Models\MetricDefinition;
use App\Models\MetricVersion;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MetricController extends Controller
{
    /**
     * List all metric definitions.
     */
    public function index(): JsonResponse
    {
        $metrics = MetricDefinition::with('versions')->get();

        return ApiResponse::success(['metrics' => $metrics]);
    }

    /**
     * Create a new custom or standard metric definition.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'key' => 'required|string|max:100|unique:tenant.metric_definitions,key',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|in:academic,attendance,engagement,custom',
            'calculation_formula' => 'nullable|string',
            'formula_definition' => 'nullable|array',
        ]);

        $user = $request->user();
        $staffId = $user?->staff?->id;

        $metric = MetricDefinition::create([
            'key' => $validated['key'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? 'custom',
            'current_version' => 1,
            'calculation_formula' => $validated['calculation_formula'] ?? null,
            'created_by_staff_id' => $staffId,
        ]);

        MetricVersion::create([
            'metric_definition_id' => $metric->id,
            'version' => 1,
            'formula_definition' => $validated['formula_definition'] ?? null,
            'effective_from' => now(),
            'changelog' => 'Initial version',
        ]);

        return ApiResponse::success([
            'metric' => $metric->load('versions'),
        ], Response::HTTP_CREATED);
    }

    /**
     * Show metric details along with versions and history.
     */
    public function show(string $id): JsonResponse
    {
        $metric = MetricDefinition::with(['versions', 'measurements'])->findOrFail($id);

        return ApiResponse::success(['metric' => $metric]);
    }

    /**
     * Add a new version to an existing metric definition.
     */
    public function addVersion(Request $request, string $id): JsonResponse
    {
        $metric = MetricDefinition::findOrFail($id);

        $validated = $request->validate([
            'version' => 'required|integer|min:'.($metric->current_version + 1),
            'formula_definition' => 'nullable|array',
            'changelog' => 'nullable|string',
        ]);

        $version = MetricVersion::create([
            'metric_definition_id' => $metric->id,
            'version' => $validated['version'],
            'formula_definition' => $validated['formula_definition'] ?? null,
            'effective_from' => now(),
            'changelog' => $validated['changelog'] ?? 'Updated formula definition',
        ]);

        $metric->update(['current_version' => $validated['version']]);

        return ApiResponse::success([
            'metric' => $metric->fresh()->load('versions'),
            'version' => $version,
            'message' => "Metric upgraded to version {$validated['version']}.",
        ], Response::HTTP_CREATED);
    }
}
