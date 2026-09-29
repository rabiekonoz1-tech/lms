<?php

namespace App\Http\Controllers\Api\Assessment;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Exam;
use App\Models\ExamAnswer;
use App\Models\ExamAttempt;
use App\Models\Grade;
use App\Models\Question;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExamController extends Controller
{
    /**
     * List exams of a course.
     */
    public function index(string $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);
        $exams = $course->exams()->with('questions')->get();

        return ApiResponse::success(['exams' => $exams]);
    }

    /**
     * Create an exam.
     */
    public function store(Request $request, string $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1',
            'total_points' => 'nullable|numeric|min:1',
            'status' => 'nullable|string|in:draft,published,archived',
        ]);

        $exam = $course->exams()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'duration_minutes' => $validated['duration_minutes'] ?? 60,
            'total_points' => $validated['total_points'] ?? 100.00,
            'is_published' => true,
            'is_grades_published' => false,
            'status' => $validated['status'] ?? 'published',
        ]);

        return ApiResponse::success(['exam' => $exam], Response::HTTP_CREATED);
    }

    /**
     * Add question to exam.
     */
    public function addQuestion(Request $request, string $courseId, string $id): JsonResponse
    {
        $exam = Exam::where('course_id', $courseId)->findOrFail($id);

        $validated = $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'nullable|string|in:multiple_choice,essay,true_false',
            'points' => 'nullable|numeric|min:0',
            'options' => 'nullable|array',
            'correct_answer' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        $question = $exam->questions()->create([
            'question_text' => $validated['question_text'],
            'question_type' => $validated['question_type'] ?? 'multiple_choice',
            'points' => $validated['points'] ?? 10.00,
            'options' => $validated['options'] ?? null,
            'correct_answer' => $validated['correct_answer'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return ApiResponse::success(['question' => $question], Response::HTTP_CREATED);
    }

    /**
     * Start exam as a student.
     */
    public function start(Request $request, string $courseId, string $id): JsonResponse
    {
        $exam = Exam::where('course_id', $courseId)->findOrFail($id);

        /** @var TenantUser $user */
        $user = $request->user();

        if (! $user->student) {
            return ApiResponse::error(
                'NOT_A_STUDENT',
                'Only authenticated students can attempt exams.',
                Response::HTTP_FORBIDDEN
            );
        }

        $studentId = $user->student->id;

        // Duplicate attempt check
        $existing = ExamAttempt::where('exam_id', $exam->id)
            ->where('student_id', $studentId)
            ->first();

        if ($existing) {
            return ApiResponse::error(
                'DUPLICATE_ATTEMPT',
                'An exam attempt has already been created or completed for this student.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'student_id' => $studentId,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        // Return questions without disclosing correct answers
        $questions = $exam->questions()->get(['id', 'question_text', 'question_type', 'points', 'options', 'sort_order']);

        return ApiResponse::success([
            'attempt' => $attempt,
            'questions' => $questions,
        ], Response::HTTP_CREATED);
    }

    /**
     * Submit an answer to a question during exam attempt.
     */
    public function submitAnswer(Request $request, string $courseId, string $id, string $attemptId): JsonResponse
    {
        $exam = Exam::where('course_id', $courseId)->findOrFail($id);
        $attempt = ExamAttempt::where('exam_id', $exam->id)->findOrFail($attemptId);

        /** @var TenantUser $user */
        $user = $request->user();

        if ($attempt->student_id !== $user->student?->id) {
            return ApiResponse::error('UNAUTHORIZED_ATTEMPT', 'You do not own this attempt.', Response::HTTP_FORBIDDEN);
        }

        if ($attempt->status !== 'in_progress') {
            return ApiResponse::error('ATTEMPT_NOT_ACTIVE', 'Exam attempt is already submitted or closed.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $validated = $request->validate([
            'question_id' => 'required|uuid|exists:tenant.questions,id',
            'answer_text' => 'required|string',
        ]);

        $question = Question::where('exam_id', $exam->id)->findOrFail($validated['question_id']);

        $isCorrect = null;
        $awardedPoints = null;

        if ($question->correct_answer !== null) {
            $isCorrect = trim(strtolower($validated['answer_text'])) === trim(strtolower($question->correct_answer));
            $awardedPoints = $isCorrect ? $question->points : 0.00;
        }

        $answer = ExamAnswer::updateOrCreate(
            [
                'attempt_id' => $attempt->id,
                'question_id' => $question->id,
            ],
            [
                'answer_text' => $validated['answer_text'],
                'is_correct' => $isCorrect,
                'awarded_points' => $awardedPoints,
            ]
        );

        return ApiResponse::success(['answer' => $answer]);
    }

    /**
     * Submit exam attempt for evaluation.
     */
    public function submit(Request $request, string $courseId, string $id, string $attemptId): JsonResponse
    {
        $exam = Exam::where('course_id', $courseId)->findOrFail($id);
        $attempt = ExamAttempt::where('exam_id', $exam->id)->findOrFail($attemptId);

        /** @var TenantUser $user */
        $user = $request->user();

        if ($attempt->student_id !== $user->student?->id) {
            return ApiResponse::error('UNAUTHORIZED_ATTEMPT', 'You do not own this attempt.', Response::HTTP_FORBIDDEN);
        }

        if ($attempt->status !== 'in_progress') {
            return ApiResponse::error('ATTEMPT_NOT_ACTIVE', 'Exam attempt is already submitted.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Calculate auto-graded score
        $autoScore = $attempt->answers()->whereNotNull('awarded_points')->sum('awarded_points');

        $attempt->update([
            'submitted_at' => now(),
            'score' => $autoScore,
            'status' => 'submitted',
        ]);

        return ApiResponse::success([
            'attempt' => $attempt->fresh('answers'),
            'message' => 'Exam submitted successfully.',
        ]);
    }

    /**
     * Grade an exam attempt.
     */
    public function grade(Request $request, string $courseId, string $id, string $attemptId): JsonResponse
    {
        $exam = Exam::where('course_id', $courseId)->findOrFail($id);
        $attempt = ExamAttempt::where('exam_id', $exam->id)->findOrFail($attemptId);

        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:'.$exam->total_points,
        ]);

        $attempt->update([
            'score' => $validated['score'],
            'status' => 'graded',
        ]);

        $maxScore = $exam->total_points > 0 ? $exam->total_points : 100.00;
        $percentage = round(($validated['score'] / $maxScore) * 100, 2);

        Grade::updateOrCreate(
            [
                'student_id' => $attempt->student_id,
                'gradable_type' => 'exam',
                'gradable_id' => $exam->id,
            ],
            [
                'score' => $validated['score'],
                'max_score' => $maxScore,
                'percentage' => $percentage,
                'is_published' => $exam->is_grades_published,
                'graded_at' => now(),
            ]
        );

        return ApiResponse::success(['attempt' => $attempt]);
    }

    /**
     * Publish grades for an exam.
     */
    public function publishGrades(string $courseId, string $id): JsonResponse
    {
        $exam = Exam::where('course_id', $courseId)->findOrFail($id);

        $exam->update(['is_grades_published' => true]);

        Grade::where('gradable_type', 'exam')
            ->where('gradable_id', $exam->id)
            ->update(['is_published' => true]);

        return ApiResponse::success([
            'message' => 'Grades published successfully for exam.',
        ]);
    }
}
