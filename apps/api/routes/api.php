<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\MeController;
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
    });
});
