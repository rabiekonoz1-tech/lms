<?php

use App\Http\Controllers\Api\Assessment\AssignmentController;
use App\Http\Controllers\Api\Assessment\ExamController;
use App\Http\Controllers\Api\Assessment\GradeController;
use App\Http\Controllers\Api\Attendance\AttendanceController;
use App\Http\Controllers\Api\Attendance\ClassController;
use App\Http\Controllers\Api\Attendance\SessionController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\MeController;
use App\Http\Controllers\Api\Billing\EntitlementController;
use App\Http\Controllers\Api\Billing\PackageController;
use App\Http\Controllers\Api\Billing\PaymentRequestController;
use App\Http\Controllers\Api\Billing\SubscriptionController;
use App\Http\Controllers\Api\Credential\CredentialController;
use App\Http\Controllers\Api\Education\CourseController;
use App\Http\Controllers\Api\Education\EnrollmentController;
use App\Http\Controllers\Api\Education\LessonController;
use App\Http\Controllers\Api\Education\StudentController;
use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\TenantCurrentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1)
|--------------------------------------------------------------------------
|
| All routes defined here are automatically assigned to the "api" middleware
| group and prefixed with "/api/v1".
|
*/

// Public platform endpoints
Route::get('/health', HealthCheckController::class)->name('api.health');

