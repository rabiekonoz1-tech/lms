'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/auth-context';
import { useTenant } from '../../../context/tenant-context';
import { educationApi } from '../../../lib/education-api';
import { integrationApi } from '../../../lib/integration-api';
import { analyticsApi } from '../../../lib/analytics-api';
import { assessmentApi } from '../../../lib/assessment-api';
import { attendanceApi } from '../../../lib/attendance-api';
import type { Course, Meeting, StudentAnalyticsSnapshot, Assignment, ClassSession } from '../../../types';
import { StatCard } from '../../../components/ui/stat-card';
import { TableSkeleton } from '../../../components/ui/skeleton';
import {
  AwardIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  GraduationCapIcon,
  VideoIcon,
  PlayIcon,
  AlertCircleIcon,
} from '../../../components/icons';

interface DeadlineItem {
  id: string;
  title: string;
  courseTitle: string;
  type: 'assignment' | 'exam';
  dueText: string;
  dueHoursRemaining: number;
  link: string;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { setTenantSlug } = useTenant();
  const [courses, setCourses] = useState<Course[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [assignments, setAssignments] = useState<{ course: Course; item: Assignment }[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [snapshot, setSnapshot] = useState<StudentAnalyticsSnapshot | null>(null);
  const [linkedAcademies, setLinkedAcademies] = useState<Array<{
    tenant_id: string;
    name: string;
    slug: string;
    logo_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    brand_tagline?: string | null;
    is_current: boolean;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cList, mList, classList, academiesData] = await Promise.all([
          educationApi.getCourses().catch(() => []),
          integrationApi.getMeetings().catch(() => []),
          attendanceApi.getClasses().catch(() => []),
          educationApi.getStudentAcademies().catch(() => ({ academies: [], total_academies: 0 })),
        ]);
        
        setCourses(cList);
        setMeetings(mList);
        if (academiesData && academiesData.academies) {
          setLinkedAcademies(academiesData.academies);
        }

        if (cList.length > 0) {
          const allAssignments: { course: Course; item: Assignment }[] = [];
          for (const course of cList) {
             const aList = await assessmentApi.getAssignments(course.id).catch(() => []);
             aList.forEach(a => allAssignments.push({ course, item: a }));
          }
          setAssignments(allAssignments);
        }

        if (classList.length > 0) {
           const sList = await attendanceApi.getSessions(classList[0].id).catch(() => []);
           setSessions(sList);
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
      loadData();
    }
  }, [user]);

  const studentName = user?.name || 'زائر';
  const studentCode = user?.student?.student_code || 'بدون كود';

  const firstCourse = courses[0];
  const firstLesson = firstCourse?.lessons?.[0];
  const continueLearningData = firstCourse ? {
    courseTitle: firstCourse.title,
    courseCode: firstCourse.code,
    lessonTitle: firstLesson ? firstLesson.title : 'لا توجد دروس حالياً',
    lessonDuration: firstLesson?.duration_minutes ? `${firstLesson.duration_minutes} دقيقة` : 'غير محدد',
    progressPercentage: snapshot?.overall_score ?? 0,
    lastWatchedTime: 'مؤخراً',
  } : null;

  const upcomingDeadlines: DeadlineItem[] = assignments
    .filter(a => a.item.due_at && new Date(a.item.due_at) > new Date())
    .map(a => {
        const hours = Math.round((new Date(a.item.due_at!).getTime() - new Date().getTime()) / (1000 * 60 * 60));
        return {
          id: a.item.id,
          title: a.item.title,
          courseTitle: a.course.title,
          type: 'assignment' as const,
          dueText: `متبقي ${hours} ساعة`,
          dueHoursRemaining: hours,
          link: '/student/assignments',
        };
    }).slice(0, 3);

