<?php

namespace App\Http\Controllers\Api\Assessment;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Course;
use App\Models\Grade;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AssignmentController extends Controller
{
    /**
     * List assignments of a course.
     */
    public function index(string $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);
        $assignments = $course->assignments()->with('lesson')->get();

        return ApiResponse::success(['assignments' => $assignments]);
    }

    /**
     * Create an assignment.
     */
    public function store(Request $request, string $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'lesson_id' => 'nullable|uuid|exists:tenant.lessons,id',
            'description' => 'nullable|string',
            'points_possible' => 'nullable|numeric|min:0',
            'due_at' => 'nullable|date',
            'status' => 'nullable|string|in:draft,published,archived',
        ]);

        $assignment = $course->assignments()->create([
            'lesson_id' => $validated['lesson_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'points_possible' => $validated['points_possible'] ?? 100.00,
            'due_at' => $validated['due_at'] ?? null,
            'status' => $validated['status'] ?? 'published',
        ]);

        return ApiResponse::success(['assignment' => $assignment], Response::HTTP_CREATED);
    }

    /**
     * Show an assignment.
     */
    public function show(string $courseId, string $id): JsonResponse
    {
        $assignment = Assignment::where('course_id', $courseId)->findOrFail($id);

        return ApiResponse::success(['assignment' => $assignment]);
    }

    /**
     * List submissions for an assignment (Teacher).
     */
    public function submissions(string $courseId, string $id): JsonResponse
    {
        $assignment = Assignment::where('course_id', $courseId)->findOrFail($id);
        $submissions = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->with(['student.user', 'gradedBy'])
            ->get();

        return ApiResponse::success(['submissions' => $submissions]);
    }

    /**
     * Submit an assignment as a student.
     */
    public function submit(Request $request, string $courseId, string $id): JsonResponse
    {
        $assignment = Assignment::where('course_id', $courseId)->findOrFail($id);

        /** @var TenantUser $user */
        $user = $request->user();

        if (! $user->student) {
            return ApiResponse::error(
                'NOT_A_STUDENT',
                'Only authenticated students can submit assignments.',
                Response::HTTP_FORBIDDEN
            );
        }

        $studentId = $user->student->id;

        // Duplicate submission prevention
        $existing = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $studentId)
            ->first();

        if ($existing) {
            return ApiResponse::error(
                'DUPLICATE_SUBMISSION',
                'An assignment submission already exists for this student.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $isLate = $assignment->isPastDue();

        $submission = AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'student_id' => $studentId,
            'content' => $validated['content'],
            'submitted_at' => now(),
            'is_late' => $isLate,
            'status' => 'submitted',
        ]);

        return ApiResponse::success([
            'submission' => $submission->load(['student.user', 'assignment']),
        ], Response::HTTP_CREATED);
    }

    /**
     * Grade an assignment submission.
     */
    public function grade(Request $request, string $courseId, string $id, string $submissionId): JsonResponse
    {
        $assignment = Assignment::where('course_id', $courseId)->findOrFail($id);
        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)->findOrFail($submissionId);

        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:'.$assignment->points_possible,
            'feedback' => 'nullable|string',
            'is_grade_published' => 'nullable|boolean',
        ]);

        $isPublished = $validated['is_grade_published'] ?? false;

        $submission->update([
            'score' => $validated['score'],
            'feedback' => $validated['feedback'] ?? null,
            'graded_by_user_id' => $request->user()->id,
            'graded_at' => now(),
            'is_grade_published' => $isPublished,
            'status' => 'graded',
        ]);

        // Record Grade
        $maxScore = $assignment->points_possible > 0 ? $assignment->points_possible : 100.00;
        $percentage = round(($validated['score'] / $maxScore) * 100, 2);

        Grade::updateOrCreate(
            [
                'student_id' => $submission->student_id,
                'gradable_type' => 'assignment',
                'gradable_id' => $assignment->id,
            ],
            [
                'score' => $validated['score'],
                'max_score' => $maxScore,
                'percentage' => $percentage,
                'is_published' => $isPublished,
                'graded_at' => now(),
            ]
        );

        return ApiResponse::success([
            'submission' => $submission->fresh(['student.user', 'gradedBy']),
        ]);
    }

    /**
     * Publish grades for an assignment.
     */
    public function publishGrades(string $courseId, string $id): JsonResponse
    {
        $assignment = Assignment::where('course_id', $courseId)->findOrFail($id);

        AssignmentSubmission::where('assignment_id', $assignment->id)
            ->update(['is_grade_published' => true]);

        Grade::where('gradable_type', 'assignment')
            ->where('gradable_id', $assignment->id)
            ->update(['is_published' => true]);

        return ApiResponse::success([
            'message' => 'Grades published successfully for assignment.',
        ]);
    }
}
