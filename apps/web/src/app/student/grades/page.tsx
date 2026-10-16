'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import { assessmentApi } from '../../../lib/assessment-api';
import { analyticsApi } from '../../../lib/analytics-api';
import type { Grade, StudentAnalyticsSnapshot } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { AwardIcon, FileTextIcon } from '../../../components/icons';

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [snapshot, setSnapshot] = useState<StudentAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrades = async () => {
      if (!user?.student?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [data, snap] = await Promise.all([
            assessmentApi.getStudentGrades(user.student.id).catch(() => []),
            analyticsApi.getStudentDashboard(user.student.id).catch(() => null)
        ]);
        setGrades(data);
        if (snap) setSnapshot(snap);
      } finally {
        setLoading(false);
      }
    };
    loadGrades();
  }, [user]);

  const overallScore = snapshot?.overall_score ?? 0;
  const gradeText = overallScore >= 90 ? 'ممتاز' : overallScore >= 75 ? 'جيد جداً' : overallScore >= 60 ? 'جيد' : 'مقبول';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <AwardIcon size={24} className="text-turquoise" />
            كشف الدرجات والنتائج الأكاديمية
          </h1>
          <p className="text-sm text-secondary mt-1">
            سجل رسمي للدرجات المرصودة في الواجبات المدرسية والاختبارات الدورية مع التقدير العام.
          </p>
        </div>
        <Badge variant={overallScore >= 90 ? 'success' : overallScore >= 75 ? 'info' : 'warning'}>
          التقدير العام: {gradeText} ({overallScore}%)
        </Badge>
      </div>

      {loading ? (
        <div className="py-16 text-center text-secondary text-sm">جارٍ تحميل كشف الدرجات...</div>
      ) : grades.length === 0 ? (
        <Card className="p-12 text-center text-secondary">
          لا توجد درجات مرصودة حالياً.
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-base font-bold text-white mb-4">التقييمات المرصودة رسمياً</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="border-b border-border text-secondary">
                  <tr>
                    <th className="pb-3 px-3">نوع التقييم</th>
                    <th className="pb-3 px-3">الدرجة المحصلة</th>
                    <th className="pb-3 px-3">الدرجة العظمى</th>
                    <th className="pb-3 px-3">النسبة المئوية</th>
                    <th className="pb-3 px-3">حالة الاعتماد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-card/40">
                      <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                        <FileTextIcon size={14} className="text-turquoise" />
                        {grade.gradable_type.includes('Assignment') || grade.gradable_type === 'assignment'
                          ? 'واجب منزلي'
                          : 'اختبار دراسي'}
                      </td>
                      <td className="py-3 px-3 font-bold text-primary text-sm">{grade.score}</td>
                      <td className="py-3 px-3 text-secondary">{grade.max_score}</td>
                      <td className="py-3 px-3 font-bold text-white">{grade.percentage}%</td>
                      <td className="py-3 px-3">
                        <Badge variant={grade.is_published ? 'success' : 'neutral'}>
                          {grade.is_published ? 'معتمد ومنشور' : 'قيد المراجعة'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
