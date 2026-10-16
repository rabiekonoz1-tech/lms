<?php

namespace App\Http\Controllers\Api\Billing;

use App\Domain\Billing\Services\PaymentReviewService;
use App\Http\Controllers\Controller;
use App\Models\Entitlement;
use App\Models\Package;
use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PaymentRequestController extends Controller
{
    /**
     * List payment requests.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var TenantUser $user */
        $user = $request->user();

        $query = PaymentRequest::with(['student.user', 'package', 'reviewer']);

        if (! $user->hasPermissionTo('payments.view')) {
            if ($user->student) {
                $query->where('student_id', $user->student->id);
            } else {
                return ApiResponse::success(['payment_requests' => []]);
            }
        }

        $requests = $query->orderBy('submitted_at', 'desc')->get();

        return ApiResponse::success(['payment_requests' => $requests]);
    }

    /**
     * Student submits a payment request.
     */
    public function store(Request $request): JsonResponse
    {
        /** @var TenantUser $user */
        $user = $request->user();

        if (! $user->student) {
            return ApiResponse::error(
                'NOT_A_STUDENT',
                'Only authenticated students can submit payment requests.',
                Response::HTTP_FORBIDDEN
            );
        }

        $validated = $request->validate([
            'package_id' => 'required|uuid|exists:tenant.packages,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:instapay,cash,bank_transfer',
            'sender_phone' => 'nullable|string|max:30',
            'reference_code' => 'nullable|string|max:100',
            'proof_url' => 'nullable|string|max:500',
        ]);

        $package = Package::findOrFail($validated['package_id']);

        $paymentRequest = PaymentRequest::create([
            'student_id' => $user->student->id,
            'package_id' => $package->id,
            'amount' => $validated['amount'],
            'currency' => $package->currency ?? 'EGP',
            'payment_method' => $validated['payment_method'],
            'sender_phone' => $validated['sender_phone'] ?? null,
            'reference_code' => $validated['reference_code'] ?? null,
            'proof_url' => $validated['proof_url'] ?? null,
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        return ApiResponse::success([
            'payment_request' => $paymentRequest->load(['student.user', 'package']),
        ], Response::HTTP_CREATED);
    }

    /**
     * Show payment request details.
     */
    public function show(string $id): JsonResponse
    {
        $paymentRequest = PaymentRequest::with([
            'student.user',
            'package.entitlements',
            'reviewer',
            'reviewLogs.reviewer',
            'subscription.entitlements',
        ])->findOrFail($id);

        return ApiResponse::success(['payment_request' => $paymentRequest]);
    }

    /**
     * Approve payment request.
     * Enforces:
     * - Requires 'payments.approve'
     * - Prevents duplicate approval
     * - Activates Subscription (Payment ≠ Subscription)
     * - Grants Entitlements (Subscription ≠ Entitlement)
     * - Records Audit Log
     */
    public function approve(Request $request, string $id, PaymentReviewService $reviewService): JsonResponse
    {
        $paymentRequest = PaymentRequest::with('package.entitlements')->findOrFail($id);

        try {
            $result = $reviewService->approve($paymentRequest, $request->user(), $request->input('notes'));

            return ApiResponse::success([
                'payment_request' => $result['payment_request'],
                'subscription' => $result['subscription'],
                'entitlements' => $result['entitlements'],
                'message' => 'Payment approved, subscription activated, and entitlements granted successfully.',
            ]);
        } catch (\DomainException $e) {
            return ApiResponse::error(
                'ALREADY_PROCESSED',
                $e->getMessage(),
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }
    }

    /**
     * Reject payment request.
     */
    public function reject(Request $request, string $id, PaymentReviewService $reviewService): JsonResponse
    {
        $paymentRequest = PaymentRequest::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        try {
            $rejected = $reviewService->reject($paymentRequest, $request->user(), $validated['reason']);

            return ApiResponse::success([
                'payment_request' => $rejected,
                'message' => 'Payment request rejected.',
            ]);
        } catch (\DomainException $e) {
            return ApiResponse::error(
                'ALREADY_PROCESSED',
                $e->getMessage(),
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }
    }
}
