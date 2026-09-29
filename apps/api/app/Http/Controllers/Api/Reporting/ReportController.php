<?php

namespace App\Http\Controllers\Api\Reporting;

use App\Domain\Reporting\Services\ReportGenerationService;
use App\Http\Controllers\Controller;
use App\Models\ReportInstance;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    /**
     * List generated or requested reports.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var TenantUser $user */
        $user = $request->user();

        $query = ReportInstance::query()->with('definition');

        // Non-staff users only see reports they requested
        if (! $user->hasPermissionTo('reports.view')) {
            $query->where('requested_by_user_id', $user->id);
        }

        $reports = $query->orderBy('created_at', 'desc')->get();

        return ApiResponse::success(['reports' => $reports]);
    }

    /**
     * Request a new report generation job.
     */
    public function store(Request $request, ReportGenerationService $service): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'report_definition_id' => 'nullable|uuid|exists:tenant.report_definitions,id',
            'format' => 'nullable|string|in:json,csv,pdf',
            'parameters' => 'nullable|array',
        ]);

        /** @var TenantUser $user */
        $user = $request->user();

        $report = ReportInstance::create([
            'title' => $validated['title'],
            'report_definition_id' => $validated['report_definition_id'] ?? null,
            'requested_by_user_id' => $user->id,
            'status' => 'queued',
            'format' => $validated['format'] ?? 'json',
            'parameters' => $validated['parameters'] ?? [],
        ]);

        // Process generation
        $report = $service->generate($report);

        return ApiResponse::success(['report' => $report], Response::HTTP_CREATED);
    }

    /**
     * Show report instance status and metadata.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $report = ReportInstance::with('definition')->findOrFail($id);

        /** @var TenantUser $user */
        $user = $request->user();
        $isOwner = $report->requested_by_user_id === $user->id;
        $canView = $user->hasPermissionTo('reports.view');

        if (! $isOwner && ! $canView) {
            throw new AuthorizationException('You are not authorized to view this report.');
        }

        return ApiResponse::success(['report' => $report]);
    }

    /**
     * Download completed report data with authorization verification.
     */
    public function download(Request $request, string $id): JsonResponse
    {
        $report = ReportInstance::findOrFail($id);

        /** @var TenantUser $user */
        $user = $request->user();
        $isOwner = $report->requested_by_user_id === $user->id;
        $canDownload = $user->hasPermissionTo('reports.download');

        if (! $isOwner && ! $canDownload) {
            throw new AuthorizationException('You are not authorized to download this report.');
        }

        if ($report->status !== 'completed') {
            return ApiResponse::error(
                'REPORT_NOT_READY',
                "Report is currently {$report->status} and cannot be downloaded.",
                Response::HTTP_BAD_REQUEST
            );
        }

        return ApiResponse::success([
            'report_id' => $report->id,
            'title' => $report->title,
            'format' => $report->format,
            'download_url' => $report->file_path,
            'payload' => $report->data_payload,
        ]);
    }
}
