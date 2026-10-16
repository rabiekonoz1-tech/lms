'use client';

import React, { useEffect, useState } from 'react';
import { educationApi } from '../../../lib/education-api';
import { assessmentApi } from '../../../lib/assessment-api';
import type { Course, Assignment } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { CheckCircleIcon, ClockIcon, FileTextIcon } from '../../../components/icons';

export default function StudentAssignmentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<{ course: Course; item: Assignment }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const cList = await educationApi.getCourses();
      setCourses(cList);

      const allAssignments: { course: Course; item: Assignment }[] = [];
      for (const course of cList) {
        const aList = await assessmentApi.getAssignments(course.id).catch(() => []);
        for (const a of aList) {
          allAssignments.push({ course, item: a });
        }
      }
      setAssignments(allAssignments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleSubmit = async (courseId: string, assignmentId: string) => {
    if (!submissionContent.trim()) return;
    try {
      await assessmentApi.submitAssignment(courseId, assignmentId, submissionContent);
      setSuccessMsg('تم تسليم الواجب بنجاح وإرساله للمعلم للتقييم!');
      setSubmittingId(null);
      setSubmissionContent('');
      loadAssignments();
    } catch {
      alert('حدث خطأ أثناء تسليم الواجب.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircleIcon size={24} className="text-primary" />
            الواجبات والتكليفات المدرسية
          </h1>
          <p className="text-sm text-secondary mt-1">
            تابع الواجبات المستحقة، ارفع الإجابات والحلول، واطلع على ملاحظات المعلم.
          </p>
        </div>
        <Badge variant="success">إجمالي الواجبات: {assignments.length}</Badge>
      </div>

      {successMsg && (
        <div className="rounded-[16px] border border-primary/30 bg-primary/10 p-4 text-primary text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs hover:underline">إغلاق</button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-secondary text-sm">جارٍ تحميل الواجبات...</div>
      ) : assignments.length === 0 ? (
        <Card className="p-12 text-center text-secondary">
          لا توجد واجبات دراسية مطلوبة حالياً.
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map(({ course, item }) => (
            <Card key={item.id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                    <FileTextIcon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-primary font-bold px-2 py-0.5 rounded bg-primary/10">
                        {course.code}
                      </span>
                      <h3 className="text-base font-bold text-white">{item.title}</h3>
                    </div>
                    <p className="text-xs text-secondary mt-1">المقرر: {course.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-secondary">
                    الدرجة: {item.points_possible} نقطة
                  </span>
                  {item.due_at && (
                    <span className="text-xs text-secondary flex items-center gap-1">
                      <ClockIcon size={12} /> تاريخ الاستحقاق: {new Date(item.due_at).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                  <Badge variant="info">مستحق</Badge>
                </div>
              </div>

              {item.description && (
                <p className="mt-3 text-sm text-secondary bg-card/60 p-3 rounded-[16px] border border-border">
                  {item.description}
                </p>
              )}

              {/* Submission Box */}
              <div className="mt-4 pt-4 border-t border-border/80">
                {submittingId === item.id ? (
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      placeholder="اكتب إجابتك أو ملخص الحل هنا..."
                      className="w-full bg-card/60 border-border/60 border border border-border rounded-[16px] p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setSubmittingId(null)}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs text-secondary hover:bg-card hover:border-border hover:border"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleSubmit(course.id, item.id)}
                        className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary text-white text-xs font-semibold"
                      >
                        إرسال الإجابة
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSubmittingId(item.id);
                      setSubmissionContent('');
                    }}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary"
                  >
                    تسليم الواجب الآن ←
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
