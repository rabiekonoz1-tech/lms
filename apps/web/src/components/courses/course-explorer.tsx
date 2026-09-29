'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { BookOpenIcon, CheckCircleIcon, ClockIcon, PlayIcon, VideoIcon } from '../icons';

export const CourseExplorer: React.FC = () => {
  const [activeLesson, setActiveLesson] = useState<number>(1);
  const [completedLessons, setCompletedLessons] = useState<number[]>([1, 2]);

  const toggleLessonComplete = (id: number) => {
    if (completedLessons.includes(id)) {
      setCompletedLessons(completedLessons.filter((l) => l !== id));
    } else {
      setCompletedLessons([...completedLessons, id]);
    }
  };

  const lessons = [
    { id: 1, title: 'المقدمة: مدخل إلى الديناميكا الحرارية', duration: '24 دقيقة', video: 'https://player.vimeo.com/video/987654321' },
    { id: 2, title: 'القانون الأول للديناميكا الحرارية وتطبيقاته', duration: '32 دقيقة', video: 'https://player.vimeo.com/video/987654322' },
    { id: 3, title: 'حساب الشغل والطاقة الداخلية للغاز المثالي', duration: '28 دقيقة', video: 'https://player.vimeo.com/video/987654323' },
    { id: 4, title: 'دورة كارنو والآلات الحرارية', duration: '35 دقيقة', video: 'https://player.vimeo.com/video/987654324' },
    { id: 5, title: 'القانون الثاني للديناميكا والإنتروبيا', duration: '30 دقيقة', video: 'https://player.vimeo.com/video/987654325' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpenIcon size={24} className="text-emerald-400" />
            المقررات والدروس التعليمية (Courses & Lessons)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مشغل الفيديو المدمج والدروس الرقمية الداعمة للمناهج الدراسية عبر مزود الوسائط المعتمد (Vimeo / Google Drive).
          </p>
        </div>
        <Badge variant="purple" size="md">مقرر معتمد: PHYS-301</Badge>
      </div>

      {/* Main Grid: Video Player + Lessons List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Embedded Player */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden border-emerald-500/30">
            {/* Player viewport */}
            <div className="relative aspect-video w-full bg-slate-950 flex flex-col items-center justify-center border-b border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent flex flex-col justify-end p-6">
                <Badge variant="info" size="sm" className="w-fit mb-2">Vimeo Stream Player</Badge>
                <h2 className="text-lg md:text-xl font-bold text-white">
                  الدرس {activeLesson}: {lessons.find((l) => l.id === activeLesson)?.title}
                </h2>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <ClockIcon size={14} /> المدة: {lessons.find((l) => l.id === activeLesson)?.duration} • المحاضر: د. طارق منصور
                </p>
              </div>

              {/* Play button simulated overlay */}
              <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600/90 text-white shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                <PlayIcon size={28} className="translate-x-0.5" />
              </div>
            </div>

            {/* Video Controls & Description */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-200">مزود الفيديو المعتمد: Vimeo Secure CDN</p>
                <p className="text-[11px] text-slate-400">يتم تحميل الروابط الآمنة عبر طبقة تجريد الوسائط (VideoProviderInterface).</p>
              </div>
              <Button
                variant={completedLessons.includes(activeLesson) ? 'outline' : 'primary'}
                size="sm"
                onClick={() => toggleLessonComplete(activeLesson)}
              >
                <CheckCircleIcon size={14} />
                {completedLessons.includes(activeLesson) ? 'تم إكمال الدرس ✓' : 'تحديد الدرس كمكتمل'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Lessons Checklist */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <VideoIcon size={16} className="text-emerald-400" />
            فهرس دروس المقرر ({completedLessons.length} من {lessons.length} مكتملة)
          </h3>

          <div className="space-y-2">
            {lessons.map((lesson) => {
              const isSelected = activeLesson === lesson.id;
              const isDone = completedLessons.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson.id)}
                  className={`flex items-center justify-between rounded-xl p-3.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500/60 bg-emerald-950/30 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold leading-snug">{lesson.title}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <ClockIcon size={12} /> {lesson.duration}
                    </p>
                  </div>

                  <div>
                    {isDone ? (
                      <Badge variant="success" size="sm">مكتمل ✓</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">غير مكتمل</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
