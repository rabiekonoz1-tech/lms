'use client';

import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  AwardIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  GraduationCapIcon,
  QrCodeIcon,
  VideoIcon,
} from '../icons';

export const StudentDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Welcome */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-950 p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="success">طالب متميز (Active Student)</Badge>
              <span className="text-xs text-slate-400 font-mono">STU-2026-001</span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white tracking-tight">
              أهلاً بك مجدداً، عمر الأحمد 👋
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl leading-relaxed">
              لديك اليوم <span className="text-emerald-400 font-semibold">محاضرة مباشرة في الفيزياء</span> واختبار قصير في الرياضيات مستحق خلال 24 ساعة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" className="shadow-emerald-600/30">
              <VideoIcon size={16} />
              انضم للمحاضرة المباشرة
            </Button>
            <Button variant="outline">
              <QrCodeIcon size={16} />
              بطاقة الحضور
            </Button>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      {/* KPI Cards (Read Model Snapshots - M10 Invariant: Fast Read Model Serving) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">معدل الحضور التراكمي</p>
            <h3 className="mt-1 text-2xl font-bold text-white">96.5%</h3>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircleIcon size={12} /> منتظم ومطابق للنسبة المطلوبة
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CalendarIcon size={24} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">إنجاز الواجبات</p>
            <h3 className="mt-1 text-2xl font-bold text-white">100%</h3>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircleIcon size={12} /> تم تسليم 8 من 8 واجبات
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpenIcon size={24} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">متوسط درجات الاختبارات</p>
            <h3 className="mt-1 text-2xl font-bold text-white">92.0%</h3>
            <span className="text-[11px] text-cyan-400 flex items-center gap-1 mt-0.5">
              <AwardIcon size={12} /> تقدير ممتاز (A)
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <GraduationCapIcon size={24} />
          </div>
        </Card>

        <Card className="flex items-center justify-between border-emerald-500/30 bg-emerald-950/20">
          <div>
            <p className="text-xs font-medium text-slate-400">التقييم العام المركب</p>
            <h3 className="mt-1 text-2xl font-bold text-emerald-400">95.4%</h3>
            <span className="text-[11px] text-emerald-300 flex items-center gap-1 mt-0.5">
              ⭐ المرتبة الأولى في الدفعة
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <AwardIcon size={24} />
          </div>
        </Card>
      </div>

      {/* Grid: Active Courses & Live Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Active Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpenIcon size={20} className="text-emerald-400" />
              مقرراتي الدراسية النشطة
            </h2>
            <span className="text-xs text-slate-400 hover:text-emerald-400 cursor-pointer">
              عرض جميع المقررات ←
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Course 1 */}
            <Card className="flex flex-col justify-between hover:border-emerald-500/40 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="purple" size="sm">الفيزياء المتقدمة</Badge>
                  <span className="text-xs font-mono text-slate-400">PHYS-301</span>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-100">
                  الديناميكا الحرارية والميكانيكا الكلاسيكية
                </h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                  شرح تفصيلي لقوانين الحركة والحرارة مع تجارب محاكاة واختبارات تفاعلية.
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>نسبة الإنجاز</span>
                  <span className="font-semibold text-emerald-400">75%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 w-3/4" />
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
                  <span>12 من أصل 16 درساً</span>
                  <span className="text-emerald-400 font-medium">مستمر</span>
                </div>
              </div>
            </Card>

            {/* Course 2 */}
            <Card className="flex flex-col justify-between hover:border-emerald-500/40 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="info" size="sm">الرياضيات والتحليل</Badge>
                  <span className="text-xs font-mono text-slate-400">MATH-202</span>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-100">
                  التفاضل والتكامل والهندسة التحليلية
                </h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                  تطبيقات المشتقات والتكاملات وحساب المساحات والحجوم ثلاثية الأبعاد.
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>نسبة الإنجاز</span>
                  <span className="font-semibold text-indigo-400">60%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 w-3/5" />
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
                  <span>9 من أصل 15 درساً</span>
                  <span className="text-indigo-400 font-medium">مستمر</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right 1 Col: Upcoming Live Sessions & Credential Card */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <VideoIcon size={20} className="text-emerald-400" />
            الجلسات المباشرة القادمة
          </h2>

          <Card className="space-y-4 border-emerald-500/20">
            <div className="flex items-center justify-between">
              <Badge variant="warning" size="sm">اليوم - 06:00 م</Badge>
              <span className="text-xs text-slate-400 font-mono">Google Meet</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                مراجعة الفصل الثالث: قوانين كبلر
              </h4>
              <p className="text-xs text-slate-400 mt-1">المعلم: د. طارق منصور</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ClockIcon size={14} />
              <span>المدة: 60 دقيقة</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => window.open('https://meet.google.com/xyz-abcd-efg', '_blank')}
            >
              <VideoIcon size={14} />
              انضمام للاجتماع الآن
            </Button>
          </Card>

          {/* Student Access Credential (M8 Verification) */}
          <Card className="space-y-3 bg-slate-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <QrCodeIcon size={14} className="text-emerald-400" /> بطاقة الحضور الذكية
              </span>
              <Badge variant="success" size="sm">جهاز موثق (Bound)</Badge>
            </div>
            <div className="flex items-center gap-4 py-2">
              <div className="h-16 w-16 rounded-xl border border-slate-700 bg-white p-1.5 flex items-center justify-center">
                <QrCodeIcon size={52} className="text-slate-950" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-mono text-slate-200">ID: CRD-2026-9941</p>
                <p className="text-slate-400 text-[11px]">الجهاز: Chrome / Windows</p>
                <p className="text-emerald-400 text-[10px]">✓ سياسة الجهاز الواحد مفعلة</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
