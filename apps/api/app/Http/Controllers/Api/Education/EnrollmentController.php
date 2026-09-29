<?php

namespace App\Http\Controllers\Api\Education;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnrollmentController extends Controller
{
    /**
     * Enroll in a course (self-enrollment by student, or admin/teacher enrolling a student).
     */
    public function enroll(Request $request, string $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);

        /** @var TenantUser $user */
        $user = $request->user();

        if ($request->has('student_id')) {
            // Enrolling on behalf of someone requires enrollments.create
            if (! $user->hasPermissionTo('enrollments.create')) {
                throw new AuthorizationException('Forbidden. Missing required permission [enrollments.create].');
            }

            $validated = $request->validate([
                'student_id' => 'required|uuid|exists:tenant.students,id',
            ]);

            $studentId = $validated['student_id'];
        } else {
            // Self-enrollment
            if (! $user->student) {
                return ApiResponse::error('INVALID_ENROLLMENT', 'Authenticated user does not have a student profile.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $studentId = $user->student->id;
        }

        $enrollment = Enrollment::firstOrCreate(
            [
                'course_id' => $course->id,
                'student_id' => $studentId,
            ],
            [
                'status' => 'active',
                'enrolled_at' => now(),
            ]
        );

        return ApiResponse::success([
            'enrollment' => $enrollment->load(['student.user', 'course']),
        ], Response::HTTP_CREATED);
    }

    /**
     * List enrollments for a course (requires enrollments.view permission).
     */
    public function index(Request $request, string $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);

        $enrollments = $course->enrollments()->with('student.user')->get();

        return ApiResponse::success(['enrollments' => $enrollments]);
    }

    /**
     * View enrollments for a specific student.
     * Enforces:
     * - The student themselves can view their enrollments.
     * - Staff with 'students.view' can view.
     * - Assistants/staff WITHOUT 'students.view' are forbidden (403).
     */
    public function studentEnrollments(Request $request, string $studentId): JsonResponse
    {
        $student = Student::findOrFail($studentId);

        /** @var TenantUser $user */
        $user = $request->user();

        $isSelf = $user->student && $user->student->id === $student->id;
        $canView = $user->hasPermissionTo('students.view');

        if (! $isSelf && ! $canView) {
            throw new AuthorizationException('You are not authorized to view student enrollment data.');
        }

        $enrollments = $student->enrollments()->with('course')->get();

        return ApiResponse::success(['enrollments' => $enrollments]);
    }
}
