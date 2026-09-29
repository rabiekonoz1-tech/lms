<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\MeController;
use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\TenantCurrentController;
use App\Support\ApiResponse;
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

        // Permission-protected action (enforcing tenant.can)
        Route::post('/courses', function () {
            return ApiResponse::success(['message' => 'Course created successfully.']);
        })->middleware('tenant.can:courses.create')->name('api.courses.create');
    });
});
