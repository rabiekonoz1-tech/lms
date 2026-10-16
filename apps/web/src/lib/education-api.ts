/**
 * Education Domain API Service (Courses, Lessons, Enrollments)
 * Adheres to Phase G and Phase F backend contract.
 */
import { apiClient } from './api-client';
import type { Course, Lesson, Student } from '../types';


export interface CreateCoursePayload {
  title: string;
  code: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface CreateLessonPayload {
  title: string;
  sort_order?: number;
  content?: string;
  status?: 'draft' | 'published';
}

export const educationApi = {
  /**
   * Fetch all courses in the tenant.
   */
  async getCourses(): Promise<Course[]> {
    const res = await apiClient.get<{ courses: Course[] }>('/courses');
    return res.data.courses ?? [];
  },

  /**
   * Get single course details with lessons and teacher.
   */
  async getCourse(id: string): Promise<Course> {
    const res = await apiClient.get<{ course: Course }>(`/courses/${id}`);
    return res.data.course;
  },

  /**
   * Create a new course (Teacher/Admin).
   */
  async createCourse(data: CreateCoursePayload): Promise<Course> {
    const res = await apiClient.post<{ course: Course }>('/courses', data);
    return res.data.course;
  },

  /**
   * Fetch lessons for a specific course.
   */
  async getLessons(courseId: string): Promise<Lesson[]> {
    const res = await apiClient.get<{ lessons: Lesson[] }>(`/courses/${courseId}/lessons`);
    return res.data.lessons ?? [];
  },

  /**
   * Add a lesson to a course.
   */
  async createLesson(courseId: string, data: CreateLessonPayload): Promise<Lesson> {
    const res = await apiClient.post<{ lesson: Lesson }>(`/courses/${courseId}/lessons`, data);
    return res.data.lesson;
  },

  /**
   * Fetch all students in the tenant (Requires 'students.view' permission).
   */
  async getStudents(params?: { grade_level?: string; search?: string }): Promise<Student[]> {
    const res = await apiClient.get<{ students: Student[] }>('/students', { params });
    return res.data.students ?? [];
  },

  /**
   * Get student details by ID.
   */
  async getStudent(id: string): Promise<Student> {
    const res = await apiClient.get<{ student: Student }>(`/students/${id}`);
    return res.data.student;
  },

  /**
   * Enroll the student in a course.
   */
  async enroll(courseId: string, studentId: string): Promise<void> {
    await apiClient.post(`/courses/${courseId}/enroll`, { student_id: studentId });
  },

  /**
   * Fetch linked academies for student unified multi-tenant overview.
   */
  async getStudentAcademies(): Promise<{
    global_identity: { id?: string | null; name: string; email?: string | null; phone?: string | null };
    academies: Array<{
      tenant_id: string;
      name: string;
      slug: string;
      logo_url?: string | null;
      primary_color?: string | null;
      secondary_color?: string | null;
      brand_tagline?: string | null;
      is_current: boolean;
    }>;
    total_academies: number;
  }> {
    try {
      const res = await apiClient.get<{
        global_identity: { id?: string | null; name: string; email?: string | null; phone?: string | null };
        academies: Array<{
          tenant_id: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          brand_tagline?: string | null;
          is_current: boolean;
        }>;
        total_academies: number;
      }>('/student/academies');
      return res.data;
    } catch {
      return {
        global_identity: { name: 'الطالب' },
        academies: [],
        total_academies: 0,
      };
    }
  },
};

