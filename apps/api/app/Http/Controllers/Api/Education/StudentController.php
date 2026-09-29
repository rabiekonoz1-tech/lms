<?php

namespace App\Http\Controllers\Api\Education;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * Show student profile and details.
     * Enforces:
     * - The student themselves can view their details.
     * - Staff with 'students.view' permission can view.
     * - Assistants/staff WITHOUT 'students.view' are denied (403).
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $student = Student::with(['user', 'parents', 'enrollments.course'])->findOrFail($id);

        /** @var TenantUser $user */
        $user = $request->user();

        $isSelf = $user->student && $user->student->id === $student->id;
        $canView = $user->hasPermissionTo('students.view');

        if (! $isSelf && ! $canView) {
            throw new AuthorizationException('Forbidden. You do not have permission to view student data.');
        }

        return ApiResponse::success(['student' => $student]);
    }
}
