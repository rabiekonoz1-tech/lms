'use client';

import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  BarChartIcon,
  GraduationCapIcon,
  RefreshCwIcon,
} from '../icons';

export const AnalyticsHub: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChartIcon size={24} className="text-emerald-400" />
            التحليلات ومؤشرات الأداء (Analytics & Read Models)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            نماذج القراءة المجمعة السريعة (M10 Invariant: Fast Read Model Serving) مع الحفاظ على استقرار المقاييس التاريخية عبر الإصدارات (Versioned KPIs).
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCwIcon size={14} />
          تحديث نماذج القراءة السريعة
        </Button>
      </div>

      {/* KPI Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>معدل الحضور التراكمي</span>
            <Badge variant="purple" size="sm">v1 (25% وزن)</Badge>
          </div>
          <h3 className="text-2xl font-bold text-white">96.5%</h3>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 w-[96.5%]" />
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>تسليم الواجبات والمهام</span>
            <Badge variant="purple" size="sm">v1 (35% وزن)</Badge>
          </div>
          <h3 className="text-2xl font-bold text-white">100.0%</h3>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500 w-full" />
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>متوسط نتائج الاختبارات</span>
            <Badge variant="purple" size="sm">v2 (40% وزن)</Badge>
          </div>
          <h3 className="text-2xl font-bold text-white">92.0%</h3>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-500 w-[92%]" />
          </div>
        </Card>

        <Card className="space-y-2 border-emerald-500/30 bg-emerald-950/20">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>التقييم المركب الكلي</span>
            <Badge variant="success" size="sm">معتمد رسمياً</Badge>
          </div>
          <h3 className="text-2xl font-bold text-emerald-400">95.4%</h3>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-400 w-[95.4%]" />
          </div>
        </Card>
      </div>

      {/* Metric Definitions & Versioning Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <GraduationCapIcon size={18} className="text-emerald-400" />
            سجل مقاييس الأداء وإصداراتها في قاعدة بيانات المستأجر
          </h3>
          <Badge variant="info">Phase J §45 Compliant</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">المعرف الفريد (Metric Key)</th>
                <th className="py-3 px-4 font-semibold">اسم المقياس</th>
                <th className="py-3 px-4 font-semibold">التصنيف</th>
                <th className="py-3 px-4 font-semibold">الإصدار النشط</th>
                <th className="py-3 px-4 font-semibold">المعادلة وسجل التغييرات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-mono text-emerald-400">attendance_rate</td>
                <td className="py-3 px-4 font-bold text-white">معدل الحضور والانضباط</td>
                <td className="py-3 px-4"><Badge variant="info" size="sm">attendance</Badge></td>
                <td className="py-3 px-4 font-mono font-bold">v1</td>
                <td className="py-3 px-4 text-slate-400">(attended_sessions / total_sessions) * 100</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-mono text-emerald-400">assignment_completion</td>
                <td className="py-3 px-4 font-bold text-white">نسبة إنجاز الواجبات المنزلية</td>
                <td className="py-3 px-4"><Badge variant="info" size="sm">academic</Badge></td>
                <td className="py-3 px-4 font-mono font-bold">v1</td>
                <td className="py-3 px-4 text-slate-400">(completed_submissions / total_assignments) * 100</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-mono text-emerald-400">exam_average</td>
                <td className="py-3 px-4 font-bold text-white">متوسط الاختبارات والتقييم الدوري</td>
                <td className="py-3 px-4"><Badge variant="info" size="sm">academic</Badge></td>
                <td className="py-3 px-4 font-mono font-bold text-amber-400">v2 (محدث)</td>
                <td className="py-3 px-4 text-slate-400">حساب المتوسط الموزون مع تطبيق معامل صعوبة الأسئلة (v1 محمي تاريخياً)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