// Tenant-scoped endpoints (protected by TenantResolutionMiddleware)
Route::middleware('tenant')->group(function () {
    Route::get('/tenant/current', TenantCurrentController::class)->name('api.tenant.current');

    // Tenant Authentication endpoints
    Route::post('/auth/login', LoginController::class)->name('api.auth.login');

    Route::middleware('tenant.auth')->group(function () {
        Route::get('/auth/me', MeController::class)->name('api.auth.me');
        Route::post('/auth/logout', LogoutController::class)->name('api.auth.logout');

        // Education - Courses
        Route::get('/courses', [CourseController::class, 'index'])->name('api.courses.index');
        Route::post('/courses', [CourseController::class, 'store'])
            ->middleware('tenant.can:courses.create')
            ->name('api.courses.create');
        Route::get('/courses/{id}', [CourseController::class, 'show'])->name('api.courses.show');
        Route::put('/courses/{id}', [CourseController::class, 'update'])
            ->middleware('tenant.can:courses.update')
            ->name('api.courses.update');
        Route::delete('/courses/{id}', [CourseController::class, 'destroy'])
            ->middleware('tenant.can:courses.delete')
            ->name('api.courses.destroy');

        // Education - Lessons
        Route::get('/courses/{courseId}/lessons', [LessonController::class, 'index'])->name('api.lessons.index');
        Route::post('/courses/{courseId}/lessons', [LessonController::class, 'store'])
            ->middleware('tenant.can:lessons.create')
            ->name('api.lessons.create');
        Route::get('/courses/{courseId}/lessons/{id}', [LessonController::class, 'show'])->name('api.lessons.show');

        // Education - Enrollments
        Route::post('/courses/{courseId}/enroll', [EnrollmentController::class, 'enroll'])->name('api.enrollments.enroll');
        Route::get('/courses/{courseId}/enrollments', [EnrollmentController::class, 'index'])
            ->middleware('tenant.can:enrollments.view')
            ->name('api.enrollments.index');
        Route::get('/students/{studentId}/enrollments', [EnrollmentController::class, 'studentEnrollments'])->name('api.students.enrollments');

        // Education - Students
        Route::get('/students/{id}', [StudentController::class, 'show'])->name('api.students.show');

        // Attendance - Classes
        Route::get('/classes', [ClassController::class, 'index'])->name('api.classes.index');
        Route::post('/classes', [ClassController::class, 'store'])
            ->middleware('tenant.can:classes.create')
            ->name('api.classes.create');
        Route::get('/classes/{id}', [ClassController::class, 'show'])->name('api.classes.show');
        Route::post('/classes/{id}/students', [ClassController::class, 'enrollStudent'])
            ->middleware('tenant.can:classes.manage_students')
            ->name('api.classes.students.enroll');

        // Attendance - Sessions
        Route::get('/classes/{classId}/sessions', [SessionController::class, 'index'])->name('api.sessions.index');
        Route::post('/classes/{classId}/sessions', [SessionController::class, 'store'])
            ->middleware('tenant.can:sessions.create')
            ->name('api.sessions.create');
        Route::get('/classes/{classId}/sessions/{id}', [SessionController::class, 'show'])->name('api.sessions.show');

        // Attendance - Records & Reporting
        Route::post('/sessions/{sessionId}/attendance', [AttendanceController::class, 'record'])
            ->middleware('tenant.can:attendance.record')
            ->name('api.attendance.record');
        Route::post('/sessions/{sessionId}/attendance/scan', [AttendanceController::class, 'qrScan'])
            ->middleware('tenant.can:attendance.record')
            ->name('api.attendance.scan');
        Route::get('/sessions/{sessionId}/attendance/report', [AttendanceController::class, 'report'])
            ->middleware('tenant.can:attendance.view')
            ->name('api.attendance.report');

        // Assessment - Assignments
        Route::get('/courses/{courseId}/assignments', [AssignmentController::class, 'index'])->name('api.assignments.index');
        Route::post('/courses/{courseId}/assignments', [AssignmentController::class, 'store'])
            ->middleware('tenant.can:assignments.create')
            ->name('api.assignments.create');
        Route::get('/courses/{courseId}/assignments/{id}', [AssignmentController::class, 'show'])->name('api.assignments.show');
        Route::post('/courses/{courseId}/assignments/{id}/submit', [AssignmentController::class, 'submit'])->name('api.assignments.submit');
        Route::post('/courses/{courseId}/assignments/{id}/submissions/{submissionId}/grade', [AssignmentController::class, 'grade'])
            ->middleware('tenant.can:assignments.grade')
            ->name('api.assignments.grade');
        Route::post('/courses/{courseId}/assignments/{id}/publish-grades', [AssignmentController::class, 'publishGrades'])
            ->middleware('tenant.can:assignments.grade')
            ->name('api.assignments.publish_grades');

        // Assessment - Exams
        Route::get('/courses/{courseId}/exams', [ExamController::class, 'index'])->name('api.exams.index');
        Route::post('/courses/{courseId}/exams', [ExamController::class, 'store'])
            ->middleware('tenant.can:exams.create')
            ->name('api.exams.create');
        Route::post('/courses/{courseId}/exams/{id}/questions', [ExamController::class, 'addQuestion'])
            ->middleware('tenant.can:exams.create')
            ->name('api.exams.questions.add');
        Route::post('/courses/{courseId}/exams/{id}/start', [ExamController::class, 'start'])->name('api.exams.start');
        Route::post('/courses/{courseId}/exams/{id}/attempts/{attemptId}/answers', [ExamController::class, 'submitAnswer'])->name('api.exams.answers.submit');
        Route::post('/courses/{courseId}/exams/{id}/attempts/{attemptId}/submit', [ExamController::class, 'submit'])->name('api.exams.submit');
        Route::post('/courses/{courseId}/exams/{id}/attempts/{attemptId}/grade', [ExamController::class, 'grade'])
            ->middleware('tenant.can:exams.grade')
            ->name('api.exams.grade');
        Route::post('/courses/{courseId}/exams/{id}/publish-grades', [ExamController::class, 'publishGrades'])
            ->middleware('tenant.can:exams.grade')
            ->name('api.exams.publish_grades');

        // Assessment - Grades
        Route::get('/students/{studentId}/grades', [GradeController::class, 'studentGrades'])->name('api.students.grades');

        // Billing - Packages
        Route::get('/packages', [PackageController::class, 'index'])->name('api.packages.index');
        Route::post('/packages', [PackageController::class, 'store'])
            ->middleware('tenant.can:packages.create')
            ->name('api.packages.create');
        Route::get('/packages/{id}', [PackageController::class, 'show'])->name('api.packages.show');

        // Billing - Payment Requests
        Route::get('/payment-requests', [PaymentRequestController::class, 'index'])->name('api.payments.index');
        Route::post('/payment-requests', [PaymentRequestController::class, 'store'])->name('api.payments.store');
        Route::get('/payment-requests/{id}', [PaymentRequestController::class, 'show'])->name('api.payments.show');
        Route::post('/payment-requests/{id}/approve', [PaymentRequestController::class, 'approve'])
            ->middleware('tenant.can:payments.approve')
            ->name('api.payments.approve');
        Route::post('/payment-requests/{id}/reject', [PaymentRequestController::class, 'reject'])
            ->middleware('tenant.can:payments.reject')
            ->name('api.payments.reject');

        // Billing - Subscriptions & Entitlements
        Route::get('/students/{studentId}/subscriptions', [SubscriptionController::class, 'index'])->name('api.students.subscriptions');
        Route::get('/students/{studentId}/entitlements', [EntitlementController::class, 'index'])->name('api.students.entitlements');

        // Credentials & Devices
        Route::get('/students/{studentId}/credentials', [CredentialController::class, 'index'])->name('api.credentials.index');
        Route::post('/credentials', [CredentialController::class, 'store'])
            ->middleware('tenant.can:credentials.create')
            ->name('api.credentials.store');
        Route::post('/credentials/{id}/activate', [CredentialController::class, 'activate'])->name('api.credentials.activate');
        Route::post('/credentials/verify', [CredentialController::class, 'verify'])->name('api.credentials.verify');
        Route::post('/credentials/{id}/replace-device', [CredentialController::class, 'replaceDevice'])
            ->middleware('tenant.can:credentials.manage_devices')
            ->name('api.credentials.replace_device');
        Route::post('/credentials/{id}/revoke', [CredentialController::class, 'revoke'])
            ->middleware('tenant.can:credentials.revoke')
            ->name('api.credentials.revoke');
    });
});
