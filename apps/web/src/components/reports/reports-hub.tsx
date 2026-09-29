'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DownloadIcon, FileTextIcon } from '../icons';

export const ReportsHub: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState([
    {
      id: 'rep-001',
      title: 'كشف الدرجات الأكاديمي المعتمد - الفصل الأول 2026',
      type: 'student_transcript',
      format: 'PDF',
      status: 'completed',
      date: '28 سبتمبر 2026',
      size: '240 KB',
    },
    {
      id: 'rep-002',
      title: 'تقرير الحضور والغياب الشهري المفصل',
      type: 'attendance_summary',
      format: 'PDF',
      status: 'completed',
      date: '25 سبتمبر 2026',
      size: '180 KB',
    },
    {
      id: 'rep-003',
      title: 'سجل إنجاز الواجبات والاختبارات القصيرة',
      type: 'academic_overview',
      format: 'CSV',
      status: 'completed',
      date: '20 سبتمبر 2026',
      size: '45 KB',
    },
  ]);

  const generateNewReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newReport = {
        id: `rep-${Date.now()}`,
        title: 'تقرير أداء شامل فوري - تحديث اليوم',
        type: 'student_transcript',
        format: 'JSON / PDF',
        status: 'completed',
        date: 'الآن (30 سبتمبر 2026)',
        size: '195 KB',
      };
      setReports([newReport, ...reports]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileTextIcon size={24} className="text-emerald-400" />
            مركز التقارير الأكاديمية (Reporting Center)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            توليد وتصدير التقارير غير المتزامنة (M10 Reporting Engine) مع التحقق الصارم من صلاحيات التحميل وعزل بيانات المستأجر.
          </p>
        </div>
        <Button variant="primary" onClick={generateNewReport} isLoading={isGenerating}>
          <FileTextIcon size={16} />
          {isGenerating ? 'جاري تجهيز التقرير بالخلفية...' : 'طلب تقرير أكاديمي جديد'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="purple" size="sm">{report.type}</Badge>
                <Badge variant="success" size="sm">{report.status}</Badge>
                <span className="text-xs font-mono text-slate-400">{report.format}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{report.title}</h3>
              <p className="text-xs text-slate-400">
                تاريخ الإصدار: {report.date} • الحجم: {report.size}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert(`جاري تنزيل التقرير المعتمد: ${report.title}`)}
              >
                <DownloadIcon size={14} />
                تحميل الملف (Download)
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
