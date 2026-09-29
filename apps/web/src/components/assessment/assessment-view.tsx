'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircleIcon, ClockIcon } from '../icons';

export const AssessmentView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'assignments' | 'exams'>('assignments');

  const assignments = [
    { id: '1', title: 'واجب قوانين الحركة وتطبيقات نيوتن', course: 'الفيزياء 301', dueDate: '30 سبتمبر 2026', points: 100, score: 98, status: 'graded' },
    { id: '2', title: 'مسائل التفاضل وحساب المعدلات الزمنية المرتبطة', course: 'الرياضيات 202', dueDate: '02 أكتوبر 2026', points: 50, score: null, status: 'submitted' },
    { id: '3', title: 'بحث تجريبي: انتقال الحرارة بالتوصيل والإشعاع', course: 'الفيزياء 301', dueDate: '05 أكتوبر 2026', points: 100, score: null, status: 'pending' },
  ];

  const exams = [
    { id: '1', title: 'اختبار نصف الفصل الدراسي - الفيزياء المتقدمة', course: 'الفيزياء 301', duration: '60 دقيقة', totalPoints: 100, score: 92, status: 'published' },
    { id: '2', title: 'اختبار قصير: حساب المثلثات والمتجهات', course: 'الرياضيات 202', duration: '30 دقيقة', totalPoints: 50, score: 48, status: 'published' },
    { id: '3', title: 'الاختبار التجريبي للثانوية العامة', course: 'شامل', duration: '120 دقيقة', totalPoints: 100, score: null, status: 'upcoming' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircleIcon size={24} className="text-emerald-400" />
            الواجبات والتقييمات والاختبارات (Assessments & Grades)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            متابعة تسليم الواجبات، اختبارات الفصل، ورصد الدرجات المستقل مع التحكم في نشر النتائج.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1">
          <button
            onClick={() => setActiveSubTab('assignments')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === 'assignments' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            الواجبات الدراسية (Assignments)
          </button>
          <button
            onClick={() => setActiveSubTab('exams')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === 'exams' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            الاختبارات والدرجات (Exams & Grades)
          </button>
        </div>
      </div>

      {activeSubTab === 'assignments' ? (
        <div className="space-y-4">
          {assignments.map((item) => (
            <Card key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="purple" size="sm">{item.course}</Badge>
                  {item.status === 'graded' && <Badge variant="success" size="sm">تم التصحيح والاعتماد</Badge>}
                  {item.status === 'submitted' && <Badge variant="info" size="sm">تم التسليم - قيد المراجعة</Badge>}
                  {item.status === 'pending' && <Badge variant="warning" size="sm">بانتظار التسليم</Badge>}
                </div>
                <h3 className="text-base font-bold text-white mt-1">{item.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-3">
                  <span>تاريخ الاستحقاق: {item.dueDate}</span>
                  <span>الدرجة الكلية: {item.points} درجة</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {item.score !== null ? (
                  <div className="text-left sm:text-right">
                    <span className="text-lg font-bold text-emerald-400">{item.score} / {item.points}</span>
                    <p className="text-[10px] text-slate-400">الدرجة المرصودة</p>
                  </div>
                ) : (
                  <Button variant="primary" size="sm">
                    {item.status === 'submitted' ? 'تعديل التسليم' : 'رفع الحل الآن'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="info" size="sm">{exam.course}</Badge>
                  {exam.status === 'published' && <Badge variant="success" size="sm">النتيجة معلنة رسمياً</Badge>}
                  {exam.status === 'upcoming' && <Badge variant="neutral" size="sm">قادم قريباً</Badge>}
                </div>
                <h3 className="text-base font-bold text-white mt-1">{exam.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <ClockIcon size={12} /> المدة الزمنية: {exam.duration} • الدرجة النهائية: {exam.totalPoints}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {exam.score !== null ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-sm">
                      {exam.score}%
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-sm font-bold text-white">{exam.score} من {exam.totalPoints}</span>
                      <p className="text-[10px] text-emerald-400">ممتاز (Passed)</p>
                    </div>
                  </div>
                ) : (
                  <Button variant="secondary" size="sm">
                    دخول قاعة الاختبار
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
