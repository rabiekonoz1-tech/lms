'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { educationApi } from '../../../lib/education-api';
import { assessmentApi } from '../../../lib/assessment-api';
import type { Course, Exam } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { AwardIcon, CheckCircleIcon, ClockIcon, GraduationCapIcon } from '../../../components/icons';

interface ExamQuestion {
  id: string | number;
  question_text: string;
  question_type: string;
  options?: string[];
  points: number;
}

export default function StudentExamsPage() {
  const [exams, setExams] = useState<{ course: Course; item: Exam }[]>([]);
  const [loading, setLoading] = useState(true);

  // Active exam session state
  const [activeExam, setActiveExam] = useState<{ course: Course; item: Exam } | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [examResult, setExamResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        const cList = await educationApi.getCourses();
        const allExams: { course: Course; item: Exam }[] = [];
        for (const course of cList) {
          const eList = await assessmentApi.getExams(course.id).catch(() => []);
          for (const exam of eList) {
            allExams.push({ course, item: exam });
          }
        }
        setExams(allExams);
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  const handleSubmitExam = useCallback(async () => {
    if (!activeExam || !activeAttempt) return;
    try {
      setSubmitting(true);
      const res = await assessmentApi.submitExam(activeExam.course.id, activeExam.item.id, activeAttempt.id);
      
      const score = res.attempt.score ?? 0;
      const total = activeExam.item.total_points || 100;
      const percentage = (score / total) * 100;
      
      setExamResult({
        score,
        total,
        percentage,
        passed: percentage >= 60,
      });
    } catch (error) {
      alert('حدث خطأ أثناء تسليم الاختبار. قد يكون قد تم تسليمه مسبقاً.');
      setActiveExam(null);
    } finally {
      setSubmitting(false);
    }
  }, [activeExam, activeAttempt]);

  const handleSubmitRef = useRef(handleSubmitExam);
  handleSubmitRef.current = handleSubmitExam;

  // Countdown timer for active exam
  useEffect(() => {
    if (!activeExam || !activeAttempt || examResult) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeExam, activeAttempt, examResult]);

  const handleStartExam = async (examObj: { course: Course; item: Exam }) => {
    try {
      setLoading(true);
      const data = await assessmentApi.startExam(examObj.course.id, examObj.item.id);
      setActiveExam(examObj);
      setActiveAttempt(data.attempt);
      setQuestions(data.questions || []);
      setUserAnswers({});
      setExamResult(null);
      setSecondsRemaining((examObj.item.duration_minutes || 45) * 60);
    } catch (error: any) {
      alert(error.message || 'لا يمكن بدء الاختبار. قد يكون لديك محاولة سابقة أو الاختبار غير متاح.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = async (questionId: string | number, optionIdx: number, optionValue: string) => {
    if (examResult || !activeExam || !activeAttempt) return;
    
    // Optimistic UI update
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));

    try {
      await assessmentApi.submitExamAnswer(
        activeExam.course.id,
        activeExam.item.id,
        activeAttempt.id,
        String(questionId),
        { answer_data: optionValue }
      );
    } catch (error) {
      console.error('Failed to sync answer with backend', error);
      // Ideally, show a toast notification here
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <GraduationCapIcon size={24} className="text-primary" />
            الاختبارات الإلكترونية
          </h1>
          <p className="text-sm text-secondary mt-1">
            استعرض الاختبارات المتاحة، ابدأ جلسة الاختبار الإلكتروني، واطلع على النتائج المعتمدة.
          </p>
        </div>
        <Badge variant="success">إجمالي الاختبارات: {exams.length}</Badge>
      </div>

      {loading && !activeExam ? (
        <div className="py-16 text-center text-secondary text-sm">جارٍ التحميل...</div>
      ) : exams.length === 0 ? (
        <Card className="p-12 text-center text-secondary">
          لا توجد اختبارات مجدولة حالياً.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map(({ course, item }) => (
            <Card key={item.id} className="p-6 border-border hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-primary font-bold px-2 py-0.5 rounded bg-primary/10">
                  {course.code}
                </span>
                <Badge variant="info">متاح للبدء</Badge>
              </div>

              <h3 className="mt-3 text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs text-secondary mt-1">المقرر: {course.title}</p>

              <div className="mt-4 flex items-center gap-4 text-xs text-secondary">
                <span className="flex items-center gap-1">
                  <ClockIcon size={14} className="text-secondary" />
                  المدة: {item.duration_minutes || 60} دقيقة
                </span>
                <span className="flex items-center gap-1">
                  <AwardIcon size={14} className="text-primary" />
                  الدرجة: {item.total_points || 100} نقطة
                </span>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => handleStartExam({ course, item })}
                  className="w-full py-2.5 rounded-[16px] bg-primary hover:bg-primary text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-600/20"
                >
                  بدء الاختبار الإلكتروني الآن
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Interactive Exam Runner Modal */}
      {activeExam && activeAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-card border border-border rounded-[20px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header / Timer */}
            <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {activeExam.course.code}
                  </span>
                  <h3 className="text-sm font-bold text-white">{activeExam.item.title}</h3>
                </div>
                <span className="text-[11px] text-secondary">
                  تم الإجابة على: {Object.keys(userAnswers).length} من {questions.length} أسئلة
                </span>
              </div>

              {/* Timer Pill */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[16px] font-mono text-xs font-bold border ${
                  secondsRemaining < 300
                    ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                    : 'bg-slate-800 text-primary border-slate-700'
                }`}
              >
                <ClockIcon size={14} />
                <span>الوقت المتبقي: {formatTime(secondsRemaining)}</span>
              </div>
            </div>

            {/* Questions Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {examResult ? (
                /* Result View */
                <div className="text-center py-8 space-y-4">
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl shadow-xl ${
                      examResult.passed
                        ? 'bg-[color-mix(in_srgb,var(--pri)_15%,transparent)] text-primary border border-primary/40 shadow-emerald-500/20'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-red-500/20'
                    }`}
                  >
                    {examResult.passed ? '🎉' : '⚠️'}
                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    {examResult.passed ? 'مبروك! لقد اجتزت الاختبار بنجاح' : 'تم تسليم الاختبار. النتيجة قد تتطلب مراجعة أو لم تجتز الدرجة.'}
                  </h3>

                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="p-3 bg-background rounded-[16px] border border-border">
                      <span className="text-secondary block text-xs">درجتك المحصلة:</span>
                      <span className="text-xl font-bold text-primary font-mono">
                        {examResult.score} / {examResult.total}
                      </span>
                    </div>

                    <div className="p-3 bg-background rounded-[16px] border border-border">
                      <span className="text-secondary block text-xs">النسبة المئوية:</span>
                      <span className="text-xl font-bold text-white font-mono">
                        {examResult.percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="p-3 bg-background rounded-[16px] border border-border">
                      <span className="text-secondary block text-xs">التقدير:</span>
                      <span className="text-base font-bold text-turquoise">
                        {examResult.percentage >= 90
                          ? 'ممتاز (A+)'
                          : examResult.percentage >= 75
                          ? 'جيد جداً (B)'
                          : examResult.percentage >= 60
                          ? 'مقبول (C)'
                          : 'غير مجتاز'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-secondary max-w-md mx-auto pt-2">
                    تم تسجيل النتيجة رسمياً في السيرفر (Source of Truth) وإرسال إشعار فوري لولي الأمر والمعلم المشرف.
                  </p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8 text-secondary text-sm">لا توجد أسئلة متاحة في هذا الاختبار.</div>
              ) : (
                /* Questions Form */
                questions.map((question, qIdx) => {
                  const selectedOptIdx = userAnswers[question.id];
                  const optionsArray = Array.isArray(question.options) ? question.options : [];
                  
                  return (
                    <div
                      key={question.id}
                      className="p-5 rounded-[20px] bg-background/60 border border-border/80 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-relaxed">{question.question_text}</h4>
                          <span className="text-[10px] text-secondary mt-1 block">الدرجة: {question.points}</span>
                        </div>
                      </div>

                      <div className="space-y-2 pr-9">
                        {optionsArray.map((opt, optIdx) => {
                          const isSelected = selectedOptIdx === optIdx;
                          return (
                            <div
                              key={optIdx}
                              onClick={() => handleSelectOption(question.id, optIdx, opt)}
                              className={`flex items-center gap-3 p-3 rounded-[16px] border cursor-pointer transition-all text-xs ${
                                isSelected
                                  ? 'border-emerald-500 bg-[color-mix(in_srgb,var(--pri)_15%,transparent)] text-primary font-semibold shadow-sm'
                                  : 'border-slate-800 bg-card/60 text-secondary hover:border-border hover:bg-slate-900'
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-emerald-500 bg-emerald-500'
                                    : 'border-slate-600 bg-transparent'
                                }`}
                              >
                                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                              </div>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between">
              {examResult ? (
                <button
                  onClick={() => {
                    setActiveExam(null);
                    setActiveAttempt(null);
                    setExamResult(null);
                  }}
                  className="w-full py-2.5 rounded-[16px] bg-card border-border border hover:bg-background hover:border-border hover:border text-white font-semibold text-xs transition-colors"
                >
                  العودة لقائمة الاختبارات
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من الخروج؟ سيظل الاختبار معلقاً في السيرفر ويمكنك استكماله لاحقاً قبل انتهاء الوقت.')) {
                        setActiveExam(null);
                        setActiveAttempt(null);
                      }
                    }}
                    className="px-4 py-2 rounded-[16px] border border-border text-xs text-secondary hover:text-white"
                  >
                    إلغاء وخروج
                  </button>

                  <button
                    onClick={handleSubmitExam}
                    disabled={Object.keys(userAnswers).length === 0 || submitting}
                    className="px-6 py-2.5 rounded-[16px] bg-primary hover:bg-primary disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                  >
                    <CheckCircleIcon size={16} />
                    {submitting ? 'جارٍ التسليم...' : `تسليم إجابات الاختبار نهائياً (${Object.keys(userAnswers).length}/${questions.length})`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
