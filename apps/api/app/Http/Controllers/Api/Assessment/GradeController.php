<?php

namespace App\Http\Controllers\Api\Assessment;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Student;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    /**
     * View grades for a specific student.
     * Enforces:
     * - The student themselves can see their own published grades.
     * - Staff with 'grades.view' can see all grades (published or unpublished).
     * - Unauthorized users / unpermitted assistants get 403 Forbidden.
     */
    public function studentGrades(Request $request, string $studentId): JsonResponse
    {
        $student = Student::findOrFail($studentId);

        /** @var TenantUser $user */
        $user = $request->user();

        $isSelf = $user->student && $user->student->id === $student->id;
        $canViewAll = $user->hasPermissionTo('grades.view');

        if (! $isSelf && ! $canViewAll) {
            throw new AuthorizationException('You are not authorized to view student grade records.');
        }

        $query = Grade::where('student_id', $student->id);

        if (! $canViewAll) {
            // Student only sees published grades
            $query->where('is_published', true);
        }

        $grades = $query->orderBy('graded_at', 'desc')->get();

        return ApiResponse::success(['grades' => $grades]);
    }
}
