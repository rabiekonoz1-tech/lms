'use client';

import React, { useEffect, useState } from 'react';
import { educationApi } from '../../../lib/education-api';
import type { Course } from '../../../types';
import { Badge } from '../../../components/ui/badge';
import { BookOpenIcon, CheckCircleIcon, VideoIcon } from '../../../components/icons';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Add lesson state
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await educationApi.getCourses();
      setCourses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;

    try {
      await educationApi.createCourse({
        title: newTitle,
        code: newCode,
        description: newDesc,
        status: 'published',
      });
      setNewTitle('');
      setNewCode('');
      setNewDesc('');
      setIsCreating(false);
      loadCourses();
    } catch {
      alert('حدث خطأ أثناء إنشاء المقرر.');
    }
  };

  const handleAddLesson = async (courseId: string) => {
    if (!lessonTitle.trim()) return;
    try {
      await educationApi.createLesson(courseId, {
        title: lessonTitle,
        status: 'published',
      });
      setLessonTitle('');
      setActiveCourseId(null);
      loadCourses();
    } catch {
      alert('حدث خطأ أثناء إضافة الدرس.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BookOpenIcon size={24} className="text-primary" />
            إدارة المقررات والمحتوى الأكاديمي
          </h1>
          <p className="text-sm text-secondary mt-1">
            أنشئ مقررات جديدة، نظّم الوحدات والدروس التعليمية، وارفع المواد المسجلة.
          </p>
        </div>
        <button
          onClick={() => setIsCreating((v) => !v)}
          className="inline-flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground font-medium px-4 py-2.5 rounded-[16px] text-xs transition-opacity shadow-md shadow-primary/20"
        >
          <BookOpenIcon size={16} />
          {isCreating ? 'إغلاق النموذج' : 'إضافة مقرر دراسي جديد'}
        </button>
      </div>

      {/* New Course Form */}
      {isCreating && (
        <div className="rounded-[24px] bg-[color-mix(in_srgb,var(--pri)_5%,transparent)] border border-primary/20 p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4">بيانات المقرر الجديد</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">اسم المقرر</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كيمياء عضوية - ثانوية عامة"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">كود المقرر</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: CHEM-301"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">وصف المقرر ومحاوره</label>
              <textarea
                rows={2}
                placeholder="شرح موجز لمحتوى المقرر والأهداف التعليمية..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-[16px] border border-border text-xs text-secondary hover:bg-background hover:text-foreground transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-[16px] bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs transition-opacity shadow-sm"
              >
                حفظ المقرر ونشره
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      {loading ? (
        <div className="py-16 text-center text-secondary text-sm">جارٍ تحميل المقررات...</div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center text-secondary rounded-[16px] bg-card border border-border">لا توجد مقررات دراسية حالياً.</div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="p-6 rounded-[24px] bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-[8px] bg-[color-mix(in_srgb,var(--pri)_10%,transparent)] border border-primary/20">
                      {course.code}
                    </span>
                    <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                  </div>
                  <p className="text-xs text-secondary mt-1.5 max-w-2xl leading-relaxed">{course.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[color-mix(in_srgb,var(--tq)_15%,transparent)] text-turquoise">منشور ومتاح للطلبة</span>
                  <button
                    onClick={() => setActiveCourseId(activeCourseId === course.id ? null : course.id)}
                    className="text-xs font-semibold text-primary hover:opacity-80 bg-[color-mix(in_srgb,var(--pri)_10%,transparent)] px-3 py-1.5 rounded-lg border border-primary/20 transition-opacity"
                  >
                    + إضافة درس
                  </button>
                </div>
              </div>

              {/* Add Lesson Form */}
              {activeCourseId === course.id && (
                <div className="my-4 p-4 rounded-[16px] bg-background border border-border space-y-3">
                  <h4 className="text-xs font-bold text-foreground">إضافة درس جديد للمقرر</h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="عنوان الدرس..."
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                    <button
                      onClick={() => handleAddLesson(course.id)}
                      className="px-4 py-2 rounded-lg bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold shadow-sm transition-opacity"
                    >
                      إضافة
                    </button>
                    <button
                      onClick={() => setActiveCourseId(null)}
                      className="px-3 py-2 rounded-lg border border-border text-xs text-secondary hover:text-foreground hover:bg-card transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Lessons List */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-bold text-secondary block mb-3">
                  قائمة الدروس ({course.lessons?.length ?? 0}):
                </span>
                {(!course.lessons || course.lessons.length === 0) ? (
                  <p className="text-xs text-secondary">لا توجد دروس مضافة لهذا المقرر بعد.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {course.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 rounded-[12px] bg-background border border-border hover:border-primary/30 transition-colors"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--pri)_10%,transparent)] text-primary font-bold text-xs shrink-0">
                          {lesson.sort_order || idx + 1}
                        </span>
                        <span className="font-semibold text-xs text-foreground truncate">{lesson.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
