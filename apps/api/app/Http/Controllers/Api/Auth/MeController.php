<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    /**
     * Return authenticated user profile and permissions.
     */
    public function __invoke(Request $request): JsonResponse
    {
        /** @var TenantUser $user */
        $user = $request->user();
        $user->loadMissing(['roles.permissions', 'student', 'staff', 'parentProfile']);

        $profile = null;
        if ($user->student) {
            $profile = [
                'type' => 'student',
                'student_code' => $user->student->student_code,
                'grade_level' => $user->student->grade_level,
                'global_identity_id' => $user->student->global_identity_id,
            ];
        } elseif ($user->staff) {
            $profile = [
                'type' => 'staff',
                'staff_type' => $user->staff->staff_type,
            ];
        } elseif ($user->parentProfile) {
            $profile = [
                'type' => 'parent',
            ];
        }

        return ApiResponse::success([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'type' => $user->type,
            'status' => $user->status,
            'profile' => $profile,
            'roles' => $user->roles->pluck('name')->values()->all(),
            'permissions' => $user->getAllPermissions()->values()->all(),
        ]);
    }
}
