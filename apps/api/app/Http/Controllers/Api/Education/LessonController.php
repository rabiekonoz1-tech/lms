<?php

namespace App\Http\Controllers\Api\Education;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LessonController extends Controller
{
    /**
     * List lessons of a course.
     */
    public function index(Request $request, string $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);
        $this->authorizeCourseAccess($request->user(), $course);

        $lessons = $course->lessons;

        return ApiResponse::success(['lessons' => $lessons]);
    }

    /**
     * Create a lesson in a course.
     */
    public function store(Request $request, string $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'status' => 'nullable|string|in:draft,published',
        ]);

        $lesson = $course->lessons()->create([
            'title' => $validated['title'],
            'content' => $validated['content'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'status' => $validated['status'] ?? 'published',
        ]);

        return ApiResponse::success(['lesson' => $lesson], Response::HTTP_CREATED);
    }

    /**
     * Show a specific lesson.
     */
    public function show(Request $request, string $courseId, string $id): JsonResponse
    {
        $course = Course::findOrFail($courseId);
        $this->authorizeCourseAccess($request->user(), $course);

        $lesson = $course->lessons()->findOrFail($id);

        return ApiResponse::success(['lesson' => $lesson]);
    }

    /**
     * Authorize user access to course content.
     */
    protected function authorizeCourseAccess(TenantUser $user, Course $course): void
    {
        if ($user->hasPermissionTo('courses.view')) {
            return;
        }

        if ($user->student) {
            $isEnrolled = Enrollment::where('student_id', $user->student->id)
                ->where('course_id', $course->id)
                ->where('status', 'active')
                ->exists();

            if ($isEnrolled || $course->status === 'published') {
                return;
            }
        }

        throw new AuthorizationException('You are not authorized to access this course content.');
    }
}
