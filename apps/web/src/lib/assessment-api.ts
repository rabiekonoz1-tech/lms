/**
 * Assessment Domain API Service (Assignments, Exams, Grades)
 */
import { apiClient } from './api-client';
import type { Assignment, AssignmentSubmission, Exam, Grade } from '../types';

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  points_possible?: number;
  due_at?: string;
}

export interface CreateExamPayload {
  title: string;
  description?: string;
  duration_minutes?: number;
  total_points?: number;
}

export const assessmentApi = {
  /**
   * Fetch assignments for a course.
   */
  async getAssignments(courseId: string): Promise<Assignment[]> {
    const res = await apiClient.get<{ assignments: Assignment[] }>(`/courses/${courseId}/assignments`);
    return res.data.assignments ?? [];
  },

  /**
   * Create an assignment for a course.
   */
  async createAssignment(courseId: string, payload: CreateAssignmentPayload): Promise<Assignment> {
    const res = await apiClient.post<{ assignment: Assignment }>(`/courses/${courseId}/assignments`, payload);
    return res.data.assignment;
  },

  /**
   * Submit an assignment as a student.
   */
  async submitAssignment(courseId: string, assignmentId: string, content: string): Promise<AssignmentSubmission> {
    const res = await apiClient.post<{ submission: AssignmentSubmission }>(
      `/courses/${courseId}/assignments/${assignmentId}/submit`,
      { content }
    );
    return res.data.submission;
  },

  /**
   * Fetch submissions for an assignment (Teacher).
   */
  async getAssignmentSubmissions(courseId: string, assignmentId: string): Promise<AssignmentSubmission[]> {
    const res = await apiClient.get<{ submissions: AssignmentSubmission[] }>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions`
    );
    return res.data.submissions ?? [];
  },

  /**
   * Grade a student submission (Teacher).
   */
  async gradeSubmission(
    courseId: string,
    assignmentId: string,
    submissionId: string,
    score: number,
    feedback?: string
  ): Promise<void> {
    await apiClient.post(
      `/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade`,
      { score, feedback }
    );
  },

  /**
   * Fetch exams for a course.
   */
  async getExams(courseId: string): Promise<Exam[]> {
    const res = await apiClient.get<{ exams: Exam[] }>(`/courses/${courseId}/exams`);
    return res.data.exams ?? [];
  },

  /**
   * Create an exam for a course.
   */
  async createExam(courseId: string, payload: CreateExamPayload): Promise<Exam> {
    const res = await apiClient.post<{ exam: Exam }>(`/courses/${courseId}/exams`, payload);
    return res.data.exam;
  },

  /**
   * Fetch student grades.
   */
  async getStudentGrades(studentId: string): Promise<Grade[]> {
    const res = await apiClient.get<{ grades: Grade[] }>(`/students/${studentId}/grades`);
    return res.data.grades ?? [];
  },

  /**
   * Start an exam attempt.
   */
  async startExam(courseId: string, examId: string): Promise<{ attempt: any; questions: any[] }> {
    const res = await apiClient.post<{ attempt: any; questions: any[] }>(`/courses/${courseId}/exams/${examId}/start`);
    return res.data;
  },

  /**
   * Submit an answer for a specific question during an attempt.
   */
  async submitExamAnswer(courseId: string, examId: string, attemptId: string, questionId: string, answerData: any): Promise<void> {
    await apiClient.post(
      `/courses/${courseId}/exams/${examId}/attempts/${attemptId}/answers`,
      { question_id: questionId, ...answerData }
    );
  },

  /**
   * Finalize and submit the exam attempt.
   */
  async submitExam(courseId: string, examId: string, attemptId: string): Promise<{ message: string; attempt: any }> {
    const res = await apiClient.post<{ message: string; attempt: any }>(
      `/courses/${courseId}/exams/${examId}/attempts/${attemptId}/submit`
    );
    return res.data;
  },
};
