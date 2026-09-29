<?php

namespace App\Http\Middleware;

use App\Tenancy\TenantContext;
use App\Tenancy\TenantDatabaseManager;
use App\Tenancy\TenantResolver;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class TenantResolutionMiddleware
{
    public function __construct(
        protected TenantResolver $resolver,
        protected TenantContext $context,
        protected TenantDatabaseManager $dbManager
    ) {}

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $this->resolver->resolve($request);

        $this->context->setTenant($tenant);
        $this->dbManager->configureConnection($tenant);

        Log::withContext([
            'tenant_id' => $tenant->id,
            'tenant_slug' => $tenant->slug,
        ]);

        $response = $next($request);

        $response->headers->set('X-Tenant-ID', $tenant->id);
        $response->headers->set('X-Tenant-Slug', $tenant->slug);

        return $response;
    }
}
