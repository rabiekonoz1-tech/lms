<?php

namespace App\Domain\Billing\Services;

use App\Models\Entitlement;
use App\Models\PaymentRequest;
use App\Models\PaymentReviewLog;
use App\Models\Subscription;
use App\Models\TenantUser;
use App\Support\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;

class PaymentReviewService
{
    /**
     * Approve payment request, activate subscription, and grant package entitlements.
     * Enforces invariants:
     * - Payment ≠ Subscription
     * - Subscription ≠ Entitlement
     * - Payment Approval ≠ Authentication
     *
     * @return array{payment_request: PaymentRequest, subscription: Subscription, entitlements: array}
     *
     * @throws \DomainException
     */
    public function approve(PaymentRequest $paymentRequest, TenantUser $reviewer, ?string $notes = null): array
    {
        if (! $paymentRequest->isPending()) {
            throw new \DomainException('This payment request has already been processed (current status: '.$paymentRequest->status.').');
        }

        return DB::transaction(function () use ($paymentRequest, $reviewer, $notes) {
            // 1. Update PaymentRequest
            $paymentRequest->update([
                'status' => 'approved',
                'reviewed_by_user_id' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            // 2. Record Review Log
            PaymentReviewLog::create([
                'payment_request_id' => $paymentRequest->id,
                'reviewed_by_user_id' => $reviewer->id,
                'action' => 'approved',
                'reason' => $notes ?: 'Payment approved after verification.',
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
            $paymentRequest->loadMissing('package.entitlements');
            foreach ($paymentRequest->package->entitlements as $pkgEntitlement) {
                $grantedEntitlements[] = Entitlement::create([
                    'student_id' => $paymentRequest->student_id,
                    'subscription_id' => $subscription->id,
                    'entitlement_key' => $pkgEntitlement->entitlement_key,
                    'is_active' => true,
                    'expires_at' => $subscription->ends_at,
                ]);
            }

            // 5. Centralized Audit Log
            AuditLogger::log(
                action: 'payment.approved',
                entityType: 'PaymentRequest',
                entityId: $paymentRequest->id,
                payload: [
                    'amount' => $paymentRequest->amount,
                    'package_id' => $paymentRequest->package_id,
                    'subscription_id' => $subscription->id,
                    'entitlements_count' => count($grantedEntitlements),
                ],
                actorType: 'staff',
                actorId: $reviewer->id
            );

            return [
                'payment_request' => $paymentRequest->fresh(),
                'subscription' => $subscription,
                'entitlements' => $grantedEntitlements,
            ];
        });
    }

    /**
     * Reject a payment request.
     *
     * @throws \DomainException
     */
    public function reject(PaymentRequest $paymentRequest, TenantUser $reviewer, string $reason): PaymentRequest
    {
        if (! $paymentRequest->isPending()) {
            throw new \DomainException('This payment request has already been processed (current status: '.$paymentRequest->status.').');
        }

        return DB::transaction(function () use ($paymentRequest, $reviewer, $reason) {
            $paymentRequest->update([
                'status' => 'rejected',
                'rejection_reason' => $reason,
                'reviewed_by_user_id' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            PaymentReviewLog::create([
                'payment_request_id' => $paymentRequest->id,
                'reviewed_by_user_id' => $reviewer->id,
                'action' => 'rejected',
                'reason' => $reason,
                'logged_at' => now(),
            ]);

            AuditLogger::log(
                action: 'payment.rejected',
                entityType: 'PaymentRequest',
                entityId: $paymentRequest->id,
                payload: ['reason' => $reason],
                actorType: 'staff',
                actorId: $reviewer->id
            );

            return $paymentRequest->fresh();
        });
    }
}
