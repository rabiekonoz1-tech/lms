'use client';

import React, { useEffect, useState } from 'react';
import { educationApi } from '../../../lib/education-api';
import { integrationApi } from '../../../lib/integration-api';
import type { Course, Lesson, MediaAsset } from '../../../types';
import { Badge } from '../../../components/ui/badge';
import { BookOpenIcon, CheckCircleIcon, ClockIcon, VideoIcon } from '../../../components/icons';
import { useAuth } from '../../../context/auth-context';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonMedia, setLessonMedia] = useState<MediaAsset | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Lesson viewer modal tab: 'video' | 'ai-tutor'
  const [viewerTab, setViewerTab] = useState<'video' | 'ai-tutor'>('video');

  const { user } = useAuth();
  const [watermarkPosition, setWatermarkPosition] = useState({ top: '10%', left: '10%' });

  // Anti-abuse watermark movement
  useEffect(() => {
    if (viewerTab === 'video' && activeLesson) {
      const interval = setInterval(() => {
        setWatermarkPosition({
          top: Math.random() * 80 + '%',
          left: Math.random() * 80 + '%',
        });
      }, 7000); // Move every 7 seconds
      return () => clearInterval(interval);
    }
  }, [viewerTab, activeLesson]);

  // AI Tutor Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'مرحباً بك يا بطل! أنا المساعد التعليمي الذكي (AI Tutor) الخاص بهذا الدرس. يمكنك أن تسألني أي سؤال عن الشرح، أو تطلب مني تلخيص الدرس أو اختبارك بأسئلة تدريبية.',
      time: 'الآن',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const data = await educationApi.getCourses();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    if (!activeLesson) {
      setLessonMedia(null);
      return;
    }
    const loadMedia = async () => {
      try {
        const assets = await integrationApi.getMedia({ lesson_id: activeLesson.id });
        if (assets && assets.length > 0) {
          setLessonMedia(assets[0]);
        } else if (selectedCourse?.id) {
          const courseAssets = await integrationApi.getMedia({ course_id: selectedCourse.id });
          setLessonMedia(courseAssets[0] || null);
        } else {
          setLessonMedia(null);
        }
      } catch {
        setLessonMedia(null);
      }
    };
    loadMedia();
  }, [activeLesson, selectedCourse]);

  const toggleComplete = (lessonId: string) => {
    setCompletedLessonIds((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const handleNextLesson = () => {
    if (!selectedCourse?.lessons || !activeLesson) return;
    const currentIndex = selectedCourse.lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex < selectedCourse.lessons.length - 1) {
      setActiveLesson(selectedCourse.lessons[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (!selectedCourse?.lessons || !activeLesson) return;
    const currentIndex = selectedCourse.lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex > 0) {
      setActiveLesson(selectedCourse.lessons[currentIndex - 1]);
    }
  };

  const handleSendAiMessage = (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsAiThinking(true);

    // Simulate intelligent response tailored to the lesson
    setTimeout(() => {
      let aiResponseText = `إجابة ذكية عن درس "${activeLesson?.title || 'الدرس'}": `;

      if (textToSend.includes('لخص') || textToSend.includes('تلخيص')) {
        aiResponseText += `إليك أهم 3 نقاط رئيسية:\n1. المفهوم الأساسي يرتكز على تطبيق القواعد العامة.\n2. التمييز بين الحالات الخاصة والمعادلات التطبيقية.\n3. الانتباه للشروط المسبقة لتجنب الأخطاء الشائعة في الاختبارات.`;
      } else if (textToSend.includes('سؤال') || textToSend.includes('اختبرني')) {
        aiResponseText += `سؤال تدريبي لاختبار استيعابك:\n"ما هو الشرط الأساسي لتطبيق النظرية المذكورة في الجزء الأول من الشرح؟"\n(فكر في الإجابة واكتبها لي لأصححها لك!).`;
      } else if (textToSend.includes('قوانين') || textToSend.includes('تعريفات')) {
        aiResponseText += `أهم التعريفات:\n• المتغير التابع: هو المقدار الذي تتغير قيمته تبعاً للمتغير المستقل.\n• معامل الثبات: النسبة الرياضية المحسوبة في بيئة التجربة المعيارية.`;
      } else {
        aiResponseText += `بناءً على الشرح، هذه نقطة مهمة جداً وموضع أسئلة متكررة في الامتحانات. تأكد من مراجعة المثال المحلول في الدقيقة 12 من الفيديو لتثبيت المعلومة تماماً. هل تحتاج لتوضيح إضافي؟`;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      setIsAiThinking(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BookOpenIcon size={24} className="text-turquoise" />
            المقررات والدروس التعليمية
          </h1>
          <p className="text-sm text-secondary mt-1">
            استعرض المقررات المسجل بها وشاهد الدروس والمحتوى الرقمي التفاعلي مع المساعد الذكي.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--tq)_20%,transparent)] text-turquoise px-2.5 py-0.5 text-xs font-semibold">إجمالي المقررات: {courses.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-secondary text-sm">جارٍ تحميل المقررات من السيرفر...</div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center text-secondary rounded-[16px] bg-card border border-border">
          لا توجد مقررات دراسية متاحة حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Courses list column */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-secondary uppercase tracking-wider px-1">
              اختر المقرر
            </h2>
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;
              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`cursor-pointer rounded-[16px] border p-4 transition-all ${
                    isSelected
                      ? 'border-turquoise/50 bg-[color-mix(in_srgb,var(--tq)_10%,transparent)] shadow-md shadow-turquoise/10'
                      : 'border-border bg-background hover:border-border/80 hover:bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-turquoise px-2 py-0.5 rounded bg-[color-mix(in_srgb,var(--tq)_15%,transparent)]">
                      {course.code}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${course.status === 'active' ? 'bg-[color-mix(in_srgb,var(--tq)_15%,transparent)] text-turquoise' : 'bg-[color-mix(in_srgb,var(--secondary)_15%,transparent)] text-secondary'}`}>
                      {course.status === 'active' ? 'نشط' : 'قيد الإعداد'}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-foreground">{course.title}</h3>
                  <p className="mt-1 text-xs text-secondary line-clamp-2 leading-relaxed">
                    {course.description || 'مقرر تعليمي معتمد يشتمل على محاضرات فيديو وواجبات تدريبية.'}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-secondary">
                    <span>📚 {course.lessons?.length ?? 0} دروس</span>
                    {course.teacher?.user && <span>👨‍🏫 {course.teacher.user.name}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lessons list column */}
          <div className="xl:col-span-2 space-y-4">
            {selectedCourse ? (
              <div className="p-6 rounded-[16px] bg-card border border-border shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border">
                  <div>
                    <span className="text-[10px] font-bold text-turquoise tracking-wider uppercase">
                      المقرر النشط
                    </span>
                    <h2 className="text-lg font-bold text-foreground mt-0.5">{selectedCourse.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-secondary font-medium">
                      تم إكمال {Object.values(completedLessonIds).filter(Boolean).length} من{' '}
                      {selectedCourse.lessons?.length ?? 0}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">
                    فهرس الدروس والمحاضرات:
                  </h3>

                  {!selectedCourse.lessons || selectedCourse.lessons.length === 0 ? (
                    <div className="py-8 text-center text-secondary text-xs">
                      لا توجد دروس مضافة لهذا المقرر بعد.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {selectedCourse.lessons.map((lesson, idx) => {
                        const isDone = completedLessonIds[lesson.id];
                        return (
                          <div
                            key={lesson.id}
                            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-background px-3 rounded-[16px] transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--pri)_10%,transparent)] text-[11px] font-bold text-primary mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                                  {lesson.title}
                                  {isDone && (
                                    <span className="text-turquoise flex items-center gap-1 text-[10px]">
                                      <CheckCircleIcon size={12} />
                                      مكتمل
                                    </span>
                                  )}
                                </h4>
                                <div className="mt-1 flex items-center gap-3 text-[11px] text-secondary">
                                  <span className="flex items-center gap-1">
                                    <ClockIcon size={12} />
                                    {lesson.duration_minutes ?? 45} دقيقة
                                  </span>
                                  <span>•</span>
                                  <span>فيديو عالي الدقة HD</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                onClick={() => toggleComplete(lesson.id)}
                                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                                  isDone
                                    ? 'bg-[color-mix(in_srgb,var(--tq)_15%,transparent)] text-turquoise border-turquoise/30'
                                    : 'text-secondary border-border hover:text-foreground'
                                }`}
                              >
                                {isDone ? 'مكتمل' : 'تحديد كمكتمل'}
                              </button>

                              <button
                                onClick={() => {
                                  setActiveLesson(lesson);
                                  setViewerTab('video');
                                }}
                                className="inline-flex items-center gap-1.5 bg-primary hover:opacity-90 text-primary-foreground font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
                              >
                                <VideoIcon size={14} />
                                مشاهدة والمساعد الذكي
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-secondary rounded-[16px] bg-card border border-border">
                اختر مقرراً لعرض تفاصيله
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lesson Video & AI Tutor Player Modal */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-card border border-border rounded-[20px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header with Tabs */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-background">
              <div className="flex items-center gap-3">
                <div className="flex bg-card border border-border p-1 rounded-[12px]">
                  <button
                    onClick={() => setViewerTab('video')}
                    className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all ${
                      viewerTab === 'video'
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'text-secondary hover:text-foreground'
                    }`}
                  >
                    📹 مشغل المحاضرة
                  </button>
                  <button
                    onClick={() => setViewerTab('ai-tutor')}
                    className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      viewerTab === 'ai-tutor'
                        ? 'bg-[color-mix(in_srgb,var(--acc)_80%,black)] text-white shadow'
                        : 'text-secondary hover:text-foreground'
                    }`}
                  >
                    <span>🤖 المساعد الذكي (AI Tutor)</span>
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </button>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-foreground">{activeLesson.title}</h3>
                  <span className="text-[10px] text-secondary">
                    {selectedCourse?.title} • {activeLesson.duration_minutes ?? 45} دقيقة
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveLesson(null)}
                className="text-secondary hover:text-foreground p-1 rounded-lg hover:bg-background transition-colors text-xs font-bold"
              >
                ✕ إغلاق
              </button>
            </div>

            {/* Modal Content depending on Tab */}
            {viewerTab === 'video' ? (
              <div className="flex flex-col flex-1 overflow-hidden bg-background">
                {/* Video Player Display */}
                <div className="relative aspect-video bg-black flex items-center justify-center border-b border-border overflow-hidden">
                  {lessonMedia?.embed_url ? (
                    <iframe
                      src={lessonMedia.embed_url}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                      title={activeLesson.title}
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                      <div className="relative text-center p-6 space-y-3 z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/90 text-white text-3xl shadow-xl shadow-primary/30 hover:scale-105 transition-transform cursor-pointer">
                          ▶
                        </div>
                        <h4 className="text-white font-bold text-lg drop-shadow">{activeLesson.title}</h4>
                        <p className="text-white/70 text-xs max-w-md mx-auto">
                          بث فيديو بجودة عالية 1080p — جاهز للعرض عبر مشغل المنصة الآمن المشفر مع حماية المحتوى.
                        </p>
                      </div>

                      {/* Player Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between text-xs text-white/80 pointer-events-none">
                        <span>04:15 / 45:00</span>
                        <div className="flex-1 mx-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-turquoise w-1/4 rounded-full" />
                        </div>
                        <span className="font-mono text-turquoise font-semibold">1080p HD</span>
                      </div>
                    </>
                  )}

                  {/* Dynamic Watermark (Anti-Abuse) */}
                  <div 
                    className="absolute z-20 pointer-events-none transition-all duration-[3000ms] ease-in-out opacity-40 select-none text-white/50 text-xs font-mono drop-shadow-md flex flex-col items-center whitespace-nowrap"
                    style={{ top: watermarkPosition.top, left: watermarkPosition.left, transform: 'rotate(-15deg)' }}
                  >
                    <span>{user?.name || 'Student Name'}</span>
                    <span>ID: {user?.id?.split('-')[0].toUpperCase() || 'UNKNOWN'}</span>
                    <span>{user?.phone || 'No Phone'}</span>
                  </div>
                </div>

                {/* Lesson Notes */}
                <div className="p-6 overflow-y-auto space-y-3">
                  <h4 className="text-xs font-bold text-foreground">ملخص وملاحظات الدرس الأكاديمية:</h4>
                  <p className="text-xs text-secondary leading-relaxed bg-card p-4 rounded-[16px] border border-border">
                    في هذا الدرس نتناول المفاهيم التأسيسية للمقرر مع شرح النظريات وتطبيقاتها العملية. يُرجى التركيز على الملاحظات وحل المسائل التدريبية المرفقة بعد نهاية المحاضرة.
                  </p>
                </div>
              </div>
            ) : (
              /* AI Tutor Interactive Chat Tab */
              <div className="flex flex-col flex-1 overflow-hidden p-6 space-y-4 bg-background">
                {/* AI Chips Suggestions */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border text-xs">
                  <span className="text-[11px] font-bold text-accent whitespace-nowrap">
                    أسئلة سريعة مقترحة:
                  </span>
                  <button
                    onClick={() => handleSendAiMessage('لخص لي هذا الدرس في 3 نقاط رئيسية')}
                    className="px-3 py-1 bg-[color-mix(in_srgb,var(--acc)_15%,transparent)] hover:bg-[color-mix(in_srgb,var(--acc)_25%,transparent)] text-accent rounded-lg border border-accent/20 whitespace-nowrap transition-colors"
                  >
                    💡 لخص لي الدرس
                  </button>
                  <button
                    onClick={() => handleSendAiMessage('اطرح علي سؤالاً تدريبياً لاختبار فهمي')}
                    className="px-3 py-1 bg-[color-mix(in_srgb,var(--acc)_15%,transparent)] hover:bg-[color-mix(in_srgb,var(--acc)_25%,transparent)] text-accent rounded-lg border border-accent/20 whitespace-nowrap transition-colors"
                  >
                    ❓ اختبرني بسؤال
                  </button>
                  <button
                    onClick={() => handleSendAiMessage('ما هي أهم القوانين والتعريفات في هذا الدرس؟')}
                    className="px-3 py-1 bg-[color-mix(in_srgb,var(--acc)_15%,transparent)] hover:bg-[color-mix(in_srgb,var(--acc)_25%,transparent)] text-accent rounded-lg border border-accent/20 whitespace-nowrap transition-colors"
                  >
                    📝 أهم التعريفات
                  </button>
                </div>

                {/* Messages stream */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px]">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'ai' && (
                        <div className="h-8 w-8 rounded-[10px] bg-[color-mix(in_srgb,var(--acc)_20%,transparent)] border border-accent/30 flex items-center justify-center text-sm shrink-0">
                          🤖
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3.5 rounded-[20px] text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tl-none'
                            : 'bg-card border border-border text-foreground rounded-tr-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <span className="block mt-1 text-[10px] opacity-70 font-mono">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isAiThinking && (
                    <div className="flex gap-3 justify-start items-center">
                      <div className="h-8 w-8 rounded-[10px] bg-[color-mix(in_srgb,var(--acc)_20%,transparent)] text-sm flex items-center justify-center animate-bounce">
                        🤖
                      </div>
                      <div className="p-3 bg-card border border-border rounded-[20px] text-xs text-accent flex items-center gap-2">
                        <span className="animate-spin">⚙️</span>
                        <span>المساعد الذكي يحلل الدرس ويصيغ الإجابة...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Query Bar */}
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                    placeholder="اكتب سؤالك عن هذا الدرس هنا..."
                    className="flex-1 bg-card border border-border rounded-[16px] px-4 py-2.5 text-xs text-foreground placeholder-secondary focus:outline-none focus:border-accent"
                  />
                  <button
                    onClick={() => handleSendAiMessage()}
                    disabled={isAiThinking || !inputQuery.trim()}
                    className="px-5 py-2.5 rounded-[16px] bg-accent text-accent-foreground disabled:opacity-50 font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    إرسال ←
                  </button>
                </div>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevLesson}
                  className="px-3 py-1.5 rounded-[10px] border border-border text-xs text-secondary hover:bg-card hover:text-foreground transition-colors"
                >
                  ← الدرس السابق
                </button>
                <button
                  onClick={handleNextLesson}
                  className="px-3 py-1.5 rounded-[10px] border border-border text-xs text-secondary hover:bg-card hover:text-foreground transition-colors"
                >
                  الدرس التالي →
                </button>
              </div>

              <button
                onClick={() => {
                  toggleComplete(activeLesson.id);
                  setActiveLesson(null);
                }}
                className="px-4 py-2 rounded-[16px] bg-turquoise hover:opacity-90 text-white font-bold text-xs transition-opacity shadow-md shadow-turquoise/20"
              >
                 تم إنهاء ومشاهدة الدرس
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
