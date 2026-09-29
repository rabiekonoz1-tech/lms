<?php

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
});
