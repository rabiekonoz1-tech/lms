<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\TenantToken;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class LoginController extends Controller
{
    /**
     * Authenticate user within the active tenant context.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => 'required|string',
            'password' => 'required|string',
        ]);

        $identifier = trim($validated['identifier']);

        $user = TenantUser::with(['roles.permissions', 'student', 'staff', 'parentProfile'])
            ->where(function ($query) use ($identifier) {
                $query->where('email', $identifier)
                    ->orWhere('phone', $identifier);
            })
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return ApiResponse::error(
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid login identifier or password.',
                status: Response::HTTP_UNAUTHORIZED
            );
        }

        if (! $user->isActive()) {
            return ApiResponse::error(
                code: 'USER_INACTIVE',
                message: 'Your account is suspended or pending verification.',
                status: Response::HTTP_FORBIDDEN
            );
        }

        $tokenResult = TenantToken::createTokenFor($user);

        return ApiResponse::success([
            'token' => $tokenResult['plainTextToken'],
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'type' => $user->type,
                'roles' => $user->roles->pluck('name')->values()->all(),
                'permissions' => $user->getAllPermissions()->values()->all(),
            ],
        ]);
    }
}
