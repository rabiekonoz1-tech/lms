/**
 * Attendance & Classroom Domain API Service
 */
import { apiClient } from './api-client';
import type { SchoolClass, ClassSession, AttendanceRecord } from '../types';

export interface RecordAttendancePayload {
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  attendance_mode?: 'manual' | 'qr';
  notes?: string;
}

export const attendanceApi = {
  /**
   * Fetch all classes.
   */
  async getClasses(): Promise<SchoolClass[]> {
    const res = await apiClient.get<{ classes: SchoolClass[] }>('/classes');
    return res.data.classes ?? [];
  },

  /**
   * Get single class with sessions and enrolled students.
   */
  async getClass(id: string): Promise<SchoolClass> {
    const res = await apiClient.get<{ class: SchoolClass }>(`/classes/${id}`);
    return res.data.class;
  },

  /**
   * Fetch sessions for a class.
   */
  async getSessions(classId: string): Promise<ClassSession[]> {
    const res = await apiClient.get<{ sessions: ClassSession[] }>(`/classes/${classId}/sessions`);
    return res.data.sessions ?? [];
  },

  /**
   * Record attendance for a student in a session.
   */
  async recordAttendance(sessionId: string, payload: RecordAttendancePayload): Promise<AttendanceRecord> {
    const res = await apiClient.post<{ attendance: AttendanceRecord }>(
      `/sessions/${sessionId}/attendance`,
      payload
    );
    return res.data.attendance;
  },

  /**
   * Fetch session attendance report.
   */
  async getSessionReport(sessionId: string): Promise<Record<string, unknown>> {
    const res = await apiClient.get<{ report: Record<string, unknown> }>(
      `/sessions/${sessionId}/attendance/report`
    );
    return res.data.report;
  },

  /**
   * Record attendance via real QR code scan.
   */
  async scanQr(sessionId: string, qrData: string): Promise<{ record: AttendanceRecord; student: any }> {
    const res = await apiClient.post<{ record: AttendanceRecord; student: any }>(
      `/sessions/${sessionId}/attendance/scan`,
      { qr_data: qrData }
    );
    return res.data;
  },
};
