<?php

namespace App\Http\Controllers\Api\Attendance;

use App\Http\Controllers\Controller;
use App\Models\ClassSession;
use App\Models\SchoolClass;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SessionController extends Controller
{
    /**
     * List sessions of a class.
     */
    public function index(string $classId): JsonResponse
    {
        $class = SchoolClass::findOrFail($classId);
        $sessions = $class->sessions()->with('classroom')->orderBy('starts_at', 'desc')->get();

        return ApiResponse::success(['sessions' => $sessions]);
    }

    /**
     * Create a session for a class.
     */
    public function store(Request $request, string $classId): JsonResponse
    {
        $class = SchoolClass::findOrFail($classId);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'classroom_id' => 'nullable|uuid|exists:tenant.classrooms,id',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'attendance_mode' => 'nullable|string|in:manual,qr,both',
            'status' => 'nullable|string|in:scheduled,in_progress,completed,cancelled',
        ]);

        $session = $class->sessions()->create([
            'classroom_id' => $validated['classroom_id'] ?? null,
            'title' => $validated['title'] ?? 'Session',
            'starts_at' => $validated['starts_at'] ?? now(),
            'ends_at' => $validated['ends_at'] ?? null,
            'attendance_mode' => $validated['attendance_mode'] ?? 'both',
            'status' => $validated['status'] ?? 'scheduled',
        ]);

        return ApiResponse::success(['session' => $session], Response::HTTP_CREATED);
    }

    /**
     * Show session details.
     */
    public function show(string $classId, string $id): JsonResponse
    {
        $session = ClassSession::with(['classroom', 'schoolClass', 'attendanceRecords.student.user'])
            ->where('class_id', $classId)
            ->findOrFail($id);

        return ApiResponse::success(['session' => $session]);
    }
}
