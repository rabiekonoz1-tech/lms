/**
 * Billing & Packages Domain API Service
 */
import { apiClient } from './api-client';

export interface PackageItem {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  status: string;
}

export interface PaymentRequestItem {
  id: string;
  student_id: string;
  package_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected';
  sender_phone?: string;
  reference_code?: string;
  proof_url?: string;
  rejection_reason?: string;
  submitted_at?: string;
  reviewed_at?: string;
  student?: { id: string; user?: { name: string; email?: string; phone?: string } };
  package?: PackageItem & { entitlements?: Array<{ id: string; entitlement_type: string; max_usage_limit?: number }> };
  reviewer?: { name?: string };
  reviewLogs?: Array<{
    id: string;
    action: string;
    reason?: string;
    logged_at: string;
    reviewer?: { name?: string };
  }>;
  created_at?: string;
}

export const billingApi = {
  async getPackages(): Promise<PackageItem[]> {
    const res = await apiClient.get<{ packages: PackageItem[] }>('/packages');
    return res.data.packages ?? [];
  },

  async getPaymentRequests(): Promise<PaymentRequestItem[]> {
    const res = await apiClient.get<{ payment_requests: PaymentRequestItem[] }>('/payment-requests');
    return res.data.payment_requests ?? [];
  },

  async getPaymentRequest(id: string): Promise<PaymentRequestItem> {
    const res = await apiClient.get<{ payment_request: PaymentRequestItem }>(`/payment-requests/${id}`);
    return res.data.payment_request;
  },

  async approvePayment(id: string): Promise<void> {
    await apiClient.post(`/payment-requests/${id}/approve`);
  },

  async rejectPayment(id: string, reason: string): Promise<void> {
    await apiClient.post(`/payment-requests/${id}/reject`, { reason });
  },

  async getStudentSubscriptions(studentId: string): Promise<unknown[]> {
    const res = await apiClient.get<{ subscriptions: unknown[] }>(`/students/${studentId}/subscriptions`);
    return res.data.subscriptions ?? [];
  },
};