  // Take the last 5 sessions for weekly attendance
  const recentSessions = sessions.slice(-5).map(s => {
      const d = new Date(s.session_date);
      const isToday = d.toDateString() === new Date().toDateString();
      const status = isToday ? 'today' : (s.status === 'completed' ? 'present' : 'upcoming');
      return {
          id: s.id,
          day: d.toLocaleDateString('ar-EG', { weekday: 'long' }),
          date: d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
          status,
      };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Welcome */}
      <div className="relative overflow-hidden rounded-[28px] bg-sidebar text-white shadow-xl flex flex-col sadu">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 flex-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--tq)_20%,transparent)] text-turquoise px-2.5 py-0.5 text-xs font-semibold">
                طالب نشط (Active Student)
              </span>
              <span className="text-xs text-white/70 font-mono">{studentCode}</span>
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold text-white tracking-tight">
              أهلاً بك، {studentName} 👋
            </h1>
            <p className="mt-2 text-sm text-white/80 max-w-xl leading-relaxed">
              منصتك الأكاديمية المتكاملة: استكمل دروسك المسجلة، تابع حصصك المباشرة، وحقق أعلى الدرجات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {meetings.length > 0 && (
              <a
                href={meetings[0].join_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-[16px] bg-turquoise text-white px-5 py-2.5 font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-turquoise/30"
              >
                <VideoIcon size={16} />
                دخول المحاضرة المباشرة
              </a>
            )}
            <Link href="/student/courses">
              <button className="flex items-center justify-center gap-2 rounded-[16px] border border-white/50 px-5 py-2.5 font-semibold text-sm text-white hover:bg-white/10 transition-colors">
                <BookOpenIcon size={16} />
                استعراض المقررات
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Unified Multi-Tenant Academies Ribbon (Phase B BR-008 & BR-009) */}
      {linkedAcademies.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-[20px] bg-card border border-border shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-primary/10 text-primary text-xs font-bold">
              🏫
            </span>
            <span className="text-xs font-bold text-foreground">
              الأكاديميات المرتبطة بحسابك الموحّد ({linkedAcademies.length}):
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {linkedAcademies.map((acad) => (
              <button
                key={acad.tenant_id}
                onClick={() => {
                  if (!acad.is_current) {
                    setTenantSlug(acad.slug);
                    window.location.reload();
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all ${
                  acad.is_current
                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: acad.primary_color || '#04c3c9' }}
                />
                <span>{acad.name}</span>
                {acad.is_current && <span className="text-[10px] opacity-90 font-mono">(النشطة)</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards (Live Analytics from Backend Snapshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="معدل الحضور التراكمي"
          value={`${snapshot?.attendance_rate ?? 0}%`}
          subtitle="مستمد من سجل الحضور"
          icon={<CalendarIcon size={20} />}
          variant="emerald"
        />
        <StatCard
          title="إنجاز الواجبات الدراسية"
          value={`${snapshot?.assignment_completion_rate ?? 0}%`}
          subtitle="نسبة تسليم الواجبات"
          icon={<BookOpenIcon size={20} />}
          variant="indigo"
        />
        <StatCard
          title="متوسط الاختبارات"
          value={`${snapshot?.exam_average ?? 0}%`}
          subtitle="أداء التقييمات الشاملة"
          icon={<GraduationCapIcon size={20} />}
          variant="default"
        />
        <StatCard
          title="المعدل العام المركب"
          value={`${snapshot?.overall_score ?? 0}%`}
          subtitle="الأداء الأكاديمي العام"
          icon={<AwardIcon size={20} />}
          variant="purple"
        />
      </div>

      {/* Continue Learning Prominent Hero Card */}
      {continueLearningData && (
        <div className="rounded-[24px] border border-primary/20 bg-card p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[color-mix(in_srgb,var(--pri)_15%,transparent)] text-primary text-xs font-bold border border-primary/20">
                  <PlayIcon size={12} className="text-primary" />
                  متابعة التعلم (Continue Learning)
                </span>
                <span className="text-xs text-secondary font-mono">{continueLearningData.courseCode}</span>
              </div>

              <h3 className="text-lg font-bold text-foreground mt-2">
                {continueLearningData.lessonTitle}
              </h3>
              <p className="text-xs text-secondary">
                مقرر: <span className="font-semibold text-foreground">{continueLearningData.courseTitle}</span> • المدة: {continueLearningData.lessonDuration}
              </p>

              {/* Progress Bar */}
              <div className="pt-3 max-w-md">
                <div className="flex justify-between text-[11px] text-secondary mb-1">
                  <span>اكتمل {continueLearningData.progressPercentage}% من الدرس</span>
                  <span>{continueLearningData.lastWatchedTime}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${continueLearningData.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <Link href="/student/courses">
                <button className="flex items-center gap-2 rounded-[16px] bg-primary text-primary-foreground px-6 py-3 font-semibold text-sm hover:opacity-90 transition-opacity">
                  <PlayIcon size={16} />
                  استئناف المشاهدة الآن
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Learning Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Enrolled Courses */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpenIcon size={20} className="text-turquoise" />
                المقررات المسجل بها حالياً ({courses.length})
              </h2>
              <Link href="/student/courses" className="text-sm font-semibold text-turquoise hover:underline">
                استعراض المنهج بالكامل ←
              </Link>
            </div>

            {loading ? (
              <TableSkeleton rows={2} cols={2} />
            ) : courses.length === 0 ? (
              <div className="p-8 text-center text-secondary text-sm">
                لا توجد مقررات دراسية مسجلة حالياً في حسابك.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-[16px] border border-border bg-background p-5 hover:border-turquoise/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-turquoise uppercase font-bold px-2 py-0.5 rounded bg-[color-mix(in_srgb,var(--tq)_15%,transparent)]">
                          {course.code || 'COURSE'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[color-mix(in_srgb,var(--pri)_10%,transparent)] text-primary">
                          نشط ومفعل
                        </span>
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-foreground group-hover:text-turquoise transition-colors">
                        {course.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-secondary line-clamp-2 leading-relaxed">
                        {course.description || 'مقرر دراسي تفاعلي يشمل الحصص والتمارين والاختبارات.'}
                      </p>

                      {/* Progress indicator */}
                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="flex justify-between text-[11px] text-secondary mb-1">
                          <span>نسبة الإنجاز</span>
                          <span className="font-mono text-turquoise font-semibold">{snapshot?.overall_score ?? 0}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                          <div className="h-full bg-turquoise rounded-full" style={{ width: `${snapshot?.overall_score ?? 0}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-secondary">
                      <span>{course.lessons?.length ?? 0} دروس مسجلة</span>
                      <Link
                        href="/student/courses"
                        className="text-turquoise hover:opacity-80 font-semibold"
                      >
                        دخول المقرر ←
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deadlines, Streak & Meetings */}
        <div className="space-y-6 xl:col-span-1">
          {/* Upcoming Deadlines Widget */}
          <div className="bg-card border border-border rounded-[20px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertCircleIcon size={18} className="text-accent" />
                استحقاقات قادمة (Deadlines)
              </h3>
              <span className="text-[11px] text-secondary">هام</span>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center text-xs text-secondary py-4">
                  لا توجد استحقاقات قادمة قريباً.
                </div>
              ) : (
                upcomingDeadlines.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-[14px] border border-border bg-background space-y-2 hover:border-accent/40 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-foreground">{item.title}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ${
                        item.dueHoursRemaining <= 24 ? 'bg-[color-mix(in_srgb,var(--red)_15%,transparent)] text-destructive' : 'bg-[color-mix(in_srgb,var(--acc)_20%,transparent)] text-accent'
                      }`}>
                        {item.type === 'assignment' ? 'واجب' : 'اختبار'}
                      </span>
                    </div>
                    <div className="text-[11px] text-secondary flex items-center justify-between">
                      <span>{item.courseTitle}</span>
                      <span className="text-accent font-semibold">{item.dueText}</span>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Link
                        href={item.link}
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        بدء الحل الآن ←
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Weekly Attendance Streak */}
          <div className="bg-card border border-border rounded-[20px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CalendarIcon size={18} className="text-turquoise" />
                سجل الحضور للحصص الأخيرة
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[color-mix(in_srgb,var(--tq)_15%,transparent)] text-turquoise">{snapshot?.attendance_rate ?? 0}%</span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              {recentSessions.length === 0 ? (
                <div className="col-span-5 text-center text-xs text-secondary py-4">
                  لم تُسجل حصص بعد.
                </div>
              ) : (
                recentSessions.map((item) => {
                  const isPresent = item.status === 'present';
                  const isToday = item.status === 'today';

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-[12px] border flex flex-col items-center justify-between transition-all ${
                        isToday
                          ? 'border-turquoise bg-[color-mix(in_srgb,var(--tq)_10%,transparent)] text-turquoise font-bold'
                          : isPresent
                          ? 'border-border bg-background text-foreground'
                          : 'border-border/50 bg-background/50 text-secondary'
                      }`}
                    >
                      <span className="text-[10px]">{item.day}</span>
                      <span className="text-xs font-bold my-1 font-mono">{item.date}</span>
                      <span className="text-[10px]">
                        {isPresent ? '✓ حاضر' : isToday ? 'اليوم' : '—'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Live Meeting if any */}
          {meetings.length > 0 && (
            <div className="bg-[color-mix(in_srgb,var(--pri)_5%,transparent)] border border-primary/20 rounded-[20px] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[color-mix(in_srgb,var(--pri)_15%,transparent)] text-primary">بث مباشر الآن</span>
                <span className="text-[11px] text-primary/70 flex items-center gap-1">
                  <ClockIcon size={12} /> {meetings[0].duration_minutes} دقيقة
                </span>
              </div>
              <h4 className="font-bold text-foreground text-sm">{meetings[0].title}</h4>
              <p className="text-xs text-secondary">منصة البث: {meetings[0].provider}</p>
              <a
                href={meetings[0].join_url}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-[16px] bg-primary hover:opacity-90 text-primary-foreground text-sm font-semibold py-2.5 transition-all shadow-md shadow-primary/20 mt-2"
              >
                <VideoIcon size={16} />
                دخول قاعة البث
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
