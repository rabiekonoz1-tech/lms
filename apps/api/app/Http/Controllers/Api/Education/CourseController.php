<?php

namespace App\Http\Controllers\Api\Education;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CourseController extends Controller
{
    /**
     * List courses accessible to the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var TenantUser $user */
        $user = $request->user();

        if ($user->hasPermissionTo('courses.view')) {
            $courses = Course::with(['teacher.user', 'lessons'])->get();

            return ApiResponse::success(['courses' => $courses]);
        }

        // For student, show enrolled courses and published courses
        if ($user->student) {
            $studentId = $user->student->id;
            $courses = Course::with(['teacher.user', 'lessons'])
                ->where('status', 'published')
                ->orWhereHas('enrollments', function ($query) use ($studentId) {
                    $query->where('student_id', $studentId)->where('status', 'active');
                })
                ->get();

            return ApiResponse::success(['courses' => $courses]);
        }

        // Default deny if neither permission nor student profile
        return ApiResponse::success(['courses' => []]);
    }

    /**
     * Create a new course.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:draft,published,archived',
        ]);

        /** @var TenantUser $user */
        $user = $request->user();

        $course = Course::create([
            'teacher_staff_id' => $user->staff?->id,
            'title' => $validated['title'] ?? 'New Course',
            'code' => $validated['code'] ?? null,
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'draft',
        ]);

        return ApiResponse::success([
            'message' => 'Course created successfully.',
            'course' => $course,
        ], Response::HTTP_OK);
    }

    /**
     * Show a course.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $course = Course::with(['teacher.user', 'lessons'])->findOrFail($id);

        /** @var TenantUser $user */
        $user = $request->user();

        if ($user->hasPermissionTo('courses.view')) {
            return ApiResponse::success(['course' => $course]);
        }

        if ($user->student) {
            $isEnrolled = Enrollment::where('student_id', $user->student->id)
                ->where('course_id', $course->id)
                ->where('status', 'active')
                ->exists();

            if ($isEnrolled || $course->status === 'published') {
                return ApiResponse::success(['course' => $course]);
            }
        }

        throw new AuthorizationException('You are not authorized to view this course.');
    }

    /**
     * Update an existing course.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:draft,published,archived',
        ]);

        $course->update($validated);

        return ApiResponse::success(['course' => $course]);
    }

    /**
     * Delete a course.
     */
    public function destroy(string $id): JsonResponse
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return ApiResponse::success(null, Response::HTTP_OK);
    }
}
