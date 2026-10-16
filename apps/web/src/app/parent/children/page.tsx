'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs } from '../../../components/ui/tabs';
import { Modal } from '../../../components/ui/modal';
import {
  AwardIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  UserIcon,
  ShieldIcon,
  SmartphoneIcon,
  ClockIcon,
} from '../../../components/icons';
import { educationApi } from '../../../lib/education-api';
import { analyticsApi } from '../../../lib/analytics-api';
import { assessmentApi } from '../../../lib/assessment-api';
import type { Student, StudentAnalyticsSnapshot, Grade } from '../../../types';

interface ChildProfile {
  student: Student;
  analytics: StudentAnalyticsSnapshot | null;
  grades: Grade[];
}

export default function ParentChildrenPage() {
  const [childrenProfiles, setChildrenProfiles] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'courses' | 'grades' | 'attendance' | 'security'>('grades');
  const [contactTeacherName, setContactTeacherName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const stList = await educationApi.getStudents().catch(() => []);
        
        const profiles: ChildProfile[] = await Promise.all(
          stList.map(async (st) => {
             const [snap, grades] = await Promise.all([
                 analyticsApi.getStudentDashboard(st.id).catch(() => null),
                 assessmentApi.getStudentGrades(st.id).catch(() => [])
             ]);
             return { student: st, analytics: snap, grades };
          })
        );
        
        setChildrenProfiles(profiles);
        if (profiles.length > 0) {
            setSelectedChildId(profiles[0].student.id);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeProfile = childrenProfiles.find((c) => c.student.id === selectedChildId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserIcon size={24} className="text-accent" />
            الملف الأكاديمي الشامل للأبناء
          </h1>
          <p className="text-sm text-secondary mt-1">
            سجل المقررات، التقييمات الشهرية، سجل الحضور، وحالة ترخيص الأجهزة المصرح بها.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-secondary">جارٍ تحميل بيانات الطلاب...</div>
      ) : childrenProfiles.length === 0 ? (
        <Card className="p-12 text-center text-sm text-secondary">لا يوجد طلاب مرتبطين بحسابك حالياً.</Card>
      ) : (
        <>
          {/* Child Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-border pb-2">
            <Tabs
              tabs={childrenProfiles.map((c) => ({
                id: c.student.id,
                label: c.student.user?.name || c.student.student_code,
              }))}
              activeTab={selectedChildId}
              onChange={(id) => setSelectedChildId(id)}
              variant="pill"
            />

            <Badge variant="purple">{activeProfile?.student.grade_level || 'غير محدد'}</Badge>
          </div>

          {activeProfile && (
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-accent/10 text-accent font-bold text-xl border border-accent/20">
                    {(activeProfile.student.user?.name || 'ط').slice(0, 1)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{activeProfile.student.user?.name || 'بدون اسم'}</h2>
                    <p className="text-xs text-secondary mt-1">
                      رقم الهوية الأكاديمية:{' '}
                      <span className="font-mono text-accent font-bold">{activeProfile.student.student_code}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success">نشط</Badge>
                  <span className="text-xs text-primary font-semibold bg-primary/10 px-3 py-1.5 rounded-[16px] border border-primary/20">
                    المعدل العام: {activeProfile.analytics?.overall_score ?? 0}%
                  </span>
                </div>
              </div>

              {/* Inner Sub-Navigation Tabs */}
              <div className="mt-6 border-b border-border pb-3">
                <Tabs
                  tabs={[
                    { id: 'grades', label: 'سجل الدرجات' },
                    { id: 'attendance', label: 'ملخص الحضور' },
                  ]}
                  activeTab={activeTab}
                  onChange={(id) => setActiveTab(id as typeof activeTab)}
                  variant="underline"
                />
              </div>

              {/* Tab 2: Grades & Academic Transcripts */}
              {activeTab === 'grades' && (
                <div className="mt-6 overflow-x-auto">
                  {activeProfile.grades.length === 0 ? (
                      <div className="text-center text-sm text-secondary py-8">لا توجد درجات مرصودة حالياً.</div>
                  ) : (
                    <table className="w-full text-right text-xs">
                      <thead className="bg-card/60 border-b border-border text-secondary">
                        <tr>
                          <th className="py-3 px-4 font-semibold">نوع التقييم</th>
                          <th className="py-3 px-4 font-semibold">الدرجة المحققة</th>
                          <th className="py-3 px-4 font-semibold">الدرجة العظمى</th>
                          <th className="py-3 px-4 font-semibold">النسبة</th>
                          <th className="py-3 px-4 font-semibold">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {activeProfile.grades.map((grade) => (
                          <tr key={grade.id} className="hover:bg-card/40">
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {grade.gradable_type.includes('Assignment') ? 'واجب دراسي' : 'اختبار'}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-primary">
                              {grade.score}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-secondary">
                              {grade.max_score}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-white">{grade.percentage}%</td>
                            <td className="py-3.5 px-4">
                              <Badge variant={grade.is_published ? 'success' : 'neutral'}>
                                {grade.is_published ? 'معتمد' : 'تحت المراجعة'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab 3: Detailed Attendance History */}
              {activeTab === 'attendance' && (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-[16px] border border-border bg-card/50 space-y-2">
                        <div className="text-sm font-bold text-white">معدل الحضور العام</div>
                        <div className="text-2xl font-bold text-turquoise">{activeProfile.analytics?.attendance_rate ?? 0}%</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
