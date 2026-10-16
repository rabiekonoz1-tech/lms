<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * M13 — Production Observability Command
 *
 * Outputs a structured JSON health report covering:
 *   - Application metadata
 *   - Database connectivity (control plane)
 *   - Cache/Redis connectivity
 *   - Queue depth (pending jobs)
 *   - Tenant registry status
 *   - Key configuration invariants
 *
 * Usage:
 *   php artisan lms:health-report          (human-readable table)
 *   php artisan lms:health-report --json   (machine-readable JSON for monitoring)
 */
class HealthReportCommand extends Command
{
    protected $signature = 'lms:health-report {--json : Output as JSON}';

    protected $description = 'Run a structured system health report for monitoring and alerting';

    public function handle(): int
    {
        $checks = [
            'control_database' => $this->checkControlDatabase(),
            'cache' => $this->checkCache(),
            'queue_depth' => $this->checkQueueDepth(),
            'tenant_count' => $this->checkTenantCount(),
            'config_invariants' => $this->checkConfigInvariants(),
        ];

        $allHealthy = collect($checks)->every(fn ($c) => $c['status'] === 'ok');
        $overallStatus = $allHealthy ? 'healthy' : 'degraded';

        $report = [
            'overall_status' => $overallStatus,
            'timestamp' => now()->toIso8601String(),
            'environment' => config('app.env'),
            'version' => config('app.version', '1.0.0'),
            'checks' => $checks,
        ];

        if ($this->option('json')) {
            $this->line(json_encode($report, JSON_PRETTY_PRINT));
        } else {
            $this->renderTable($report, $checks, $overallStatus);
        }

        return $allHealthy ? self::SUCCESS : self::FAILURE;
    }

    protected function checkControlDatabase(): array
    {
        try {
            $count = DB::connection()->selectOne('SELECT COUNT(*) as c FROM tenants');

            return ['status' => 'ok', 'detail' => "connected — {$count->c} tenants"];
        } catch (Throwable $e) {
            return ['status' => 'error', 'detail' => $e->getMessage()];
        }
    }

    protected function checkCache(): array
    {
        try {
            $key = '_lms_health_'.uniqid();
            Cache::put($key, 'ok', 5);
            $val = Cache::get($key);
            Cache::forget($key);

            return $val === 'ok'
                ? ['status' => 'ok',    'detail' => 'read/write verified']
                : ['status' => 'error', 'detail' => 'value mismatch'];
        } catch (Throwable $e) {
            return ['status' => 'error', 'detail' => $e->getMessage()];
        }
    }

    protected function checkQueueDepth(): array
    {
        try {
            // Works with database queue driver; other drivers may differ
            $depth = DB::table('jobs')->count();
            $failed = DB::table('failed_jobs')->count();
            $status = $failed > 0 ? 'warn' : 'ok';

            return ['status' => $status, 'detail' => "pending={$depth} failed={$failed}"];
        } catch (Throwable) {
            // Queue table may not exist with redis driver — not an error
            return ['status' => 'ok', 'detail' => 'queue table not applicable'];
        }
    }

    protected function checkTenantCount(): array
    {
        try {
            $total = DB::table('tenants')->count();
            $active = DB::table('tenants')->where('status', 'active')->count();

            return ['status' => 'ok', 'detail' => "total={$total} active={$active}"];
        } catch (Throwable $e) {
            return ['status' => 'error', 'detail' => $e->getMessage()];
        }
    }

    protected function checkConfigInvariants(): array
    {
        $issues = [];

        if (config('app.debug') === true && config('app.env') === 'production') {
            $issues[] = 'APP_DEBUG=true in production';
        }

        if (config('app.key') === '' || config('app.key') === null) {
            $issues[] = 'APP_KEY is not set';
        }

        if (config('session.driver') === 'file' && config('app.env') === 'production') {
            $issues[] = 'SESSION_DRIVER=file in production (use redis)';
        }

        if (count($issues) > 0) {
            return ['status' => 'warn', 'detail' => implode('; ', $issues)];
        }

        return ['status' => 'ok', 'detail' => 'all invariants satisfied'];
    }

    /** @param array<string, mixed> $report */
    protected function renderTable(array $report, array $checks, string $overallStatus): void
    {
        $color = $overallStatus === 'healthy' ? 'green' : 'red';
        $this->line('');
        $this->line("<fg={$color};options=bold>  LMS System Health Report</>   {$report['timestamp']}");
        $this->line("  Environment: <fg=yellow>{$report['environment']}</>   Version: <fg=yellow>{$report['version']}</>");
        $this->line("  Overall: <fg={$color};options=bold>".strtoupper($overallStatus).'</>');
        $this->line('');

        $rows = [];
        foreach ($checks as $name => $result) {
            $icon = match ($result['status']) {
                'ok' => '<fg=green>✓</>',
                'warn' => '<fg=yellow>⚠</>',
                default => '<fg=red>✗</>',
            };
            $rows[] = [$icon, str_replace('_', ' ', $name), $result['status'], $result['detail']];
        }

        $this->table(['', 'Check', 'Status', 'Detail'], $rows);
    }
}
