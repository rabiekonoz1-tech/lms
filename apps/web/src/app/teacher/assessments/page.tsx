'use client';

import React, { useEffect, useState } from 'react';
import { educationApi } from '../../../lib/education-api';
import { assessmentApi } from '../../../lib/assessment-api';
import type { Course, Assignment, Exam, AssignmentSubmission } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { AwardIcon, CheckCircleIcon, FileTextIcon, GraduationCapIcon } from '../../../components/icons';

export default function TeacherAssessmentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<{ course: Course; item: Assignment }[]>([]);
  const [exams, setExams] = useState<{ course: Course; item: Exam }[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Assignment State
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignPoints, setAssignPoints] = useState(100);
  const [assignDesc, setAssignDesc] = useState('');

  // Global Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Review & Grade State
  const [selectedAssignment, setSelectedAssignment] = useState<{ course: Course; item: Assignment } | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  // Grading Modal State
  const [activeSubmission, setActiveSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const cList = await educationApi.getCourses();
      setCourses(cList);
      if (cList.length > 0 && !selectedCourseId) {
        setSelectedCourseId(cList[0].id);
      }

      const allA: { course: Course; item: Assignment }[] = [];
      const allE: { course: Course; item: Exam }[] = [];

      for (const course of cList) {
        const aList = await assessmentApi.getAssignments(course.id).catch(() => []);
        for (const a of aList) allA.push({ course, item: a });

        const eList = await assessmentApi.getExams(course.id).catch(() => []);
        for (const e of eList) allE.push({ course, item: e });
      }

      setAssignments(allA);
      setExams(allE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !assignTitle.trim()) return;

    try {
      await assessmentApi.createAssignment(selectedCourseId, {
        title: assignTitle,
        description: assignDesc,
        points_possible: assignPoints,
      });
      setAssignTitle('');
      setAssignDesc('');
      setIsCreatingAssignment(false);
      setFeedback({ type: 'success', text: 'تم نشر الواجب للطلبة بنجاح!' });
      loadData();
    } catch {
      setFeedback({ type: 'error', text: 'حدث خطأ أثناء إنشاء الواجب. يرجى المحاولة لاحقاً.' });
    }
  };

  const handleOpenAssignment = async (assignmentObj: { course: Course; item: Assignment }) => {
    setSelectedAssignment(assignmentObj);
    setLoadingSubmissions(true);
    try {
      const subs = await assessmentApi.getAssignmentSubmissions(assignmentObj.course.id, assignmentObj.item.id);
      setSubmissions(subs);
    } catch {
      setFeedback({ type: 'error', text: 'فشل في تحميل تسليمات الطلبة. قد لا تملك الصلاحية الكافية.' });
      setSelectedAssignment(null);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenGrading = (sub: AssignmentSubmission) => {
    setActiveSubmission(sub);
    setGradeScore(sub.score || 0);
    setGradeFeedback(sub.feedback || '');
  };

  const handleSubmitGrade = async () => {
    if (!activeSubmission || !selectedAssignment) return;
    try {
      setIsGrading(true);
      await assessmentApi.gradeSubmission(
        selectedAssignment.course.id,
        selectedAssignment.item.id,
        activeSubmission.id,
        gradeScore,
        gradeFeedback
      );
      
      // Update local state
      setSubmissions((prev) =>
        prev.map((s) => (s.id === activeSubmission.id ? { ...s, score: gradeScore, feedback: gradeFeedback, status: 'graded' } : s))
      );
      setFeedback({ type: 'success', text: 'تم حفظ درجة الطالب بنجاح.' });
      setActiveSubmission(null);
    } catch {
      setFeedback({ type: 'error', text: 'حدث خطأ أثناء رصد الدرجة. تأكد من صحة الدرجة المدخلة.' });
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircleIcon size={24} className="text-turquoise" />
            إدارة الواجبات والتقييمات والاختبارات
          </h1>
          <p className="text-sm text-secondary mt-1">
            أنشئ التكليفات المدرسية والاختبارات الدورية، وراجع تسليمات الطلاب ورصد الدرجات المعتمدة.
          </p>
        </div>
        <button
          onClick={() => setIsCreatingAssignment((v) => !v)}
          className="inline-flex items-center gap-2 bg-turquoise hover:bg-turquoise text-white font-medium px-4 py-2.5 rounded-[16px] text-xs transition-colors shadow-lg shadow-indigo-600/30"
        >
          <FileTextIcon size={16} />
          {isCreatingAssignment ? 'إلغاء' : '+ إنشاء واجب دراسي جديد'}
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-[16px] border p-4 text-sm flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'border-emerald-500/30 bg-primary/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === 'success' ? '✅' : '❌'}</span>
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs text-secondary hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Create Assignment Form */}
      {isCreatingAssignment && (
        <Card className="p-6 border-turquoise/40 bg-[color-mix(in_srgb,var(--tq)_15%,transparent)]">
          <h2 className="text-base font-bold text-white mb-4">إنشاء تكليف أو واجب جديد</h2>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">المقرر الدراسي</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-card border border-border rounded-[16px] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">عنوان الواجب</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مسائل الباب الأول في الميكانيكا"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full bg-card border border-border rounded-[16px] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">الدرجة العظمى</label>
                <input
                  type="number"
                  min="1"
                  value={assignPoints}
                  onChange={(e) => setAssignPoints(Number(e.target.value))}
                  className="w-full bg-card border border-border rounded-[16px] px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">تعليمات وتفاصيل الواجب</label>
              <textarea
                rows={2}
                placeholder="اكتب التوجيهات والمسائل المطلوبة من الطالب..."
                value={assignDesc}
                onChange={(e) => setAssignDesc(e.target.value)}
                className="w-full bg-card border border-border rounded-[16px] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingAssignment(false)}
                className="px-4 py-2 rounded-[16px] border border-border text-xs text-secondary hover:bg-card hover:border-border hover:border"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-[16px] bg-turquoise hover:bg-turquoise text-white font-semibold text-xs"
              >
                نشر الواجب للطلبة
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Grid of Assignments & Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments Column */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileTextIcon size={18} className="text-primary" />
            الواجبات المنشورة ({assignments.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-secondary text-sm">جارٍ التحميل...</div>
          ) : assignments.length === 0 ? (
            <Card className="p-8 text-center text-secondary text-xs">لا توجد واجبات منشورة.</Card>
          ) : (
            assignments.map((assignmentObj) => {
              const { course, item } = assignmentObj;
              return (
                <Card 
                  key={item.id} 
                  className="p-4 space-y-2 cursor-pointer hover:border-turquoise/50 transition-colors"
                  onClick={() => handleOpenAssignment(assignmentObj)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-primary font-bold px-2 py-0.5 rounded bg-primary/10">
                      {course.code}
                    </span>
                    <Badge variant="success">{item.points_possible} نقطة</Badge>
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-secondary line-clamp-1">{item.description}</p>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-secondary">
                    <span>انقر لعرض تسليمات الطلبة والتقييم</span>
                    <span className="text-primary font-medium">منشور للطلبة</span>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Exams Column */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GraduationCapIcon size={18} className="text-turquoise" />
            الاختبارات الإلكترونية ({exams.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-secondary text-sm">جارٍ التحميل...</div>
          ) : exams.length === 0 ? (
            <Card className="p-8 text-center text-secondary text-xs">لا توجد اختبارات منشورة.</Card>
          ) : (
            exams.map(({ course, item }) => (
              <Card key={item.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-turquoise font-bold px-2 py-0.5 rounded bg-turquoise/10">
                    {course.code}
                  </span>
                  <Badge variant="info">{item.duration_minutes || 60} دقيقة</Badge>
                </div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-secondary">
                  <span>الدرجة الكلية: {item.total_points || 100}</span>
                  <span className="text-turquoise font-medium">منشور للطلبة</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Submissions List Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-card border border-border rounded-[20px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">تسليمات الطلبة: {selectedAssignment.item.title}</h3>
                <span className="text-[11px] text-secondary block mt-1">الدرجة العظمى: {selectedAssignment.item.points_possible} نقطة</span>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 rounded-[16px] bg-slate-800 text-white text-xs hover:bg-slate-700"
              >
                إغلاق
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingSubmissions ? (
                <div className="text-center text-secondary py-12 text-sm">جارٍ تحميل التسليمات...</div>
              ) : submissions.length === 0 ? (
                <div className="text-center text-secondary py-12 text-sm">لا توجد تسليمات حتى الآن.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="p-4 rounded-[16px] border border-border bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{sub.student?.user?.name || 'طالب غير معروف'}</h4>
                          {sub.is_late && <Badge variant="danger">متأخر</Badge>}
                          {sub.status === 'graded' ? <Badge variant="success">تم التقييم</Badge> : <Badge variant="info">بانتظار التقييم</Badge>}
                        </div>
                        <p className="text-[11px] text-secondary mt-1">
                          تاريخ التسليم: {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('ar-EG') : '—'}
                        </p>
                        {sub.status === 'graded' && (
                          <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                            الدرجة: {sub.score} / {selectedAssignment.item.points_possible}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleOpenGrading(sub)}
                        className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-semibold whitespace-nowrap"
                      >
                        {sub.status === 'graded' ? 'تعديل الدرجة' : 'عرض الإجابة والتقييم'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {activeSubmission && selectedAssignment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-card border border-border rounded-[20px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                تقييم إجابة الطالب: {activeSubmission.student?.user?.name || 'غير معروف'}
              </h3>
              <button
                onClick={() => setActiveSubmission(null)}
                className="text-secondary hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-2">إجابة الطالب</label>
                <div className="p-4 rounded-[16px] border border-border bg-slate-900/50 text-sm text-white whitespace-pre-wrap leading-relaxed">
                  {activeSubmission.content}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">الدرجة (من {selectedAssignment.item.points_possible})</label>
                  <input
                    type="number"
                    min="0"
                    max={selectedAssignment.item.points_possible}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">ملاحظات المعلم (اختياري)</label>
                <textarea
                  rows={3}
                  placeholder="اكتب تعليقاً على الإجابة لتوجيه الطالب..."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveSubmission(null)}
                className="px-4 py-2 rounded-[16px] border border-border text-xs text-secondary hover:bg-card hover:text-white"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmitGrade}
                disabled={isGrading}
                className="px-6 py-2 rounded-[16px] bg-primary hover:bg-primary text-white font-semibold text-xs disabled:opacity-50"
              >
                {isGrading ? 'جارٍ الحفظ...' : 'حفظ الدرجة'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
