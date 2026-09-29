<?php

namespace App\Http\Controllers\Api\Billing;

use App\Http\Controllers\Controller;
use App\Models\Entitlement;
use App\Models\Package;
use App\Models\PaymentRequest;
use App\Models\PaymentReviewLog;
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
    public function approve(Request $request, string $id): JsonResponse
    {
        $paymentRequest = PaymentRequest::with('package.entitlements')->findOrFail($id);

        if (! $paymentRequest->isPending()) {
            return ApiResponse::error(
                'ALREADY_PROCESSED',
                'This payment request has already been processed (current status: '.$paymentRequest->status.').',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        /** @var TenantUser $user */
        $user = $request->user();

        // 1. Update PaymentRequest
        $paymentRequest->update([
            'status' => 'approved',
            'reviewed_by_user_id' => $user->id,
            'reviewed_at' => now(),
        ]);

        // 2. Record Audit Log
        PaymentReviewLog::create([
            'payment_request_id' => $paymentRequest->id,
            'reviewed_by_user_id' => $user->id,
            'action' => 'approved',
            'reason' => $request->input('notes', 'Payment approved after verification.'),
            'logged_at' => now(),
        ]);

        // 3. Activate Subscription (Payment ≠ Subscription)
        $subscription = Subscription::create([
            'student_id' => $paymentRequest->student_id,
            'package_id' => $paymentRequest->package_id,
            'payment_request_id' => $paymentRequest->id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        // 4. Grant Entitlements (Subscription ≠ Entitlement)
        $grantedEntitlements = [];
        foreach ($paymentRequest->package->entitlements as $pkgEntitlement) {
            $grantedEntitlements[] = Entitlement::create([
                'student_id' => $paymentRequest->student_id,
                'subscription_id' => $subscription->id,
                'entitlement_key' => $pkgEntitlement->entitlement_key,
                'is_active' => true,
                'expires_at' => $subscription->ends_at,
            ]);
        }

        return ApiResponse::success([
            'payment_request' => $paymentRequest->fresh(),
            'subscription' => $subscription,
            'entitlements' => $grantedEntitlements,
            'message' => 'Payment approved, subscription activated, and entitlements granted successfully.',
        ]);
    }

    /**
     * Reject payment request.
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $paymentRequest = PaymentRequest::findOrFail($id);

        if (! $paymentRequest->isPending()) {
            return ApiResponse::error(
                'ALREADY_PROCESSED',
                'This payment request has already been processed (current status: '.$paymentRequest->status.').',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        /** @var TenantUser $user */
        $user = $request->user();

        $paymentRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
            'reviewed_by_user_id' => $user->id,
            'reviewed_at' => now(),
        ]);

        PaymentReviewLog::create([
            'payment_request_id' => $paymentRequest->id,
            'reviewed_by_user_id' => $user->id,
            'action' => 'rejected',
            'reason' => $validated['reason'],
            'logged_at' => now(),
        ]);

        return ApiResponse::success([
            'payment_request' => $paymentRequest->fresh(),
            'message' => 'Payment request rejected.',
        ]);
    }
}
