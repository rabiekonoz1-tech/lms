<?php

namespace App\Http\Controllers\Api\Analytics;

use App\Domain\Analytics\Services\AnalyticsCalculationService;
use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentAnalyticsSnapshot;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Fast student performance dashboard served from pre-aggregated read models.
     * Enforces the invariant: no synchronous heavy calculation on dashboard.
     */
    public function studentDashboard(Request $request, string $studentId): JsonResponse
    {
        $student = Student::findOrFail($studentId);

        /** @var TenantUser $user */
        $user = $request->user();
        $isSelf = $user->student && $user->student->id === $student->id;
        $isParent = $user->parent && $user->parent->students()->where('student_id', $student->id)->exists();
        $canView = $user->hasPermissionTo('analytics.view');

        if (! $isSelf && ! $isParent && ! $canView) {
            throw new AuthorizationException('You are not authorized to view this student analytics dashboard.');
        }

        // Fetch pre-computed read model snapshot (No live table scanning)
        $snapshot = StudentAnalyticsSnapshot::where('student_id', $student->id)->first();

        // If no snapshot exists yet, fallback to zero/empty snapshot structure
        $data = $snapshot ?: [
            'student_id' => $student->id,
            'attendance_rate' => 100.00,
            'assignment_completion_rate' => 100.00,
            'exam_average' => 100.00,
            'overall_score' => 100.00,
            'last_calculated_at' => null,
        ];

        return ApiResponse::success([
            'student_id' => $student->id,
            'dashboard' => $data,
        ]);
    }

    /**
     * Trigger background/on-demand recalculation of student analytics snapshots and measurements.
     */
    public function refresh(string $studentId, AnalyticsCalculationService $service): JsonResponse
    {
        $student = Student::findOrFail($studentId);

        $snapshot = $service->computeStudentSnapshot($student);

        return ApiResponse::success([
            'snapshot' => $snapshot,
            'message' => 'Student analytics snapshot recomputed and refreshed.',
        ]);
    }
}
