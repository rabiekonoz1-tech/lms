'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import { attendanceApi } from '../../../lib/attendance-api';
import { analyticsApi } from '../../../lib/analytics-api';
import type { SchoolClass, ClassSession, StudentAnalyticsSnapshot } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { CalendarIcon, CheckCircleIcon, QrCodeIcon, AlertCircleIcon } from '../../../components/icons';

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [snapshot, setSnapshot] = useState<StudentAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        const cls = await attendanceApi.getClasses().catch(() => []);
        setClasses(cls);
        if (cls.length > 0) {
          const sess = await attendanceApi.getSessions(cls[0].id).catch(() => []);
          setSessions(sess);
        }

        if (user?.student?.id) {
          const snap = await analyticsApi.getStudentDashboard(user.student.id).catch(() => null);
          if (snap) setSnapshot(snap);
        }
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadAttendance();
    }
  }, [user]);

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const attendanceRate = snapshot?.attendance_rate ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon size={24} className="text-primary" />
            سجل الحضور والغياب الأكاديمي
          </h1>
          <p className="text-sm text-secondary mt-1">
            سجل تفصيلي لكافة الحصص الدراسية، أوقات التسجيل، وطرق التحقق عبر رمز الاستجابة السريعة (QR Code).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={attendanceRate >= 90 ? 'success' : attendanceRate >= 75 ? 'warning' : 'danger'}>
            نسبة الحضور: {attendanceRate}%
          </Badge>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary">إجمالي الحصص المجدولة</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalSessions}</h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-card border-border border text-secondary">
            <CalendarIcon size={20} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary">مرات الحضور المؤكد</p>
            <h3 className="text-2xl font-bold text-primary mt-1">{completedSessions}</h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
            <CheckCircleIcon size={20} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary">طريقة الرصد الغالبة</p>
            <h3 className="text-sm font-bold text-turquoise mt-1 flex items-center gap-1.5">
              <QrCodeIcon size={16} /> مسح QR Code
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-cyan-500/10 text-turquoise">
            <QrCodeIcon size={20} />
          </div>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-white mb-4">سجل الحصص الدراسية الأخيرة</h2>

        {loading ? (
          <div className="py-12 text-center text-secondary text-sm">جارٍ تحميل سجل الحضور...</div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-secondary text-sm">
            لا توجد جلسات حضور مسجلة حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-border text-secondary">
                <tr>
                  <th className="pb-3 px-3">عنوان الحصة</th>
                  <th className="pb-3 px-3">تاريخ ووقت الانعقاد</th>
                  <th className="pb-3 px-3">طريقة الرصد</th>
                  <th className="pb-3 px-3">حالة الحضور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sessions.map((sess) => {
                  const isCompleted = sess.status === 'completed';
                  const isScheduled = sess.status === 'scheduled';
                  
                  return (
                    <tr key={sess.id} className="hover:bg-card/40">
                      <td className="py-3 px-3 font-semibold text-white">{sess.title}</td>
                      <td className="py-3 px-3 text-secondary font-mono">
                        {new Date(sess.session_date).toLocaleString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-turquoise bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-medium">
                            <QrCodeIcon size={12} /> رمز QR
                          </span>
                        ) : (
                          <span className="text-secondary">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isCompleted ? (
                          <Badge variant="success">حاضر (Present)</Badge>
                        ) : isScheduled ? (
                          <Badge variant="neutral" className="bg-secondary/20 text-secondary border-none">قادم (Upcoming)</Badge>
                        ) : (
                          <Badge variant="warning">قيد الانعقاد</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
