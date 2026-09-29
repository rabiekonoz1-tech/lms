'use client';

import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ClockIcon, VideoIcon } from '../icons';

export const MeetingsHub: React.FC = () => {

  const meetings = [
    {
      id: 'meet-001',
      title: 'محاضرة فيزياء 301 المباشرة: مراجعة قوانين نيوتن والجاذبية',
      provider: 'google_meet',
      externalId: 'aaa-bbbb-ccc',
      joinUrl: 'https://meet.google.com/aaa-bbbb-ccc',
      date: 'اليوم، 30 سبتمبر 2026',
      time: '06:00 م - 07:30 م',
      status: 'scheduled',
      instructor: 'د. طارق منصور',
    },
    {
      id: 'meet-002',
      title: 'ورشة عمل حل مسائل التفاضل المتقدمة وتطبيقاتها',
      provider: 'zoom',
      externalId: '9876543210',
      joinUrl: 'https://zoom.us/j/9876543210',
      date: 'الخميس، 02 أكتوبر 2026',
      time: '04:00 م - 05:30 م',
      status: 'scheduled',
      instructor: 'أ. منى الحازمي',
    },
    {
      id: 'meet-003',
      title: 'جلسة إرشاد ومراجعة فردية مع أولياء الأمور',
      provider: 'mock',
      externalId: 'mock-conf-8812',
      joinUrl: 'https://mock-meet.local/mock-conf-8812',
      date: 'الأحد، 05 أكتوبر 2026',
      time: '07:00 م - 08:00 م',
      status: 'scheduled',
      instructor: 'الإدارة الأكاديمية',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <VideoIcon size={24} className="text-emerald-400" />
            الفصول الافتراضية والاجتماعات المباشرة (Virtual Classrooms)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ربط متكامل مع Google Meet و Zoom عبر طبقة تجريد المزودين (MeetingProvider) مع التوليد التلقائي لروابط الانضمام.
          </p>
        </div>
        <Badge variant="success" size="md">طبقة التكامل نشطة (M9 Verified)</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((m) => (
          <Card key={m.id} className="flex flex-col justify-between border-slate-800 hover:border-emerald-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {m.provider === 'google_meet' && (
                  <Badge variant="success" size="sm">Google Meet</Badge>
                )}
                {m.provider === 'zoom' && (
                  <Badge variant="info" size="sm">Zoom Video</Badge>
                )}
                {m.provider === 'mock' && (
                  <Badge variant="purple" size="sm">Mock Fallback</Badge>
                )}
                <span className="text-[11px] font-mono text-slate-400">{m.externalId}</span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{m.title}</h3>
              <p className="text-xs text-slate-400">المشرف: {m.instructor}</p>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1.5 text-xs text-slate-300">
                <p className="flex items-center gap-2">
                  <ClockIcon size={14} className="text-emerald-400" />
                  <span>{m.date} ({m.time})</span>
                </p>
                <p className="text-[11px] text-slate-400">المدة المجدولة: 90 دقيقة</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => window.open(m.joinUrl, '_blank')}
              >
                <VideoIcon size={14} />
                دخول الجلسة المباشرة الآن
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
