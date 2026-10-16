'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/auth-context';
import { educationApi } from '../../../lib/education-api';
import { billingApi } from '../../../lib/billing-api';
import { attendanceApi } from '../../../lib/attendance-api';
import type { Course, SchoolClass, Student, ClassSession } from '../../../types';
import { Badge } from '../../../components/ui/badge';
import { StatCard } from '../../../components/ui/stat-card';
import { TableSkeleton } from '../../../components/ui/skeleton';
import {
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  FileTextIcon,
  UserIcon,
  UsersIcon,
  ClockIcon,
  QrCodeIcon,
  ShieldIcon,
  AlertCircleIcon,
  ArrowRightIcon,
} from '../../../components/icons';

interface SessionScheduleItem {
  id: string;
  className: string;
  courseTitle: string;
  time: string;
  room: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  enrolledCount: number;
}

interface PendingTaskItem {
  id: string;
  title: string;
  type: 'payment' | 'grading' | 'credential';
  count: number;
  link: string;
  urgency: 'high' | 'medium' | 'normal';
}

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [todaySessions, setTodaySessions] = useState<SessionScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cList, clsList, pList, stList] = await Promise.all([
          educationApi.getCourses().catch(() => []),
          attendanceApi.getClasses().catch(() => []),
          billingApi.getPaymentRequests().catch(() => []),
          educationApi.getStudents().catch(() => []),
        ]);
        setCourses(cList);
        setClasses(clsList);
        setPendingPaymentsCount(pList.filter((p) => p.status === 'pending').length);
        setStudents(stList);

        const allSessions: SessionScheduleItem[] = [];
        for (const cls of clsList.slice(0, 3)) { // Limit to avoid too many requests
          const sessList = await attendanceApi.getSessions(cls.id).catch(() => []);
          sessList.forEach(s => {
              allSessions.push({
                  id: s.id,
                  className: cls.name,
                  courseTitle: cls.course?.title || cls.course_id || 'مقرر',
                  time: new Date(s.session_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                  room: 'قاعة افتراضية / فعلية',
                  status: s.status,
                  enrolledCount: 0 // API doesn't provide this currently
              });
          });
        }
        
        // Filter for upcoming or today's sessions, and sort
        const recentOrUpcoming = allSessions.reverse().slice(0, 5);
        setTodaySessions(recentOrUpcoming);

      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const teacherName = user?.name || 'زائر';

  const pendingTasks: PendingTaskItem[] = [
    {
      id: 't-1',
      title: 'تحويلات بنكية بانتظار التدقيق والاعتماد',
      type: 'payment',
      count: pendingPaymentsCount,
      link: '/teacher/payments',
      urgency: pendingPaymentsCount > 0 ? 'high' : 'normal',
    },
    {
      id: 't-2',
      title: 'واجبات دراسية جديدة تم تسليمها وبحاجة للتصحيح',
      type: 'grading',
      count: 0, // Placeholder until API is connected
      link: '/teacher/courses',
      urgency: 'normal',
    },
  ];

  const watchlistStudents = students.slice(0, 3).map(st => ({
      id: st.id,
      name: st.user?.name || st.student_code,
      issue: 'يحتاج إلى متابعة أكاديمية',
      severity: 'warning' as 'warning' | 'danger',
      attendance: '—',
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Workspace */}
      <div className="relative overflow-hidden rounded-[28px] bg-sidebar text-white shadow-xl flex flex-col sadu">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 flex-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                بوابة المعلم وهيئة التدريس
              </span>
              <span className="text-xs text-white/70 font-mono">الفصل الدراسي الأول 2026/2027</span>
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold text-white tracking-tight">
              أهلاً بك، {teacherName} 👋
            </h1>
            <p className="mt-2 text-sm text-white/80 max-w-xl leading-relaxed">
              مساحة العمليات التعليمية: متابعة جدول محاضرات اليوم، رصد الحضور الذكي، وتدقيق الاشتراكات.
            </p>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/teacher/attendance">
              <button className="flex items-center justify-center gap-2 rounded-[16px] bg-accent text-sidebar px-5 py-2.5 font-bold text-sm hover:opacity-90 transition-opacity">
                <QrCodeIcon size={16} />
                رصد الحضور الذكي
              </button>
            </Link>
            <Link href="/teacher/payments">
              <button className="flex items-center justify-center gap-2 rounded-[16px] border border-white/50 px-5 py-2.5 font-semibold text-sm text-white hover:bg-white/10 transition-colors relative">
                <FileTextIcon size={16} />
                مراجعة التحويلات
                {pendingPaymentsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red text-[10px] font-bold text-white">
                    {pendingPaymentsCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="المقررات المعتمدة"
          value={courses.length}
          subtitle="مناهج ودروس تحت إشرافك"
          icon={<BookOpenIcon size={20} />}
          variant="indigo"
        />
        <StatCard
          title="الشعب الدراسية النشطة"
          value={classes.length}
          subtitle="مجموعات حضور بالسنتر والأونلاين"
          icon={<CalendarIcon size={20} />}
          variant="emerald"
        />
        <StatCard
          title="طلبات دفع بانتظار التدقيق"
          value={pendingPaymentsCount}
          subtitle={pendingPaymentsCount > 0 ? 'تحتاج تدقيق وتفعيل اشتراكات' : 'لا توجد طلبات معلقة'}
          icon={<FileTextIcon size={20} />}
          variant={pendingPaymentsCount > 0 ? 'amber' : 'default'}
        />
        <StatCard
          title="إجمالي الطلبة المقيدين"
          value={students.length}
          subtitle="تم جلب العدد الفعلي"
          icon={<UsersIcon size={20} />}
          variant="purple"
        />
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Schedule & Active Courses */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Today's Teaching Schedule */}
          <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ClockIcon size={20} className="text-primary" />
                <h2 className="text-lg font-bold text-foreground">جدول محاضرات وحصص اليوم</h2>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[color-mix(in_srgb,var(--pri)_15%,transparent)] text-primary">اليوم (نشط)</span>
            </div>

            <div className="space-y-3">
              {loading ? (
                 <div className="text-center text-sm text-secondary py-4">جارٍ التحميل...</div>
              ) : todaySessions.length === 0 ? (
                 <div className="text-center text-sm text-secondary py-4">لا توجد حصص مجدولة لعرضها.</div>
              ) : (
                todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-[16px] border transition-all ${
                      session.status === 'in_progress'
                        ? 'border-primary/40 bg-[color-mix(in_srgb,var(--pri)_5%,transparent)] shadow-sm'
                        : 'border-border bg-background'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{session.className}</span>
                          {session.status === 'in_progress' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--tq)_15%,transparent)] text-turquoise text-[10px] font-bold">
                              ● جارية الآن
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-border text-secondary text-[10px] font-bold">
                              {session.status === 'completed' ? 'مكتملة' : 'مجدولة'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-primary font-medium">{session.courseTitle}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-secondary mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <ClockIcon size={12} /> {session.time}
                          </span>
                          <span>•</span>
                          <span>{session.room}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link href="/teacher/attendance">
                          <button
                            className={`flex items-center gap-2 rounded-[16px] border px-4 py-2 text-xs font-semibold transition-all ${
                              session.status === 'in_progress'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-transparent text-primary border-primary'
                            }`}
                          >
                            <QrCodeIcon size={14} />
                            {session.status === 'in_progress' ? 'عرض شاشة الحضور QR' : 'تحضير الحصة'}
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Courses Overview */}
          <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpenIcon size={20} className="text-primary" />
                <h2 className="text-lg font-bold text-foreground">المقررات التعليمية المشرف عليها</h2>
              </div>
              <Link href="/teacher/courses" className="text-sm font-semibold text-primary hover:underline">
                إدارة المقررات بالكامل ←
              </Link>
            </div>

            {loading ? (
              <TableSkeleton rows={2} cols={3} />
            ) : courses.length === 0 ? (
              <div className="p-6 text-center text-secondary text-sm">
                لا توجد مقررات مسجلة. يمكنك إنشاء أول مقرر بالضغط على &quot;إدارة المقررات&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-[16px] border border-border bg-background p-5 hover:border-primary/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-primary font-bold px-2 py-0.5 rounded bg-[color-mix(in_srgb,var(--pri)_10%,transparent)]">
                          {course.code}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[color-mix(in_srgb,var(--tq)_15%,transparent)] text-turquoise">
                          نشط ومعتمد
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-foreground">{course.title}</h3>
                      <p className="mt-1.5 text-xs text-secondary line-clamp-2 leading-relaxed">
                        {course.description || 'مقرر دراسي متكامل يشمل المحاضرات والواجبات والاختبارات.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-secondary">
                      <span>{course.lessons?.length ?? 0} دروس مسجلة</span>
                      <Link
                        href="/teacher/courses"
                        className="text-primary hover:opacity-80 font-semibold"
                      >
                        عرض التفاصيل ←
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Needs Action & Watchlist */}
        <div className="space-y-6 xl:col-span-1">
          {/* Needs Action / Operations Inbox */}
          <div className="bg-card border border-border rounded-[20px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileTextIcon size={18} className="text-accent" />
                المهام والإجراءات (Needs Action)
              </h3>
            </div>

            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <Link
                  key={task.id}
                  href={task.link}
                  className="block p-3 rounded-[14px] border border-border bg-background hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-secondary group-hover:text-foreground">
                      {task.title}
                    </span>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-1 rounded-lg shrink-0 ${
                        task.count > 0 && task.urgency === 'high'
                          ? 'bg-[color-mix(in_srgb,var(--acc)_20%,transparent)] text-accent border border-accent/20'
                          : 'bg-border text-secondary'
                      }`}
                    >
                      {task.count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Students Needing Academic Follow-up */}
          <div className="bg-card border border-border rounded-[20px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertCircleIcon size={18} className="text-destructive" />
                تنبيهات أكاديمية للمتابعة
              </h3>
              <Link href="/teacher/students" className="text-xs text-primary font-semibold hover:underline">
                الكل
              </Link>
            </div>

            <div className="space-y-3">
              {watchlistStudents.length === 0 ? (
                <div className="text-center text-xs text-secondary py-4">
                  لا يوجد طلاب بحاجة للمتابعة العاجلة.
                </div>
              ) : (
                watchlistStudents.map((st) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-[14px] border border-border bg-background space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-foreground">{st.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                          st.severity === 'danger'
                            ? 'bg-[color-mix(in_srgb,var(--red)_15%,transparent)] text-destructive'
                            : 'bg-[color-mix(in_srgb,var(--acc)_15%,transparent)] text-accent'
                        }`}
                      >
                        حضور: {st.attendance}
                      </span>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">{st.issue}</p>
                    <div className="pt-2 flex justify-end">
                      <Link
                        href="/teacher/students"
                        className="text-xs text-primary hover:opacity-80 font-semibold"
                      >
                        فحص ملف الطالب ←
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
