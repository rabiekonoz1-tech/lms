'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CalendarIcon, CheckCircleIcon, ClockIcon, QrCodeIcon } from '../icons';

export const AttendanceView: React.FC = () => {
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  const simulateScan = () => {
    setScanStatus('scanning');
    setTimeout(() => {
      setScanStatus('success');
      setTimeout(() => setScanStatus(null), 3000);
    }, 1200);
  };

  const sessions = [
    { id: '1', title: 'حصة الفيزياء النظرية: الحركة الموجية', date: '29 سبتمبر 2026', room: 'مدرج 1', status: 'present', mode: 'qr' },
    { id: '2', title: 'تجارب المختبر والتحليل الإحصائي', date: '27 سبتمبر 2026', room: 'مختبر الفيزياء 3', status: 'present', mode: 'qr' },
    { id: '3', title: 'حل مسائل المقذوفات وقوانين نيوتن', date: '25 سبتمبر 2026', room: 'قاعة 104', status: 'late', mode: 'manual' },
    { id: '4', title: 'الميكانيكا الحيوية وتطبيقات العزوم', date: '22 سبتمبر 2026', room: 'مدرج 2', status: 'present', mode: 'qr' },
    { id: '5', title: 'مراجعة المفاهيم الأساسية واختبار قصير', date: '20 سبتمبر 2026', room: 'قاعة 104', status: 'absent', mode: 'manual' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon size={24} className="text-emerald-400" />
            سجل الحضور والجلسات الدراسية (Attendance & Sessions)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل وتوثيق الحضور الفوري عبر مسح رمز الاستجابة السريعة (QR Code) أو الرصد الإداري المباشر.
          </p>
        </div>
        <Button variant="primary" onClick={simulateScan} isLoading={scanStatus === 'scanning'}>
          <QrCodeIcon size={16} />
          {scanStatus === 'scanning' ? 'جاري مطابقة الرمز...' : 'مسح QR Code للحضور'}
        </Button>
      </div>

      {scanStatus === 'success' && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircleIcon size={20} className="text-emerald-400" />
            <div>
              <p className="text-sm font-bold">تم تأكيد حضور الجلسة وتوثيقها في قاعدة بيانات المستأجر!</p>
              <p className="text-xs text-emerald-400/80">الجلسة: حصة الفيزياء النظرية • النمط: QR Scan • الوقت: الآن</p>
            </div>
          </div>
          <Badge variant="success">معتمد 100%</Badge>
        </div>
      )}

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">إجمالي الجلسات المسجلة</p>
            <h3 className="text-2xl font-bold text-white mt-1">20 جلسة</h3>
          </div>
          <CalendarIcon size={28} className="text-emerald-400" />
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">مرات الحضور الفعلي</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">19 جلسة</h3>
          </div>
          <CheckCircleIcon size={28} className="text-emerald-400" />
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">نسبة الحضور المحتسبة</p>
            <h3 className="text-2xl font-bold text-white mt-1">95.0%</h3>
          </div>
          <ClockIcon size={28} className="text-indigo-400" />
        </Card>
      </div>

      {/* Records Table */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-white">سجل الجلسات الأخيرة</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">عنوان الحصة</th>
                <th className="py-3 px-4 font-semibold">التاريخ</th>
                <th className="py-3 px-4 font-semibold">القاعة</th>
                <th className="py-3 px-4 font-semibold">طريقة الرصد</th>
                <th className="py-3 px-4 font-semibold">حالة الحضور</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium text-white">{s.title}</td>
                  <td className="py-3 px-4 text-slate-400">{s.date}</td>
                  <td className="py-3 px-4 text-slate-400">{s.room}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] text-slate-400">
                      {s.mode === 'qr' ? '📷 QR Code Scan' : '✍️ Manual Teacher'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {s.status === 'present' && <Badge variant="success" size="sm">حاضر (Present)</Badge>}
                    {s.status === 'late' && <Badge variant="warning" size="sm">متأخر (Late)</Badge>}
                    {s.status === 'absent' && <Badge variant="danger" size="sm">غائب (Absent)</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
