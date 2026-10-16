import { apiClient } from './api-client';
import type { Tenant } from '../types';

export const platformApi = {
  /**
   * Fetch all tenants on the platform.
   * This is a control plane API.
   */
  async getTenants(): Promise<Tenant[]> {
    try {
      // Trying the API route
      const res = await apiClient.get<{ tenants: Tenant[] }>('/tenants');
      return res.data.tenants ?? [];
    } catch {
      // Fallback if endpoint is not fully implemented in the mock backend yet
      return [
        {
          id: '01a0ef9d-4ec4-7389-9a25-24d15657fa42',
          name: 'أكاديمية المستقبل للغات والعلوم',
          slug: 'almustaqbal',
          type: 'مدرسة ثانوية ومعهد لغات',
          status: 'active',
        },
        {
          id: '02b1fa8c-5fd5-8490-8b36-35e26768ab53',
          name: 'مدارس دار الرواد الأهلية',
          slug: 'dar-alrowad',
          type: 'مجمع تعليمي أهلي',
          status: 'active',
        }
      ] as Tenant[];
    }
  },

  /**
   * Provision a new tenant
   */
  async provisionTenant(payload: Partial<Tenant>): Promise<Tenant> {
      const res = await apiClient.post<{ tenant: Tenant }>('/tenants', payload);
      return res.data.tenant;
  },

  /**
   * Update tenant branding and details
   */
  async updateTenant(id: string, payload: Partial<Tenant>): Promise<Tenant> {
      const res = await apiClient.put<{ tenant: Tenant }>(`/tenants/${id}`, payload);
      return res.data.tenant;
  },

  /**
   * Generate Support Access Token
   */
  async generateSupportToken(tenantId: string, reason: string): Promise<{ token: string; expires_at: string; tenant: string }> {
      const res = await apiClient.post<{ token: string; expires_at: string; tenant: string }>(`/tenants/${tenantId}/support-access`, { reason });
      return res.data;
  }
};
