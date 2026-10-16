'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/auth-context';
import { analyticsApi } from '../../../lib/analytics-api';
import { educationApi } from '../../../lib/education-api';
import type { Student, StudentAnalyticsSnapshot } from '../../../types';
import { Badge } from '../../../components/ui/badge';
import { AwardIcon, CalendarIcon, CheckCircleIcon, UserIcon } from '../../../components/icons';
import { Card } from '../../../components/ui/card';

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [child, setChild] = useState<Student | null>(null);
  const [snapshot, setSnapshot] = useState<StudentAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParentData = async () => {
      try {
        setLoading(true);
        // In a real app, this would be a specific API call for parent's children
        const students = await educationApi.getStudents().catch(() => []);
        if (students.length > 0) {
            const firstChild = students[0];
            setChild(firstChild);
            const data = await analyticsApi.getStudentDashboard(firstChild.id).catch(() => null);
            if (data) setSnapshot(data);
        }
      } finally {
        setLoading(false);
      }
    };
    loadParentData();
  }, []);

  const parentName = user?.name || 'ولي الأمر';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-sidebar text-white shadow-xl flex flex-col sadu">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 flex-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--acc)_20%,transparent)] text-accent px-2.5 py-0.5 text-xs font-semibold">
                بوابة ولي الأمر (Parent Guardian)
              </span>
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold text-white tracking-tight">
              أهلاً بك، {parentName} 👋
            </h1>
            <p className="mt-2 text-sm text-white/80 max-w-xl leading-relaxed">
              تابع المستوى الأكاديمي، سجل الحضور، ونتائج الاختبارات لأبنائك المسجلين بالأكاديمية أولاً بأول.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/parent/children">
              <button className="flex items-center justify-center gap-2 rounded-[16px] bg-accent text-accent-foreground px-5 py-2.5 font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-accent/30">
                <UserIcon size={16} />
                عرض ملف الطالب الكامل
              </button>
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-secondary">جارٍ تحميل بيانات الطالب...</div>
      ) : !child ? (
        <Card className="p-12 text-center text-sm text-secondary">
          لا يوجد طلاب مرتبطين بحسابك حالياً.
        </Card>
      ) : (
        <div className="rounded-[24px] bg-card border border-border p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--pri)_10%,transparent)] text-primary font-bold text-xl">
                🎓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{child.user?.name || child.student_code}</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[color-mix(in_srgb,var(--tq)_15%,transparent)] text-turquoise">طالب منتظم</span>
                </div>
                <p className="text-xs text-secondary mt-1">
                  كود الطالب: <span className="font-mono text-foreground font-semibold">{child.student_code}</span> • {child.grade_level || 'غير محدد'}
                </p>
              </div>
            </div>

            <span className="text-xs text-turquoise font-bold bg-[color-mix(in_srgb,var(--tq)_10%,transparent)] px-3 py-1.5 rounded-lg border border-turquoise/20">
              التقييم العام: {snapshot?.overall_score ?? 0}%
            </span>
          </div>

          {/* Child KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-5 rounded-[16px] bg-background border border-border hover:border-turquoise/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-secondary">
                <span>نسبة الحضور المعتمدة</span>
                <CalendarIcon size={16} className="text-turquoise" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mt-3">
                {snapshot?.attendance_rate ?? 0}%
              </h3>
            </div>

            <div className="p-5 rounded-[16px] bg-background border border-border hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-secondary">
                <span>إنجاز التكليفات والواجبات</span>
                <CheckCircleIcon size={16} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mt-3">
                {snapshot?.assignment_completion_rate ?? 0}%
              </h3>
            </div>

            <div className="p-5 rounded-[16px] bg-background border border-border hover:border-accent/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-secondary">
                <span>متوسط درجات الاختبارات</span>
                <AwardIcon size={16} className="text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mt-3">
                {snapshot?.exam_average ?? 0}%
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
