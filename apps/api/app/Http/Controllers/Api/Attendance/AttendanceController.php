<?php

namespace App\Http\Controllers\Api\Attendance;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\ClassSession;
use App\Models\Student;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AttendanceController extends Controller
{
    /**
     * Record manual attendance for a student in a session.
     */
    public function record(Request $request, string $sessionId): JsonResponse
    {
        $session = ClassSession::findOrFail($sessionId);

        $validated = $request->validate([
            'student_id' => 'required|uuid|exists:tenant.students,id',
            'status' => 'required|string|in:present,absent,late,excused',
            'notes' => 'nullable|string',
        ]);

        /** @var TenantUser $user */
        $user = $request->user();

        $record = AttendanceRecord::updateOrCreate(
            [
                'session_id' => $session->id,
                'student_id' => $validated['student_id'],
            ],
            [
                'recorded_by_user_id' => $user->id,
                'status' => $validated['status'],
                'attendance_mode' => 'manual',
                'notes' => $validated['notes'] ?? null,
                'recorded_at' => now(),
            ]
        );

        return ApiResponse::success([
            'record' => $record->load(['student.user', 'recordedBy']),
        ], Response::HTTP_OK);
    }

    /**
     * Record attendance via QR code scan.
     */
    public function qrScan(Request $request, string $sessionId): JsonResponse
    {
        $session = ClassSession::findOrFail($sessionId);

        $validated = $request->validate([
            'qr_data' => 'required|string',
        ]);

        $qrData = trim($validated['qr_data']);

        // Resolve student by student_code or UUID id
        $student = null;
        if (Str::isUuid($qrData)) {
            $student = Student::find($qrData);
        }

        if (! $student) {
            $student = Student::where('student_code', $qrData)->first();
        }

        if (! $student) {
            return ApiResponse::error(
                'INVALID_QR_CREDENTIAL',
                'The scanned QR credential could not be matched to a student in this tenant.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        /** @var TenantUser $user */
        $user = $request->user();

        $record = AttendanceRecord::updateOrCreate(
            [
                'session_id' => $session->id,
                'student_id' => $student->id,
            ],
            [
                'recorded_by_user_id' => $user->id,
                'status' => 'present',
                'attendance_mode' => 'qr',
                'notes' => 'Recorded via QR scan.',
                'recorded_at' => now(),
            ]
        );

        return ApiResponse::success([
            'record' => $record->load(['student.user', 'recordedBy']),
            'student' => $student->load('user'),
        ], Response::HTTP_OK);
    }

    /**
     * Generate attendance report for a session.
     */
    public function report(string $sessionId): JsonResponse
    {
        $session = ClassSession::with([
            'schoolClass.students.user',
            'attendanceRecords.student.user',
            'attendanceRecords.recordedBy',
        ])->findOrFail($sessionId);

        $enrolledStudents = $session->schoolClass ? $session->schoolClass->students : collect();
        $totalEnrolled = $enrolledStudents->count();

        $records = $session->attendanceRecords;
        $presentCount = $records->where('status', 'present')->count();
        $absentCount = $records->where('status', 'absent')->count();
        $lateCount = $records->where('status', 'late')->count();
        $excusedCount = $records->where('status', 'excused')->count();

        $attendanceRate = $totalEnrolled > 0
            ? round(($presentCount / $totalEnrolled) * 100, 2)
            : 0;

        return ApiResponse::success([
            'session' => [
                'id' => $session->id,
                'title' => $session->title,
                'starts_at' => $session->starts_at,
                'ends_at' => $session->ends_at,
                'status' => $session->status,
                'class' => $session->schoolClass ? [
                    'id' => $session->schoolClass->id,
                    'name' => $session->schoolClass->name,
                ] : null,
            ],
            'summary' => [
                'total_enrolled' => $totalEnrolled,
                'present' => $presentCount,
                'absent' => $absentCount,
                'late' => $lateCount,
                'excused' => $excusedCount,
                'attendance_rate_percentage' => $attendanceRate,
            ],
            'records' => $records,
        ]);
    }
}
