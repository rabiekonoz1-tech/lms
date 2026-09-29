<?php

namespace App\Http\Controllers\Api\Credential;

use App\Http\Controllers\Controller;
use App\Models\AccessCredential;
use App\Models\Student;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CredentialController extends Controller
{
    /**
     * List access credentials for a student.
     */
    public function index(Request $request, string $studentId): JsonResponse
    {
        $student = Student::findOrFail($studentId);

        /** @var TenantUser $user */
        $user = $request->user();

        $isSelf = $user->student && $user->student->id === $student->id;
        $canView = $user->hasPermissionTo('credentials.view');

        if (! $isSelf && ! $canView) {
            throw new AuthorizationException('You are not authorized to view student credentials.');
        }

        $credentials = $student->accessCredentials()->with('deviceBinding')->get();

        return ApiResponse::success(['credentials' => $credentials]);
    }

    /**
     * Generate / Issue a new access credential.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|uuid|exists:tenant.students,id',
            'expires_at' => 'nullable|date',
        ]);

        $student = Student::findOrFail($validated['student_id']);
        $expiresAt = isset($validated['expires_at']) ? new \DateTime($validated['expires_at']) : null;

        /** @var TenantUser $user */
        $user = $request->user();

        $generated = AccessCredential::generate($student, $user, $expiresAt);

        return ApiResponse::success([
            'credential' => $generated['credential'],
            'plain_text_secret' => $generated['plainTextSecret'],
            'message' => 'Credential issued. Store plain_text_secret securely; it will not be displayed again.',
        ], Response::HTTP_CREATED);
    }

    /**
     * Activate credential and bind initial device.
     */
    public function activate(Request $request, string $id): JsonResponse
    {
        $credential = AccessCredential::with('deviceBinding')->findOrFail($id);

        if ($credential->isRevoked()) {
            return ApiResponse::error('CREDENTIAL_REVOKED', 'This credential has been revoked.', Response::HTTP_FORBIDDEN);
        }

        if ($credential->isExpired()) {
            return ApiResponse::error('CREDENTIAL_EXPIRED', 'This credential has expired.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'secret' => 'required|string',
            'device_id' => 'required|string',
            'device_fingerprint' => 'required|string',
            'device_name' => 'nullable|string',
        ]);

        if (! $credential->verifySecret($validated['secret'])) {
            return ApiResponse::error('INVALID_CREDENTIAL_SECRET', 'The provided credential secret is invalid.', Response::HTTP_UNAUTHORIZED);
        }

        $credential->update([
            'status' => 'active',
            'activated_at' => now(),
        ]);

        $deviceBinding = $credential->bindDevice(
            $validated['device_id'],
            $validated['device_fingerprint'],
            $validated['device_name'] ?? null
        );

        return ApiResponse::success([
            'credential' => $credential->fresh(),
            'device_binding' => $deviceBinding,
            'message' => 'Credential activated and initial device bound successfully.',
        ]);
    }

    /**
     * Verify credential and enforce device binding policy.
     */
    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'credential_code' => 'required|string',
            'secret' => 'required|string',
            'device_id' => 'required|string',
            'device_fingerprint' => 'required|string',
        ]);

        $credential = AccessCredential::with(['student.user', 'deviceBinding'])
            ->where('credential_code', $validated['credential_code'])
            ->first();

        if (! $credential) {
            return ApiResponse::error('CREDENTIAL_NOT_FOUND', 'Credential code not found.', Response::HTTP_NOT_FOUND);
        }

        if ($credential->isRevoked()) {
            return ApiResponse::error('CREDENTIAL_REVOKED', 'This credential has been revoked.', Response::HTTP_FORBIDDEN);
        }

        if ($credential->isExpired()) {
            return ApiResponse::error('CREDENTIAL_EXPIRED', 'This credential has expired.', Response::HTTP_FORBIDDEN);
        }

        if (! $credential->verifySecret($validated['secret'])) {
            return ApiResponse::error('INVALID_CREDENTIAL_SECRET', 'Invalid secret.', Response::HTTP_UNAUTHORIZED);
        }

        if ($credential->status !== 'active') {
            return ApiResponse::error('CREDENTIAL_NOT_ACTIVE', 'Credential is not yet active.', Response::HTTP_FORBIDDEN);
        }

        // Check Device Binding
        $currentBinding = $credential->deviceBinding;

        if (! $currentBinding) {
            // First device auto-bind
            $currentBinding = $credential->bindDevice($validated['device_id'], $validated['device_fingerprint']);
        } elseif (! $currentBinding->matchesDevice($validated['device_id'], $validated['device_fingerprint'])) {
            return ApiResponse::error(
                'SECOND_DEVICE_PROHIBITED',
                'Access denied. This credential is bound to another device. Contact support to request device replacement.',
                Response::HTTP_FORBIDDEN
            );
        }

        return ApiResponse::success([
            'verified' => true,
            'student' => $credential->student,
            'credential' => $credential,
            'device_binding' => $currentBinding,
        ]);
    }

    /**
     * Replace device binding (Authorized staff action).
     */
    public function replaceDevice(Request $request, string $id): JsonResponse
    {
        $credential = AccessCredential::findOrFail($id);

        $validated = $request->validate([
            'new_device_id' => 'required|string',
            'new_device_fingerprint' => 'required|string',
            'new_device_name' => 'nullable|string',
            'reason' => 'required|string|max:500',
        ]);

        /** @var TenantUser $user */
        $user = $request->user();

        $newBinding = $credential->replaceDevice(
            $validated['new_device_id'],
            $validated['new_device_fingerprint'],
            $validated['reason'],
            $user,
            $validated['new_device_name'] ?? null
        );

        return ApiResponse::success([
            'credential' => $credential->fresh(),
            'device_binding' => $newBinding,
            'message' => 'Device replacement authorized and updated successfully.',
        ]);
    }

    /**
     * Revoke credential.
     */
    public function revoke(Request $request, string $id): JsonResponse
    {
        $credential = AccessCredential::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $credential->revoke($validated['reason']);

        return ApiResponse::success([
            'credential' => $credential->fresh(),
            'message' => 'Credential revoked successfully.',
        ]);
    }
}
