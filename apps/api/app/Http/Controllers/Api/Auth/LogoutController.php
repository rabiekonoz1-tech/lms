<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\TenantToken;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    /**
     * Revoke current bearer token.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $bearerToken = $request->bearerToken();

        if ($bearerToken) {
            $hashed = hash('sha256', $bearerToken);
            TenantToken::where('token', $hashed)->delete();
        }

        return ApiResponse::success([
            'message' => 'Successfully logged out.',
        ]);
    }
}
