<?php

namespace App\Domain\Reporting\Services;

use App\Models\AttendanceRecord;
use App\Models\Grade;
use App\Models\ReportInstance;
use App\Models\Student;
use Exception;

class ReportGenerationService
{
    /**
     * Generate report data payload and complete the report instance.
     */
    public function generate(ReportInstance $report): ReportInstance
    {
        $report->update(['status' => 'processing']);

        try {
            $params = $report->parameters ?? [];

            // Support simulating failure for resilient testing
            if (! empty($params['simulate_failure'])) {
                throw new Exception('Data source timeout during report compilation.');
            }

            $studentId = $params['student_id'] ?? null;
            $payload = [
                'report_title' => $report->title,
                'format' => $report->format,
                'generated_at' => now()->toIso8601String(),
            ];

            if ($studentId) {
                $student = Student::with('user')->findOrFail($studentId);
                $grades = Grade::where('student_id', $student->id)->where('is_published', true)->get();
                $attendanceRecords = AttendanceRecord::where('student_id', $student->id)->get();

                $payload['student'] = [
                    'id' => $student->id,
                    'name' => $student->user->name,
                    'student_code' => $student->student_code,
                    'grade_level' => $student->grade_level,
                ];

                $payload['academic_summary'] = [
                    'total_grades' => $grades->count(),
                    'average_score' => $grades->avg('percentage') ?? 0,
                    'grades' => $grades->map(fn ($g) => [
                        'score' => $g->score,
                        'max_score' => $g->max_score,
                        'percentage' => $g->percentage,
                    ])->all(),
                ];

                $totalAtt = $attendanceRecords->count();
                $attended = $attendanceRecords->whereIn('status', ['present', 'late'])->count();
                $payload['attendance_summary'] = [
                    'total_sessions' => $totalAtt,
                    'attended_sessions' => $attended,
                    'attendance_rate' => $totalAtt > 0 ? round(($attended / $totalAtt) * 100, 2) : 100,
                ];
            } else {
                $payload['general_metrics'] = [
                    'total_students' => Student::count(),
                    'timestamp' => now()->toIso8601String(),
                ];
            }

            $report->update([
                'status' => 'completed',
                'data_payload' => $payload,
                'file_path' => "/reports/{$report->id}.{$report->format}",
                'completed_at' => now(),
            ]);
        } catch (Exception $e) {
            $report->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }

        return $report;
    }
}
