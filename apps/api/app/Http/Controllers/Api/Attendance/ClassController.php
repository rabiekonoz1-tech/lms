<?php

namespace App\Http\Controllers\Api\Attendance;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class ClassController extends Controller
{
    /**
     * List classes.
     */
    public function index(): JsonResponse
    {
        $classes = SchoolClass::with(['teacher.user', 'students'])->get();

        return ApiResponse::success(['classes' => $classes]);
    }

    /**
     * Create a class.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'status' => 'nullable|string|in:active,archived',
        ]);

        /** @var TenantUser $user */
        $user = $request->user();

        $class = SchoolClass::create([
            'teacher_staff_id' => $user->staff?->id,
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        return ApiResponse::success(['class' => $class], Response::HTTP_CREATED);
    }

    /**
     * Show class details.
     */
    public function show(string $id): JsonResponse
    {
        $class = SchoolClass::with(['teacher.user', 'students.user', 'sessions.classroom'])->findOrFail($id);

        return ApiResponse::success(['class' => $class]);
    }

    /**
     * Enroll student into class.
     */
    public function enrollStudent(Request $request, string $id): JsonResponse
    {
        $class = SchoolClass::findOrFail($id);

        $validated = $request->validate([
            'student_id' => 'required|uuid|exists:tenant.students,id',
        ]);

        $class->students()->syncWithoutDetaching([
            $validated['student_id'] => [
                'id' => (string) Str::uuid(),
                'status' => 'active',
                'enrolled_at' => now(),
            ],
        ]);

        return ApiResponse::success(['message' => 'Student enrolled into class successfully.'], Response::HTTP_CREATED);
    }
}
