<?php

namespace App\Http\Controllers\Api\Billing;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntitlementController extends Controller
{
    /**
     * List active entitlements of a student.
     */
    public function index(Request $request, string $studentId): JsonResponse
    {
        $student = Student::findOrFail($studentId);

        /** @var TenantUser $user */
        $user = $request->user();

        $isSelf = $user->student && $user->student->id === $student->id;
        $canView = $user->hasPermissionTo('entitlements.view');

        if (! $isSelf && ! $canView) {
            throw new AuthorizationException('You are not authorized to view student entitlements.');
        }

        $entitlements = $student->entitlements()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            })
            ->get();

        return ApiResponse::success(['entitlements' => $entitlements]);
    }
}
