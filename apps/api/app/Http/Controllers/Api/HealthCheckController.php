<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class HealthCheckController extends Controller
{
    /**
     * Return runtime health and readiness status.
     */
    public function __invoke(): JsonResponse
    {
        $services = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
        ];

        $isHealthy = collect($services)->every(fn (string $status) => $status === 'ok');

        $data = [
            'status' => $isHealthy ? 'healthy' : 'degraded',
            'services' => $services,
            'version' => config('app.version', '1.0.0'),
            'environment' => config('app.env', 'production'),
        ];

        $statusCode = $isHealthy ? Response::HTTP_OK : Response::HTTP_SERVICE_UNAVAILABLE;

        return ApiResponse::success($data, $statusCode);
    }

    /**
     * Check database connectivity.
     */
    protected function checkDatabase(): string
    {
        try {
            DB::connection()->getPdo();

            return 'ok';
        } catch (Throwable) {
            return 'error';
        }
    }

    /**
     * Check cache store availability.
     */
    protected function checkCache(): string
    {
        try {
            $key = 'health_check_ping';
            Cache::put($key, 'pong', 5);
            $value = Cache::get($key);

            return $value === 'pong' ? 'ok' : 'error';
        } catch (Throwable) {
            return 'error';
        }
    }
}
