'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  BarChartIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  DownloadIcon,
  FileTextIcon,
  QrCodeIcon,
  UsersIcon,
  VideoIcon,
} from '../icons';

export const TeacherDashboard: React.FC = () => {
  const [scanSuccess, setScanSuccess] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const simulateQrScan = () => {
    setScanSuccess(true);
    setTimeout(() => setScanSuccess(false), 3500);
  };

  const simulateReport = () => {
    setReportGenerated(true);
    setTimeout(() => setReportGenerated(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-950 p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple">لوحة المعلم والإدارة (Teacher Control)</Badge>
              <span className="text-xs text-slate-400 font-mono">TCH-PHYS-01</span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white tracking-tight">
              مرحباً د. طارق منصور 👨‍🏫
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl leading-relaxed">
              لديك <span className="text-indigo-400 font-semibold">حصة دراسية قادمة بعد ساعة</span> في مدرج الفيزياء 2. هناك 6 واجبات بحاجة إلى التصحيح والاعتماد.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={simulateQrScan}>
              <QrCodeIcon size={16} />
              مسح QR كود الحضور
            </Button>
            <Button variant="outline" onClick={simulateReport}>
              <FileTextIcon size={16} />
              تصدير تقرير الفصل
            </Button>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* Notifications / Alerts */}
      {scanSuccess && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-4 text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircleIcon size={20} className="text-emerald-400" />
            <div>
              <p className="text-sm font-bold">تم تسجيل الحضور بنجاح عبر QR Code!</p>
              <p className="text-xs text-emerald-400/80">الطالب: عمر الأحمد (STU-2026-001) - الحالة: حاضر (Present)</p>
            </div>
          </div>
          <Badge variant="success">تم التوثيق بالخادم</Badge>
        </div>
      )}

      {reportGenerated && (
        <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/50 p-4 text-cyan-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <DownloadIcon size={20} className="text-cyan-400" />
            <div>
              <p className="text-sm font-bold">تم توليد تقرير أداء الفصل بنجاح!</p>
              <p className="text-xs text-cyan-400/80">الحالة: مكتمل (Completed) - الصيغة: JSON/PDF</p>
            </div>
          </div>
          <Badge variant="info">جاهز للتحميل</Badge>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">إجمالي الطلاب المسجلين</p>
            <h3 className="mt-1 text-2xl font-bold text-white">142 طالباً</h3>
            <span className="text-[11px] text-slate-400 mt-0.5 block">عبر 3 فصول دراسية</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <UsersIcon size={24} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">متوسط الحضور الأسبوعي</p>
            <h3 className="mt-1 text-2xl font-bold text-emerald-400">94.8%</h3>
            <span className="text-[11px] text-emerald-400/80 mt-0.5 block">مرتفع بنسبة 2.1% عن الأسبوع الماضي</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CalendarIcon size={24} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">واجبات بانتظار التصحيح</p>
            <h3 className="mt-1 text-2xl font-bold text-amber-400">6 تسليمات</h3>
            <span className="text-[11px] text-amber-400/80 mt-0.5 block">فيزياء 301 - واجب الديناميكا</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <CheckCircleIcon size={24} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">المحاضرات المجدولة</p>
            <h3 className="mt-1 text-2xl font-bold text-white">4 جلسات</h3>
            <span className="text-[11px] text-indigo-400 mt-0.5 block">مربوطة بـ Google Meet و Zoom</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <VideoIcon size={24} />
          </div>
        </Card>
      </div>

      {/* Main Grid: Management Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Course Overview & Grade Status */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpenIcon size={18} className="text-indigo-400" />
                المقررات التي تدرسها
              </h3>
              <Badge variant="neutral">3 فصول نشطة</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4 font-semibold">المقرر</th>
                    <th className="py-3 px-4 font-semibold">الرمز</th>
                    <th className="py-3 px-4 font-semibold">الطلاب</th>
                    <th className="py-3 px-4 font-semibold">نسبة الحضور</th>
                    <th className="py-3 px-4 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-white">الفيزياء المتقدمة 301</td>
                    <td className="py-3 px-4 font-mono text-slate-400">PHYS-301</td>
                    <td className="py-3 px-4">48 طالباً</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">96.5%</td>
                    <td className="py-3 px-4"><Badge variant="success" size="sm">نشط</Badge></td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-white">الميكانيكا الكلاسيكية وتطبيقاتها</td>
                    <td className="py-3 px-4 font-mono text-slate-400">PHYS-202</td>
                    <td className="py-3 px-4">52 طالباً</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">93.2%</td>
                    <td className="py-3 px-4"><Badge variant="success" size="sm">نشط</Badge></td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-white">الفيزياء التجريبية والمختبرات</td>
                    <td className="py-3 px-4 font-mono text-slate-400">PHYS-101</td>
                    <td className="py-3 px-4">42 طالباً</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">95.0%</td>
                    <td className="py-3 px-4"><Badge variant="success" size="sm">نشط</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pending Submissions */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircleIcon size={18} className="text-amber-400" />
                تسليمات الواجبات الأخيرة بانتظار التقييم
              </h3>
              <Badge variant="warning">6 معلقة</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">عمر الأحمد (STU-2026-001)</p>
                  <p className="text-[11px] text-slate-400">واجب قوانين الحركة وتطبيقات نيوتن (تم التسليم في الموعد)</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">100 / 100</Badge>
                  <Button variant="outline" size="sm">معاينة</Button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">سارة خالد (STU-2026-002)</p>
                  <p className="text-[11px] text-slate-400">واجب قوانين الحركة وتطبيقات نيوتن</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info" size="sm">بانتظار الرصد</Badge>
                  <Button variant="secondary" size="sm">رصد الدرجة</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Quick Actions & Live Session Launcher */}
        <div className="space-y-6">
          <Card className="space-y-4 border-indigo-500/20">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <VideoIcon size={18} className="text-indigo-400" />
              إنشاء جلسة بث مباشر فورية
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تتيح طبقة عزل المزودات (M9 Abstraction) توليد روابط الاجتماعات المباشرة فورياً عبر Google Meet أو Zoom مع معالجة الأعطال التلقائية.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-300">عنوان الجلسة</label>
              <input
                type="text"
                defaultValue="مراجعة شاملة لاختبار نصف الفصل"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300">المزود (Provider)</label>
              <select className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none">
                <option value="google_meet">Google Meet (تلقائي)</option>
                <option value="zoom">Zoom Video</option>
                <option value="mock">Mock Sandbox Driver</option>
              </select>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => window.open('https://meet.google.com/xyz-abcd-efg', '_blank')}
            >
              <VideoIcon size={16} />
              بدء الاجتماع وتوليد الرابط
            </Button>
          </Card>

          {/* Quick Metrics KPI card */}
          <Card className="space-y-3 bg-slate-900/40">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BarChartIcon size={14} className="text-indigo-400" />
              مؤشرات الأداء المقاسة (M10 Versioned Metrics)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">attendance_rate</span>
                <Badge variant="purple" size="sm">الإصدار v1</Badge>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">assignment_completion</span>
                <Badge variant="purple" size="sm">الإصدار v1</Badge>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">exam_average</span>
                <Badge variant="purple" size="sm">الإصدار v2 (ترقية)</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
