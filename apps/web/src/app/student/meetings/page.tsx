'use client';

import React, { useEffect, useState } from 'react';
import { integrationApi } from '../../../lib/integration-api';
import type { Meeting } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ClockIcon, VideoIcon } from '../../../components/icons';

interface ChatMessage {
  id: string;
  sender: string;
  role: 'teacher' | 'student' | 'system';
  text: string;
  time: string;
}

export default function StudentMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Active virtual classroom state
  const [activeMeetingRoom, setActiveMeetingRoom] = useState<Meeting | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [raisedHandsCount, setRaisedHandsCount] = useState(2);

  // Live in-meeting chat stream
  const [roomMessages, setRoomMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'النظام',
      role: 'system',
      text: 'مرحباً بكم في قاعة البث المباشر. يرجى الالتزام بآداب الحوار ورفع اليد للمداخلات الصوتية.',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        setLoading(true);
        const data = await integrationApi.getMeetings();
        setMeetings(data);
      } finally {
        setLoading(false);
      }
    };
    loadMeetings();
  }, []);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'أنا (الطالب)',
      role: 'student',
      text: chatInput,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    setRoomMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  const toggleHandRaise = () => {
    setHasRaisedHand((prev) => {
      const nextState = !prev;
      setRaisedHandsCount((cnt) => (nextState ? cnt + 1 : Math.max(0, cnt - 1)));
      return nextState;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <VideoIcon size={24} className="text-turquoise" />
            قاعات البث المباشر والاجتماعات التفاعلية
          </h1>
          <p className="text-sm text-secondary mt-1">
            انضم إلى جلسات الشرح المباشرة مع المعلمين، وتفاعل صوتاً وصورة في غرف البث الآمنة.
          </p>
        </div>
        <Badge variant="info">الجلسات المتاحة: {meetings.length}</Badge>
      </div>

      {loading ? (
        <div className="py-16 text-center text-secondary text-sm">جارٍ تحميل الاجتماعات...</div>
      ) : meetings.length === 0 ? (
        <Card className="p-12 text-center text-secondary">
          لا توجد محاضرات مباشرة مجدولة في الوقت الحالي.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="p-6 border-turquoise/30 bg-[color-mix(in_srgb,var(--tq)_15%,transparent)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-turquoise uppercase">
                    مزود البث: {meeting.provider}
                  </span>
                  <Badge variant="success">مباشر ومتاح الآن</Badge>
                </div>

                <h2 className="mt-3 text-lg font-bold text-white">{meeting.title}</h2>
                <p className="text-xs text-secondary mt-1 leading-relaxed">
                  {meeting.description || 'جلسة تفاعلية مباشرة مع المعلم لمراجعة المنهج ومناقشة التساؤلات والتمارين.'}
                </p>

                <div className="mt-4 pt-4 border-t border-border/80 flex items-center justify-between text-xs text-secondary">
                  <span className="flex items-center gap-1.5">
                    <ClockIcon size={14} className="text-secondary" />
                    المدة: {meeting.duration_minutes} دقيقة
                  </span>
                  {meeting.start_time && (
                    <span className="text-secondary">
                      البدء: {new Date(meeting.start_time).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/80 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setActiveMeetingRoom(meeting)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r bg-turquoise to-indigo-500 hover:bg-turquoise hover:to-indigo-400 text-white font-semibold text-xs py-3 transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
                >
                  <VideoIcon size={16} />
                  <span>دخول القاعة التفاعلية بالمنصة</span>
                </button>
                <a
                  href={meeting.join_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 rounded-[16px] bg-card border-border border hover:bg-background hover:border-border hover:border text-secondary text-xs font-medium border border-border text-center transition-colors"
                >
                  🔗 رابط خارجي
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Interactive Virtual Classroom Modal */}
      {activeMeetingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 md:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-6xl bg-background border border-border rounded-[24px] overflow-hidden shadow-2xl flex flex-col h-[94vh]">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-card/60 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-rose-400">مباشر الآن (LIVE)</span>
                </div>
                <div className="h-4 w-px bg-card border-border border" />
                <h3 className="text-sm font-bold text-white">{activeMeetingRoom.title}</h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-secondary bg-card px-3 py-1 rounded-full border border-border">
                  👥 19 مشارك في الجلسة
                </span>
                <button
                  onClick={() => setActiveMeetingRoom(null)}
                  className="px-3.5 py-1.5 rounded-[16px] bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-semibold transition-colors"
                >
                  مغادرة القاعة ✕
                </button>
              </div>
            </div>

            {/* Main Stage & Chat Layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left/Center: Video Stage & Controls */}
              <div className="flex-1 flex flex-col bg-background p-4 border-b lg:border-b-0 lg:border-l border-border">
                {/* Main Video Screen */}
                <div className="relative flex-1 rounded-[20px] bg-card border border-border/80 overflow-hidden flex items-center justify-center min-h-[300px]">
                  {/* Background grid simulation */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

                  {/* Teacher Stream Presentation */}
                  <div className="relative text-center p-6 space-y-4">
                    <div className="relative inline-block">
                      <div className="h-28 w-28 mx-auto rounded-[24px] bg-gradient-to-tr bg-turquoise to-purple-600 border-4 border-turquoise/40 flex items-center justify-center text-4xl shadow-2xl">
                        👨‍🏫
                      </div>
                      <span className="absolute bottom-1 right-1 bg-primary text-[10px] text-white px-2 py-0.5 rounded-full font-bold shadow">
                        يتحدث الآن
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">شاشة المعلم: أ. د. عبد الله السالم</h4>
                      <p className="text-xs text-secondary mt-1 max-w-md mx-auto">
                        مشاركة الشاشة: حل تمارين الفصل والمسائل النموذجية — الجودة 1080p 60fps.
                      </p>
                    </div>
                  </div>

                  {/* Raised hands badge on screen */}
                  {raisedHandsCount > 0 && (
                    <div className="absolute top-4 right-4 bg-accent/20 border border-amber-500/40 text-amber-300 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                      <span>✋</span>
                      <span>{raisedHandsCount} أيادٍ مرفوعة للمشاركة</span>
                    </div>
                  )}

                  {/* My Video thumbnail preview */}
                  <div className="absolute bottom-4 left-4 w-36 h-24 rounded-[16px] bg-background/80 border border-border/80 flex items-center justify-center backdrop-blur-md shadow-lg">
                    {isCamOn ? (
                      <span className="text-xs text-primary font-semibold">كاميرتك قيد البث</span>
                    ) : (
                      <span className="text-[11px] text-secondary">الكاميرا متوقفة</span>
                    )}
                  </div>
                </div>

                {/* Bottom Control Bar */}
                <div className="mt-4 pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsMicOn((prev) => !prev)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-[16px] text-xs font-semibold border transition-all ${
                      isMicOn
                        ? 'bg-emerald-600 text-white border-primary shadow-md shadow-emerald-600/30'
                        : 'bg-slate-900 text-secondary border-border hover:text-white'
                    }`}
                  >
                    <span>{isMicOn ? '🎙️ الميكروفون يعمل' : '🔇 الميكروفون مكتوم'}</span>
                  </button>

                  <button
                    onClick={() => setIsCamOn((prev) => !prev)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-[16px] text-xs font-semibold border transition-all ${
                      isCamOn
                        ? 'bg-emerald-600 text-white border-primary shadow-md shadow-emerald-600/30'
                        : 'bg-slate-900 text-secondary border-border hover:text-white'
                    }`}
                  >
                    <span>{isCamOn ? '📹 الكاميرا مفتوحة' : '📷 الكاميرا مغلقة'}</span>
                  </button>

                  <button
                    onClick={toggleHandRaise}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-[16px] text-xs font-semibold border transition-all ${
                      hasRaisedHand
                        ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30'
                        : 'bg-slate-900 text-secondary border-border hover:text-white'
                    }`}
                  >
                    <span>✋</span>
                    <span>{hasRaisedHand ? 'اليد مرفوعة (انقر للإنزال)' : 'رفع اليد للسؤال'}</span>
                  </button>
                </div>
              </div>

              {/* Right: Live Interactive Chat Stream */}
              <div className="w-full lg:w-80 bg-card/60 p-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-bold text-white">الدردشة الحية في القاعة</span>
                    <span className="text-[10px] text-primary font-mono">نشط ومباشر</span>
                  </div>

                  <div className="mt-4 space-y-3 overflow-y-auto max-h-[380px] lg:max-h-[480px] pr-1">
                    {roomMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-[20px] text-xs space-y-1 ${
                          msg.role === 'teacher'
                            ? 'bg-[color-mix(in_srgb,var(--tq)_15%,transparent)] border border-turquoise/30 text-indigo-100'
                            : msg.role === 'system'
                            ? 'bg-card border border border-border text-secondary text-[11px]'
                            : 'bg-slate-950 border border-border text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span
                            className={`font-bold ${
                              msg.role === 'teacher' ? 'text-indigo-400' : 'text-slate-300'
                            }`}
                          >
                            {msg.sender}
                          </span>
                          <span className="text-secondary font-mono">{msg.time}</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat input box */}
                <div className="pt-3 border-t border-border flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="اكتب رسالتك للمدرس والزملاء..."
                    className="flex-1 bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-turquoise"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-3.5 py-2 rounded-[16px] bg-turquoise hover:bg-turquoise text-white font-bold text-xs shadow-md transition-colors"
                  >
                    إرسال
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
