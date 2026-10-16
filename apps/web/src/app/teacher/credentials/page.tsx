'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { credentialsApi, CredentialItem, IssueCredentialResponse } from '../../../lib/credentials-api';
import { educationApi } from '../../../lib/education-api';
import type { Student } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Modal } from '../../../components/ui/modal';
import { StatCard } from '../../../components/ui/stat-card';
import { EmptyState } from '../../../components/ui/empty-state';
import { TableSkeleton } from '../../../components/ui/skeleton';
import {
  QrCodeIcon,
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon,
  SearchIcon,
  SmartphoneIcon,
  UserIcon,
} from '../../../components/icons';

// Device replacement reason preset chips
const REPLACEMENT_REASONS = [
  'شراء جهاز جديد للطالب',
  'عطل أو تلف في الجهاز القديم',
  'فقدان أو سرقة الجهاز السابق',
  'تحديث نظام التشغيل وتغير البصمة الرقمية',
  'طلب رسمي من ولي أمر الطالب',
];

export default function TeacherCredentialsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueExpiresAt, setIssueExpiresAt] = useState('');
  const [isIssuing, setIsIssuing] = useState(false);
  const [issuedResult, setIssuedResult] = useState<IssueCredentialResponse | null>(null);

  const [replacingCred, setReplacingCred] = useState<CredentialItem | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [replaceReason, setReplaceReason] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);

  const [revokingCred, setRevokingCred] = useState<CredentialItem | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load students list
  const loadStudents = async () => {
    try {
      const data = await educationApi.getStudents();
      setStudents(data);
      if (data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(data[0].id);
      }
    } catch {
      // Fallback fallback sample students if needed
      const fallbackList: Student[] = [
        {
          id: '01a0ef9d-5232-7086-9129-5989e81a7dd9',
          user_id: 'u-1',
          student_code: 'STU-2026-001',
          grade_level: 'الصف الثالث الثانوي',
          status: 'active',
          user: {
            id: 'u-1',
            name: 'عمر أحمد فاروق',
            phone: '+966500000003',
            email: 'student@almustaqbal.edu',
            type: 'student',
            status: 'active',
          },
        },
      ];
      setStudents(fallbackList);
      if (!selectedStudentId) {
        setSelectedStudentId(fallbackList[0].id);
      }
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Load credentials whenever selected student changes
  const loadCredentials = async (studentId: string) => {
    if (!studentId) return;
    try {
      const data = await credentialsApi.getStudentCredentials(studentId);
      setCredentials(data);
    } catch {
      setFeedback({ type: 'error', text: 'فشل في تحميل بيانات الاعتماد للطالب المحدد.' });
    } finally {
      setLoadingCreds(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadCredentials(selectedStudentId);
    }
  }, [selectedStudentId]);

  // Selected student object
  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Filtered student list for picker
  const filteredStudents = useMemo(() => {
    if (!searchStudent.trim()) return students;
    const q = searchStudent.toLowerCase();
    return students.filter(
      (s) =>
        s.user?.name.toLowerCase().includes(q) ||
        s.student_code.toLowerCase().includes(q) ||
        s.user?.phone?.includes(q)
    );
  }, [students, searchStudent]);

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setFeedback({ type: 'success', text: `تم نسخ ${label} إلى الحافظة بنجاح!` });
  };

  // Issue Credential Handler
  const handleIssueCredential = async () => {
    if (!selectedStudentId) return;
    try {
      setIsIssuing(true);
      const result = await credentialsApi.issueCredential(
        selectedStudentId,
        issueExpiresAt || undefined
      );
      setIssuedResult(result);
      setFeedback({ type: 'success', text: 'تم إصدار كود الدخول والرمز السري بنجاح!' });
      loadCredentials(selectedStudentId);
    } catch {
      setFeedback({ type: 'error', text: 'حدث خطأ أثناء إصدار كود الدخول.' });
    } finally {
      setIsIssuing(false);
    }
  };

  // Replace Device Handler
  const handleConfirmReplaceDevice = async () => {
    if (!replacingCred || !replaceReason.trim()) return;
    try {
      setIsReplacing(true);
      const randomFingerprint = 'fp_' + Math.random().toString(36).substring(2, 10);
      const randomDeviceId = 'dev_' + Date.now().toString(36);

      await credentialsApi.replaceDevice(replacingCred.id, {
        newDeviceId: randomDeviceId,
        newDeviceFingerprint: randomFingerprint,
        newDeviceName: newDeviceName.trim() || 'جهاز جديد معتمد',
        reason: replaceReason.trim(),
      });

      setFeedback({
        type: 'success',
        text: 'تم استبدال الجهاز المقترن وتسجيل سبب التغيير في سجل التدقيق.',
      });
      setReplacingCred(null);
      setNewDeviceName('');
      setReplaceReason('');
      loadCredentials(selectedStudentId);
    } catch {
      setFeedback({ type: 'error', text: 'حدث خطأ أثناء استبدال الجهاز.' });
    } finally {
      setIsReplacing(false);
    }
  };

  // Revoke Credential Handler
  const handleConfirmRevoke = async () => {
    if (!revokingCred || !revokeReason.trim()) return;
    try {
      setIsRevoking(true);
      await credentialsApi.revoke(revokingCred.id, revokeReason.trim());
      setFeedback({ type: 'success', text: 'تم تعطيل كود الدخول بنجاح.' });
      setRevokingCred(null);
      setRevokeReason('');
      loadCredentials(selectedStudentId);
    } catch {
      setFeedback({ type: 'error', text: 'حدث خطأ أثناء تعطيل الكود.' });
    } finally {
      setIsRevoking(false);
    }
  };

  const activeCred = credentials.find((c) => c.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <QrCodeIcon size={26} className="text-turquoise" />
            أكواد الدخول وإدارة ربط الأجهزة (Device Binding)
          </h1>
          <p className="text-sm text-secondary mt-1">
            إدارة بطاقات الدخول الرقمية والتحكم في الأجهزة الموثوقة ومنع مشاركة الحسابات التعليمية.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => {
              setIssuedResult(null);
              setIssueExpiresAt('');
              setIsIssueModalOpen(true);
            }}
            disabled={!selectedStudentId}
          >
            + إصدار كود جديد للطالب
          </Button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-[16px] border p-4 text-sm flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'border-emerald-500/30 bg-primary/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircleIcon size={18} className="text-primary" />
            ) : (
              <XCircleIcon size={18} className="text-red-400" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs text-secondary hover:text-white"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Metrics Workspace Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="الطالب المحدد"
          value={currentStudent?.user?.name || 'غير محدد'}
          subtitle={currentStudent?.grade_level || 'طالب مسجل'}
          icon={<UserIcon size={20} />}
          variant="indigo"
        />
        <StatCard
          title="حالة ترخيص الدخول"
          value={activeCred ? 'نشط ومقترن' : credentials.length > 0 ? 'معطل' : 'لا يوجد ترخيص'}
          subtitle={activeCred ? 'يمكن للطالب الدخول فقط من جهازه' : 'يحتاج لإصدار كود جديد'}
          icon={<ShieldIcon size={20} />}
          variant={activeCred ? 'emerald' : 'amber'}
        />
        <StatCard
          title="الجهاز المعتمد حالياً"
          value={activeCred?.device_binding?.device_name || 'لم يقترن جهاز'}
          subtitle={activeCred?.device_binding ? 'بصمة رقمية مشفرة' : 'بانتظار تسجيل الدخول الأول'}
          icon={<SmartphoneIcon size={20} />}
          variant="default"
        />
        <StatCard
          title="سياسة الحماية المطبقة"
          value="1 جهاز لكل حساب"
          subtitle="منع تام لتعدد الأجهزة بدون إذن"
          icon={<ShieldIcon size={20} />}
          variant="purple"
        />
      </div>

      {/* Student Directory Selector & Filter */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <Input
              placeholder="ابحث بالاسم أو كود الطالب أو رقم الهاتف لاختيار الطالب..."
              iconPrefix={<SearchIcon size={16} />}
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
            />
          </div>
          <div className="text-xs text-secondary">
            تم العثور على {filteredStudents.length} طالب
          </div>
        </div>

        {/* Quick Student Selector Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {filteredStudents.map((st) => {
            const isSelected = st.id === selectedStudentId;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStudentId(st.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-[16px] text-xs whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'border-indigo-500 bg-turquoise/15 text-white font-semibold shadow-sm'
                    : 'border-slate-800 bg-card/50 text-secondary hover:border-border hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {st.user?.name.charAt(0) || 'ط'}
                </div>
                <span>{st.user?.name || 'طالب'}</span>
                <span className="text-[10px] opacity-60 font-mono">({st.student_code})</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Credentials and Devices Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-white">
              الأكواد الصادرة والأجهزة المقترنة للطالب:{' '}
              <span className="text-turquoise">{currentStudent?.user?.name}</span>
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              كود الدخول صالح لجهاز واحد فقط. عند تسجيل الدخول من جهاز آخر يتم رفض العملية تلقائياً.
            </p>
          </div>
          {activeCred && (
            <Badge variant="success">
              كود نشط: {activeCred.credential_code}
            </Badge>
          )}
        </div>

        {loadingCreds ? (
          <TableSkeleton rows={3} cols={4} />
        ) : credentials.length === 0 ? (
          <EmptyState
            title="لا توجد أكواد دخول صادرة لهذا الطالب"
            description="لم يتم إصدار بطاقة ترخيص أو كود دخول لهذا الطالب حتى الآن. يمكنك إصدار كود جديد فوراً."
            action={{
              label: 'إصدار كود دخول الآن',
              onClick: () => {
                setIssuedResult(null);
                setIssueExpiresAt('');
                setIsIssueModalOpen(true);
              },
            }}
          />
        ) : (
          <div className="space-y-4">
            {credentials.map((cred) => {
              const isBindingActive = Boolean(cred.device_binding);
              const deviceName = cred.device_binding?.device_name || 'جهاز غير معروف';
              const fingerprint = cred.device_binding?.device_fingerprint || 'غير متوفر';

              return (
                <div
                  key={cred.id}
                  className={`rounded-[20px] border p-5 transition-all ${
                    cred.status === 'active'
                      ? 'border-slate-800 bg-card/60'
                      : 'border-slate-800/60 bg-background/40 opacity-75'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Credential Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-bold text-turquoise bg-turquoise/10 px-3.5 py-1.5 rounded-[16px] border border-turquoise/20 tracking-wider">
                          {cred.credential_code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(cred.credential_code, 'كود الدخول')}
                          className="text-xs text-secondary hover:text-white px-2 py-1 rounded bg-card/60 border-border/60 border transition-colors"
                          title="نسخ الكود"
                        >
                          نسخ الكود
                        </button>
                        <Badge
                          variant={
                            cred.status === 'active'
                              ? 'success'
                              : cred.status === 'revoked'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {cred.status === 'active'
                            ? 'نشط ومقترن'
                            : cred.status === 'revoked'
                            ? 'معطل (Revoked)'
                            : 'معلق'}
                        </Badge>
                      </div>

                      {/* Device Binding Info Box */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
                        <div className="flex items-center gap-1.5 bg-card/40 border-border/40 border px-3 py-1.5 rounded-lg border border-border/50">
                          <SmartphoneIcon size={16} className="text-turquoise" />
                          <span>الجهاز المقترن:</span>
                          <span className="font-semibold text-white">
                            {isBindingActive ? deviceName : 'بانتظار تسجيل الدخول الأول'}
                          </span>
                        </div>

                        {isBindingActive && (
                          <div className="flex items-center gap-1.5 bg-card/40 border-border/40 border px-3 py-1.5 rounded-lg border border-border/50 font-mono text-[11px] text-secondary">
                            <ShieldIcon size={14} className="text-primary" />
                            <span>البصمة: {fingerprint.slice(0, 16)}...</span>
                          </div>
                        )}

                        {cred.issued_at && (
                          <span className="text-[11px] text-secondary">
                            صدر في: {new Date(cred.issued_at).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>

                      {/* Revocation reason if revoked */}
                      {cred.status === 'revoked' && cred.revocation_reason && (
                        <p className="text-xs text-red-400/90 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20 inline-block">
                          سبب التعطيل: {cred.revocation_reason}
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    {cred.status === 'active' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setReplacingCred(cred);
                            setNewDeviceName('');
                            setReplaceReason('');
                          }}
                        >
                          استبدال الجهاز المقترن
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setRevokingCred(cred);
                            setRevokeReason('');
                          }}
                        >
                          تعطيل الكود
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal: Issue New Credential */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => !isIssuing && setIsIssueModalOpen(false)}
        title="إصدار كود دخول جديد للطالب"
        subtitle={`سيتم إنشاء ترخيص دخول فريد للطالب: ${currentStudent?.user?.name}`}
        size="md"
        footer={
          !issuedResult && (
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="secondary"
                onClick={() => setIsIssueModalOpen(false)}
                disabled={isIssuing}
              >
                إلغاء
              </Button>
              <Button
                variant="primary"
                onClick={handleIssueCredential}
                isLoading={isIssuing}
              >
                إصدار وتوليد الرمز السري
              </Button>
            </div>
          )
        }
      >
        {!issuedResult ? (
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-[16px] border border-border bg-card/60 text-xs text-secondary space-y-1">
              <div><strong>اسم الطالب:</strong> {currentStudent?.user?.name}</div>
              <div><strong>كود الطالب:</strong> {currentStudent?.student_code}</div>
              <div><strong>المرحلة:</strong> {currentStudent?.grade_level || 'غير محددة'}</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary block mb-1.5">
                تاريخ انتهاء صلاحية الكود (اختياري):
              </label>
              <Input
                type="date"
                value={issueExpiresAt}
                onChange={(e) => setIssueExpiresAt(e.target.value)}
              />
              <p className="text-[11px] text-secondary mt-1">
                اتركه فارغاً ليظل الكود صالحاً طوال العام الدراسي.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Warning banner */}
            <div className="p-3.5 rounded-[16px] border border-amber-500/30 bg-accent/10 text-amber-300 text-xs leading-relaxed flex items-start gap-2">
              <ShieldIcon size={18} className="text-accent shrink-0 mt-0.5" />
              <div>
                <strong>تنبيه أمني هام:</strong> يتم عرض الرمز السري لمرة واحدة فقط! احفظه أو أرسله
                للطالب فوراً حيث يتم تخزينه مشفراً ولا يمكن استرجاعه مرة أخرى.
              </div>
            </div>

            {/* Issued Credentials Display */}
            <div className="p-4 rounded-[16px] border border-border bg-background space-y-3">
              <div>
                <label className="text-xs text-secondary block mb-1">كود الدخول (Credential Code):</label>
                <div className="flex items-center justify-between bg-card p-2.5 rounded-lg border border-border font-mono text-base font-bold text-turquoise">
                  <span>{issuedResult.credential.credential_code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(issuedResult.credential.credential_code, 'كود الدخول')
                    }
                  >
                    نسخ
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs text-secondary block mb-1">الرمز السري (Secret Key):</label>
                <div className="flex items-center justify-between bg-card p-2.5 rounded-lg border border-border font-mono text-sm font-bold text-primary">
                  <span>{issuedResult.plain_text_secret}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(issuedResult.plain_text_secret, 'الرمز السري')
                    }
                  >
                    نسخ
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full mt-2"
              onClick={() => setIsIssueModalOpen(false)}
            >
              تم الحفظ، إغلاق النافذة
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal: Replace Bound Device */}
      <Modal
        isOpen={Boolean(replacingCred)}
        onClose={() => !isReplacing && setReplacingCred(null)}
        title="استبدال الجهاز المقترن بحساب الطالب"
        subtitle="سيتم إلغاء اقتران الجهاز القديم والسماح للطالب بتسجيل الدخول من جهاز جديد."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setReplacingCred(null)}
              disabled={isReplacing}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmReplaceDevice}
              isLoading={isReplacing}
              disabled={!replaceReason.trim()}
            >
              تأكيد الاستبدال وحفظ السبب
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {/* Quick preset chips */}
          <div>
            <label className="text-xs font-semibold text-secondary block mb-2">
              سبب استبدال الجهاز (اختر أو اكتب بالأسفل):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {REPLACEMENT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setReplaceReason(reason)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                    replaceReason === reason
                      ? 'border-indigo-500 bg-turquoise/20 text-indigo-300 font-medium'
                      : 'border-slate-800 bg-card/50 text-secondary hover:border-border hover:text-slate-200'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary block mb-1.5">
              اسم الجهاز الجديد (اختياري، مثلاً: iPad Air 5 - جديد):
            </label>
            <Input
              placeholder="مثال: جهاز الطالب المنزلي الجديد..."
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary block mb-1.5">
              ملاحظة سبب التغيير في سجل التدقيق:
            </label>
            <textarea
              className="w-full h-20 rounded-lg border border-border bg-background px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-turquoise focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              placeholder="اكتب التبرير الفني أو الإداري لتغيير الجهاز..."
              value={replaceReason}
              onChange={(e) => setReplaceReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Revoke Credential */}
      <Modal
        isOpen={Boolean(revokingCred)}
        onClose={() => !isRevoking && setRevokingCred(null)}
        title="تعطيل كود الدخول"
        subtitle="تحذير: لن يتمكن الطالب من تسجيل الدخول باستخدام هذا الكود مجدداً."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setRevokingCred(null)}
              disabled={isRevoking}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmRevoke}
              isLoading={isRevoking}
              disabled={!revokeReason.trim()}
            >
              تأكيد تعطيل الكود
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="p-3.5 rounded-[16px] border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
            أنت على وشك إلغاء صلاحية كود الدخول <strong>{revokingCred?.credential_code}</strong>.
            سيتم حظر الوصول فوراً من أي جهاز مقترن به.
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary block mb-1.5">
              سبب التعطيل (مطلوب لأغراض التدقيق):
            </label>
            <Input
              placeholder="مثال: انتهاء الاشتراك، مخالفة سياسة الاستخدام، إلغاء يدوي..."
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
