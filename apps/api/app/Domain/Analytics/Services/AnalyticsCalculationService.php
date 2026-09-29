<?php

namespace App\Domain\Analytics\Services;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\AttendanceRecord;
use App\Models\Course;
use App\Models\Grade;
use App\Models\MetricDefinition;
use App\Models\MetricMeasurement;
use App\Models\MetricVersion;
use App\Models\Student;
use App\Models\StudentAnalyticsSnapshot;

class AnalyticsCalculationService
{
    /**
     * Compute and record analytics snapshot and measurements for a student.
     */
    public function computeStudentSnapshot(Student $student, ?Course $course = null): StudentAnalyticsSnapshot
    {
        // 1. Calculate Attendance Rate
        $attendanceQuery = AttendanceRecord::where('student_id', $student->id);
        $totalAttendanceRecords = (clone $attendanceQuery)->count();
        $attendedRecords = (clone $attendanceQuery)->whereIn('status', ['present', 'late'])->count();

        $attendanceRate = $totalAttendanceRecords > 0
            ? round(($attendedRecords / $totalAttendanceRecords) * 100, 2)
            : 100.00;

        // 2. Calculate Assignment Completion Rate
        $assignmentsQuery = Assignment::query();
        if ($course) {
            $assignmentsQuery->where('course_id', $course->id);
        }
        $totalAssignments = $assignmentsQuery->count();

        $submissionsQuery = AssignmentSubmission::where('student_id', $student->id);
        if ($course) {
            $submissionsQuery->whereHas('assignment', fn ($q) => $q->where('course_id', $course->id));
        }
        $completedSubmissions = $submissionsQuery->count();

        $assignmentRate = $totalAssignments > 0
            ? round(($completedSubmissions / $totalAssignments) * 100, 2)
            : 100.00;

        // 3. Calculate Exam / Grade Average
        $gradesQuery = Grade::where('student_id', $student->id)->where('is_published', true);
        $grades = $gradesQuery->get();

        $examAverage = $grades->count() > 0
            ? round($grades->avg('percentage'), 2)
            : 100.00;

        // 4. Overall Score (Weighted: 40% Exams, 35% Assignments, 25% Attendance)
        $overallScore = round(
            ($examAverage * 0.40) + ($assignmentRate * 0.35) + ($attendanceRate * 0.25),
            2
        );

        // 5. Record discrete measurements with current metric definition versions
        $this->recordMeasurement($student, 'attendance_rate', $attendanceRate, 'Attendance Rate', 'attendance');
        $this->recordMeasurement($student, 'assignment_completion', $assignmentRate, 'Assignment Completion', 'academic');
        $this->recordMeasurement($student, 'exam_average', $examAverage, 'Exam Average', 'academic');

        // 6. Update or create fast Read Model snapshot
        $snapshot = StudentAnalyticsSnapshot::updateOrCreate(
            [
                'student_id' => $student->id,
                'course_id' => $course?->id,
            ],
            [
                'attendance_rate' => $attendanceRate,
                'assignment_completion_rate' => $assignmentRate,
                'exam_average' => $examAverage,
                'overall_score' => $overallScore,
                'last_calculated_at' => now(),
            ]
        );

        return $snapshot;
    }

    /**
     * Record an individual measurement with accurate metric definition and version.
     */
    protected function recordMeasurement(
        Student $student,
        string $metricKey,
        float $value,
        string $name,
        string $category
    ): MetricMeasurement {
        $definition = MetricDefinition::firstOrCreate(
            ['key' => $metricKey],
            [
                'name' => $name,
                'category' => $category,
                'current_version' => 1,
            ]
        );

        $version = MetricVersion::firstOrCreate(
            [
                'metric_definition_id' => $definition->id,
                'version' => $definition->current_version,
            ],
            [
                'effective_from' => now(),
                'changelog' => 'Initial metric version',
            ]
        );

        return MetricMeasurement::create([
            'student_id' => $student->id,
            'metric_definition_id' => $definition->id,
            'metric_version_id' => $version->id,
            'value' => $value,
            'recorded_at' => now(),
        ]);
    }
}
