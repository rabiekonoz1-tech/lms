'use client';

import React, { useEffect, useState } from 'react';
import { integrationApi } from '../../../lib/integration-api';
import { educationApi } from '../../../lib/education-api';
import type { Meeting, Course } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ClockIcon, VideoIcon, CheckCircleIcon, BookOpenIcon } from '../../../components/icons';

export default function TeacherMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [startTime, setStartTime] = useState('');
  const [customMeetUrl, setCustomMeetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meets, crs] = await Promise.all([
        integrationApi.getMeetings(),
        educationApi.getCourses().catch(() => []),
      ]);
      setMeetings(meets);
      setCourses(crs);
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      setFeedbackMsg(null);

      const created = await integrationApi.createMeeting({
        title: title.trim(),
        description: description.trim() || undefined,
        provider: 'google_meet',
        course_id: courseId || undefined,
        duration_minutes: Number(durationMinutes),
        start_time: startTime || undefined,
        meet_url: customMeetUrl.trim() || undefined,
      });

      setMeetings((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
      setStartTime('');
      setCustomMeetUrl('');
      setIsCreating(false);
      setFeedbackMsg({
        type: 'success',
        text: `تم إنشاء اجتماع Google Meet بنجاح! كود القاعة: ${created.external_meeting_id}`,
      });
    } catch {
      setFeedbackMsg({
        type: 'error',
        text: 'حدث خطأ أثناء إنشاء جلسة Google Meet. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCancelMeeting = async (id: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الاجتماع؟')) return;
    try {
      await integrationApi.cancelMeeting(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      setFeedbackMsg({ type: 'success', text: 'تم إلغاء الاجتماع بنجاح.' });
    } catch {
      setFeedbackMsg({ type: 'error', text: 'تعذر إلغاء الاجتماع.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <VideoIcon size={24} className="text-emerald-500" />
              فصول Google Meet والبث التفاعلي المباشر
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Google Meet API مفعّل
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            أنشئ وجدول حصص تفاعلية مباشرة مع الطلبة باستخدام Google Meet، مع إمكانية مشاركة الشاشة وتسجيل الحضور.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating((v) => !v);
            setFeedbackMsg(null);
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-4 py-2.5 rounded-[16px] text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95"
        >
          <VideoIcon size={16} />
          {isCreating ? 'إغلاق نموذج الاجتماع' : '+ إنشاء فصل Google Meet جديد'}
        </button>
      </div>

      {/* Integration Info Banner */}
      <div className="rounded-[20px] bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 border border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0">
            🎥
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-2">
              <span>Google Meet Workspace Integration</span>
              <Badge variant="success">متصل بالمنظومة</Badge>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Client ID: <span className="font-mono text-emerald-400">978486739253-qb206lpih6c0upanrph3ed1lgvbl4ek4...</span>
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 max-w-sm">
          يتم إنشاء روابط غرف Google Meet بصيغة مشفرة معتمدة، ويتاح الانضمام السريع للطلبة والمعلم من أي جهاز.
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-[16px] text-xs font-semibold border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* Create Meeting Form */}
      {isCreating && (
        <Card className="p-6 border-emerald-500/30 bg-[color-mix(in_srgb,var(--tq)_5%,transparent)] shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="text-emerald-500">📹</span>
              بيانات جلسة Google Meet الجديدة
            </h2>
            <span className="text-xs text-secondary">سيتم توليد رابط الاجتماع فوراً</span>
          </div>

          <form onSubmit={handleCreateMeeting} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  عنوان الجلسة / المحاضرة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مراجعة نهائية - الفيزياء الحديثة"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-[14px] px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">المقرر الدراسي المرتبط</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full bg-background border border-border rounded-[14px] px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                  <option value="">-- اختياري: اختر المقرر المرتبط بالبث --</option>
                  {courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>
                      {crs.code} - {crs.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">موعد البدء (تاريخ ووقت)</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-background border border-border rounded-[14px] px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">مدة الجلسة بالدقائق</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-[14px] px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                  <option value={30}>30 دقيقة (نصف ساعة)</option>
                  <option value={45}>45 دقيقة (حصة دراسية)</option>
                  <option value={60}>60 دقيقة (ساعة كاملة)</option>
                  <option value={90}>90 دقيقة (ساعة ونصف)</option>
                  <option value={120}>120 دقيقة (ساعتان)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  كود أو رابط مسبق (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="اتركه فارغاً للتوليد التلقائي أو ضع رابط Meet"
                  value={customMeetUrl}
                  onChange={(e) => setCustomMeetUrl(e.target.value)}
                  className="w-full bg-background border border-border rounded-[14px] px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">وصف الجلسة وملاحظات للطلبة</label>
              <textarea
                rows={2}
                placeholder="تعليمات الدخول، الموضوعات المناقشة، الأدوات المطلوبة..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-background border border-border rounded-[14px] px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-[14px] border border-border text-xs text-secondary hover:text-foreground transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-[14px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'جارٍ إنشاء الرابط...' : '✓ تأكيد وجدولة جلسة Google Meet'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Meetings List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">الجلسات المجدولة والحالية ({meetings.length})</h2>
          <span className="text-xs text-secondary">مرتبة بحسب أحدث الجلسات</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-secondary text-sm">جارٍ تحميل الاجتماعات من الخادم...</div>
        ) : meetings.length === 0 ? (
          <Card className="p-12 text-center text-secondary">
            لا توجد جلسات Google Meet مجدولة حالياً. انقر على &quot;+ إنشاء فصل Google Meet جديد&quot; لبدء بث مباشر.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {meetings.map((meeting) => {
              const isGoogleMeet = meeting.provider === 'google_meet';
              return (
                <Card
                  key={meeting.id}
                  className="p-5 border border-border hover:border-emerald-500/40 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <span>🎥</span>
                          <span>{isGoogleMeet ? 'Google Meet' : meeting.provider}</span>
                        </span>
                        {meeting.external_meeting_id && (
                          <span className="font-mono text-xs font-semibold text-secondary bg-background px-2 py-0.5 rounded border border-border">
                            {meeting.external_meeting_id}
                          </span>
                        )}
                      </div>
                      <Badge variant={meeting.status === 'completed' ? 'neutral' : 'success'}>
                        {meeting.status === 'completed' ? 'منتهي' : 'متاح وجاهز'}
                      </Badge>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-foreground">{meeting.title}</h3>
                    {meeting.description && (
                      <p className="text-xs text-secondary mt-1 leading-relaxed line-clamp-2">
                        {meeting.description}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs text-secondary">
                      <span className="flex items-center gap-1">
                        <ClockIcon size={14} className="text-secondary" />
                        المدة: {meeting.duration_minutes} دقيقة
                      </span>
                      {meeting.start_time && (
                        <span>
                          الموعد: {new Date(meeting.start_time).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {/* Host Direct Launch */}
                      <a
                        href={meeting.host_url || meeting.join_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-[14px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 transition-all shadow-sm"
                      >
                        <span>👨‍🏫 دخول كمعلم (Host)</span>
                      </a>

                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopyLink(meeting.join_url, meeting.id)}
                        className="px-3.5 py-2.5 rounded-[14px] border border-border hover:bg-background text-xs font-medium text-secondary hover:text-foreground transition-colors"
                        title="نسخ رابط الطالب"
                      >
                        {copiedId === meeting.id ? (
                          <span className="text-emerald-500 flex items-center gap-1">
                            <CheckCircleIcon size={14} /> تم النسخ
                          </span>
                        ) : (
                          '📋 نسخ الرابط'
                        )}
                      </button>

                      {/* Cancel */}
                      <button
                        onClick={() => handleCancelMeeting(meeting.id)}
                        className="px-3 py-2.5 rounded-[14px] border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs transition-colors"
                        title="إلغاء الجلسة"
                      >
                        ✕
                      </button>
                    </div>

                    <span className="text-[10px] text-secondary truncate font-mono text-center opacity-70">
                      {meeting.join_url}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
