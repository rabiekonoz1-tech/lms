<?php

namespace App\Http\Middleware;

use App\Models\TenantUser;
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

        if (! $user->hasPermissionTo($permission)) {
            throw new AuthorizationException(
                sprintf('Forbidden. Missing required permission [%s].', $permission)
            );
        }

        return $next($request);
    }
}
