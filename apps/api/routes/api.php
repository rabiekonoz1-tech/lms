<?php

use App\Http\Controllers\Api\HealthCheckController;
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

Route::get('/health', HealthCheckController::class)->name('api.health');
