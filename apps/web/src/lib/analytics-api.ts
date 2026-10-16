/**
 * Analytics and Reporting API Service
 */
import { apiClient } from './api-client';
import type { StudentAnalyticsSnapshot } from '../types';

export const analyticsApi = {
  /**
   * Fast-read student dashboard snapshot.
   */
  async getStudentDashboard(studentId: string): Promise<StudentAnalyticsSnapshot> {
    const res = await apiClient.get<{ dashboard: StudentAnalyticsSnapshot }>(
      `/students/${studentId}/dashboard`
    );
    return res.data.dashboard;
  },

  /**
   * Recompute student dashboard metrics.
   */
  async refreshStudentDashboard(studentId: string): Promise<StudentAnalyticsSnapshot> {
    const res = await apiClient.post<{ dashboard: StudentAnalyticsSnapshot }>(
      `/students/${studentId}/dashboard/refresh`
    );
    return res.data.dashboard;
  },
};
