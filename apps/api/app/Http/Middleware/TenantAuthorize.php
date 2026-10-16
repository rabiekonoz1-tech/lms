<?php

namespace App\Http\Middleware;

use App\Models\TenantUser;
use App\Support\Authorization\AbacEngine;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantAuthorize
{
    /**
     * Handle an incoming request requiring specific permission.
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user instanceof TenantUser) {
            throw new AuthorizationException('This action requires an authenticated tenant user.');
        }

        $abacEngine = app(AbacEngine::class);

        if (! $abacEngine->authorize($user, $permission)) {
            throw new AuthorizationException(
                sprintf('Forbidden. Missing required permission or denied by policy [%s].', $permission)
            );
        }

        return $next($request);
    }
}
