'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  AwardIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  DownloadIcon,
  FileTextIcon,
  GraduationCapIcon,
  UserIcon,
} from '../icons';

export const ParentDashboard: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState<'omar' | 'laila'>('omar');

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-slate-950 p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple">بوابة أولياء الأمور (Parent Portal)</Badge>
              <span className="text-xs text-slate-400 font-mono">PAR-2026-44</span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white tracking-tight">
              أهلاً بك، أبو عمر الأحمد 👋
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl leading-relaxed">
              تابع الحضور اليومي، الدرجات الدورية، والتقارير الأكاديمية المعتمدة لأبنائك المسجلين في المركز التعليمي.
            </p>
          </div>

          {/* Child Switcher */}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5">
            <button
              onClick={() => setSelectedChild('omar')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                selectedChild === 'omar'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserIcon size={14} />
              عمر (الصف الثالث الثانوي)
            </button>
            <button
              onClick={() => setSelectedChild('laila')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                selectedChild === 'laila'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserIcon size={14} />
              ليلى (الصف الأول الثانوي)
            </button>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      {/* Selected Child Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">نسبة حضور الطالب</p>
            <h3 className="mt-1 text-2xl font-bold text-white">
              {selectedChild === 'omar' ? '96.5%' : '98.0%'}
            </h3>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircleIcon size={12} /> منتظم - لا توجد غيابات غير مبررة
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CalendarIcon size={24} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">المعدل الأكاديمي العام</p>
            <h3 className="mt-1 text-2xl font-bold text-purple-400">
              {selectedChild === 'omar' ? '95.4%' : '97.2%'}
            </h3>
            <span className="text-[11px] text-purple-300 flex items-center gap-1 mt-0.5">
              <AwardIcon size={12} /> تقدير ممتاز مع مرتبة الشرف
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <GraduationCapIcon size={24} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">الواجبات والمهام</p>
            <h3 className="mt-1 text-2xl font-bold text-white">
              {selectedChild === 'omar' ? '8 من 8' : '6 من 6'}
            </h3>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircleIcon size={12} /> نسبة الإنجاز 100%
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpenIcon size={24} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">حالة الاشتراك والحساب</p>
            <h3 className="mt-1 text-2xl font-bold text-emerald-400">نشط ومفعل</h3>
            <span className="text-[11px] text-slate-400 mt-0.5 block">الباقة الشاملة 2026</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircleIcon size={24} />
          </div>
        </Card>
      </div>

      {/* Reports and Academic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileTextIcon size={18} className="text-purple-400" />
              التقارير الأكاديمية وكشوف الدرجات
            </h3>
            <Badge variant="purple">معتمدة رسمياً</Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div>
                <p className="text-xs font-semibold text-white">كشف درجات منتصف الفصل الدراسي</p>
                <p className="text-[11px] text-slate-400">تاريخ الإصدار: 28 سبتمبر 2026</p>
              </div>
              <Button variant="outline" size="sm">
                <DownloadIcon size={14} />
                تحميل PDF
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div>
                <p className="text-xs font-semibold text-white">تقرير الحضور والغياب الشهري</p>
                <p className="text-[11px] text-slate-400">نسبة حضور 96.5% - صفر إنذارات</p>
              </div>
              <Button variant="outline" size="sm">
                <DownloadIcon size={14} />
                تحميل PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* Conduct and Teacher Feedback */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AwardIcon size={18} className="text-purple-400" />
            ملاحظات المعلمين والإرشاد الأكاديمي
          </h3>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">د. طارق منصور (معلم الفيزياء)</span>
                <Badge variant="success" size="sm">ملاحظة إيجابية</Badge>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                عمر يظهر تميزاً كبيراً في استيعاب مفاهيم الديناميكا وتطبيقاتها العملية. يشارك بفاعلية في المحاضرات المباشرة.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">أ. منى الحازمي (معلمة الرياضيات)</span>
                <Badge variant="success" size="sm">ملاحظة إيجابية</Badge>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                أداء رائع في حل مسائل التفاضل والتكامل، وتفانٍ مستمر في تسليم الواجبات في مواعيدها المحددة.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
