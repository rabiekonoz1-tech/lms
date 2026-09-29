/**
 * Global TypeScript domain types matching Laravel Backend API contracts.
 */

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: 'active' | 'suspended' | 'provisioning';
  logo_url?: string;
  primary_color?: string;
}

export interface TenantUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'student' | 'staff' | 'parent';
  status: 'active' | 'suspended';
  student?: Student;
  staff?: Staff;
  parent?: ParentProfile;
  roles?: Role[];
}

export interface Student {
  id: string;
  user_id: string;
  student_code: string;
  grade_level?: string;
  status: string;
  user?: TenantUser;
}

export interface Staff {
  id: string;
  user_id: string;
  staff_type: 'teacher' | 'assistant' | 'admin';
  status: string;
  user?: TenantUser;
}

export interface ParentProfile {
  id: string;
  user_id: string;
  status: string;
  students?: Student[];
}

export interface Role {
  id: string;
  name: string;
  label: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  module: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  teacher_id?: string;
  teacher?: Staff;
  lessons?: Lesson[];
  enrollments_count?: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  sort_order: number;
  video_url?: string;
  duration_minutes?: number;
}

export interface SchoolClass {
  id: string;
  name: string;
  course_id: string;
  classroom_id?: string;
  teacher_id?: string;
  course?: Course;
}

export interface ClassSession {
  id: string;
  class_id: string;
  title: string;
  session_date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  mode: 'manual' | 'qr';
  recorded_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  points_possible: number;
  due_at?: string;
  status: 'draft' | 'published' | 'archived';
  my_submission?: AssignmentSubmission;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  content?: string;
  score?: number;
  status: 'submitted' | 'graded';
}

export interface Exam {
  id: string;
  course_id: string;
  title: string;
  total_points: number;
  duration_minutes: number;
  status: 'draft' | 'published' | 'completed';
}

export interface Grade {
  id: string;
  student_id: string;
  score: number;
  max_score: number;
  percentage: number;
  is_published: boolean;
  gradable_type: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  provider: 'google_meet' | 'zoom' | 'mock';
  external_meeting_id: string;
  join_url: string;
  passcode?: string;
  start_time?: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface MediaAsset {
  id: string;
  title: string;
  provider: string;
  external_media_id: string;
  embed_url?: string;
  playback_url?: string;
  status: string;
  duration_seconds?: number;
}

export interface StudentAnalyticsSnapshot {
  student_id: string;
  attendance_rate: number;
  assignment_completion_rate: number;
  exam_average: number;
  overall_score: number;
  last_calculated_at?: string;
}

export interface MetricDefinition {
  id: string;
  key: string;
  name: string;
  category: string;
  current_version: number;
  calculation_formula?: string;
}

export interface ReportInstance {
  id: string;
  title: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  format: string;
  file_path?: string;
  created_at: string;
  completed_at?: string;
  data_payload?: Record<string, unknown>;
}
