'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { billingApi, PaymentRequestItem } from '../../../lib/billing-api';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Modal } from '../../../components/ui/modal';
import { Drawer } from '../../../components/ui/drawer';
import { Tabs } from '../../../components/ui/tabs';
import { StatCard } from '../../../components/ui/stat-card';
import { EmptyState } from '../../../components/ui/empty-state';
import { SkeletonTable } from '../../../components/ui/skeleton';
import {
  FileTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  SearchIcon,
  ArrowRightIcon,
} from '../../../components/icons';

// Quick rejection reason chips
const REJECTION_PRESETS = [
  'إيصال التحويل غير واضح أو غير مقروء',
  'المبلغ المحول غير مطابق لسعر الباقة المحددة',
  'الرقم المرجعي مكرر أو غير موجود بكشف الحساب البنكي',
  'اسم المحول غير متطابق مع بيانات الطالب المسجلة',
  'صورة الإيصال منتهية الصلاحية أو قديمة',
];

export default function TeacherPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // Inspection Drawer State
  const [inspectingPayment, setInspectingPayment] = useState<PaymentRequestItem | null>(null);

  // Approval Modal State
  const [approvingPayment, setApprovingPayment] = useState<PaymentRequestItem | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Rejection Modal State
  const [rejectingPayment, setRejectingPayment] = useState<PaymentRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Toast / Banner feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPayments = async () => {
    try {
      const data = await billingApi.getPaymentRequests();
      setPayments(data);
    } catch {
      setFeedback({ type: 'error', text: 'فشل في تحميل طلبات الدفع من الخادم.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;

      // Method filter
      if (methodFilter !== 'all' && p.payment_method !== methodFilter) return false;

      // Search query (Student name, reference code, phone, package name)
      if (search.trim()) {
        const q = search.toLowerCase();
        const studentName = p.student?.user?.name?.toLowerCase() || '';
        const refCode = p.reference_code?.toLowerCase() || '';
        const phone = p.sender_phone?.toLowerCase() || '';
        const pkgName = p.package?.name?.toLowerCase() || '';
        const id = p.id.toLowerCase();
        if (
          !studentName.includes(q) &&
          !refCode.includes(q) &&
          !phone.includes(q) &&
          !pkgName.includes(q) &&
          !id.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [payments, statusFilter, methodFilter, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = payments.length;
    const pending = payments.filter((p) => p.status === 'pending').length;
    const approved = payments.filter((p) => p.status === 'approved').length;
    const rejected = payments.filter((p) => p.status === 'rejected').length;
    const totalRevenue = payments
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return { total, pending, approved, rejected, totalRevenue };
  }, [payments]);

  // Execute Approval
  const confirmApprove = async () => {
    if (!approvingPayment) return;
    try {
      setIsApproving(true);
      await billingApi.approvePayment(approvingPayment.id);
      setFeedback({
        type: 'success',
        text: `تم اعتماد التحويل وتفعيل باقة "${approvingPayment.package?.name ?? 'الاشتراك'}" للطالب بنجاح!`,
      });
      setApprovingPayment(null);
      if (inspectingPayment?.id === approvingPayment.id) {
        setInspectingPayment(null);
      }
      loadPayments();
    } catch {
      setFeedback({ type: 'error', text: 'حدث خطأ أثناء اعتماد التحويل البنكي.' });
    } finally {
      setIsApproving(false);
    }
  };

  // Execute Rejection
  const confirmReject = async () => {
    if (!rejectingPayment) return;
    if (!rejectionReason.trim()) {
      setFeedback({ type: 'error', text: 'يرجى كتابة أو اختيار سبب الرفض.' });
      return;
    }
    try {
      setIsRejecting(true);
      await billingApi.rejectPayment(rejectingPayment.id, rejectionReason.trim());
      setFeedback({
        type: 'success',
        text: 'تم رفض طلب الدفع وتسجيل السبب وإشعار الطالب.',
      });
      setRejectingPayment(null);
      setRejectionReason('');
      if (inspectingPayment?.id === rejectingPayment.id) {
        setInspectingPayment(null);
      }
      loadPayments();
    } catch {
      setFeedback({ type: 'error', text: 'حدث خطأ أثناء رفض الطلب.' });
    } finally {
      setIsRejecting(false);
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'حوالة بنكية';
      case 'instapay':
        return 'InstaPay';
      case 'cash':
        return 'نقداً بالسنتر';
      default:
        return method || 'تحويل بنكي';
    }
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">معتمد ومفعّل</Badge>;
      case 'rejected':
        return <Badge variant="danger">مرفوض</Badge>;
      case 'pending':
      default:
        return <Badge variant="warning">بانتظار المراجعة</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileTextIcon size={26} className="text-turquoise" />
            مراجعة المدفوعات والاشتراكات
          </h1>
          <p className="text-sm text-secondary mt-1">
            تدقيق إيصالات التحويل البنكي وتأكيد السداد وتفعيل الباقات التعليمية للطلبة وفق حوكمة صارمة.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={loadPayments} disabled={loading} size="sm">
            تحديث البيانات
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

      {/* High-Density Metric Workspace Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="طلبات بانتظار التدقيق"
          value={stats.pending}
          subtitle="تحويلات تحتاج تدقيق وإفراج"
          icon={<FileTextIcon size={20} />}
          variant={stats.pending > 0 ? 'amber' : 'default'}
        />
        <StatCard
          title="إجمالي المقبولة"
          value={stats.approved}
          subtitle="اشتراكات تم تفعيلها"
          icon={<CheckCircleIcon size={20} />}
          variant="emerald"
        />
        <StatCard
          title="إجمالي المرفوضة"
          value={stats.rejected}
          subtitle="إيصالات تم رفضها لعدم المطابقة"
          icon={<XCircleIcon size={20} />}
          variant={stats.rejected > 0 ? 'amber' : 'default'}
        />
        <StatCard
          title="إجمالي الإيرادات المعتمدة"
          value={`${stats.totalRevenue.toLocaleString()} ر.س`}
          subtitle="قيمة الباقات المعتمدة فعلياً"
          icon={<FileTextIcon size={20} />}
          variant="indigo"
        />
      </div>

      {/* Filter and Workflow Bar */}
      <Card className="p-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-3">
          <Tabs
            tabs={[
              { id: 'all', label: 'كافة المعاملات', badge: stats.total },
              { id: 'pending', label: 'بانتظار المراجعة', badge: stats.pending },
              { id: 'approved', label: 'المعتمدة', badge: stats.approved },
              { id: 'rejected', label: 'المرفوضة', badge: stats.rejected },
            ]}
            activeTab={statusFilter}
            onChange={(id) => setStatusFilter(id as typeof statusFilter)}
            variant="pill"
          />

          <div className="w-48">
            <Select
              options={[
                { value: 'all', label: 'جميع وسائل السداد' },
                { value: 'bank_transfer', label: 'حوالة بنكية' },
                { value: 'instapay', label: 'InstaPay' },
                { value: 'cash', label: 'نقداً بالمركز' },
              ]}
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="بحث باسم الطالب، الرقم المرجعي، أو رقم هاتف المحول..."
              iconPrefix={<SearchIcon size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => setSearch('')}>
              مسح البحث
            </Button>
          )}
        </div>
      </Card>

      {/* Main Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={5} cols={6} />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="لا توجد طلبات سداد مطابقة"
              description="لم يتم العثور على أي طلبات دفع وفق معايير التصفية والبحث المحددة."
              action={
                search || statusFilter !== 'all'
                  ? {
                      label: 'إعادة ضبط الفلاتر',
                      onClick: () => {
                        setSearch('');
                        setStatusFilter('all');
                        setMethodFilter('all');
                      },
                    }
                  : undefined
              }
            />
          </div>
        ) : (

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-card/60 border-b border-border text-secondary">
                <tr>
                  <th className="py-3 px-4 font-semibold">المعاملة / التاريخ</th>
                  <th className="py-3 px-4 font-semibold">الطالب</th>
                  <th className="py-3 px-4 font-semibold">الباقة المطلوب تفعيلها</th>
                  <th className="py-3 px-4 font-semibold">وسيلة الدفع / المرجع</th>
                  <th className="py-3 px-4 font-semibold">المبلغ</th>
                  <th className="py-3 px-4 font-semibold">الحالة</th>
                  <th className="py-3 px-4 font-semibold text-center">إجراءات التدقيق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPayments.map((p) => {
                  const studentName = p.student?.user?.name || 'طالب مسجل';
                  const packageName = p.package?.name || 'باقة اشتراك';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-card/40 transition-colors group cursor-pointer"
                      onClick={() => setInspectingPayment(p)}
                    >
                      {/* ID & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[11px] text-turquoise font-semibold">
                          #{p.id.slice(0, 8)}
                        </div>
                        <div className="text-[10px] text-secondary mt-0.5">
                          {p.submitted_at
                            ? new Date(p.submitted_at).toLocaleDateString('ar-EG', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'منذ قليل'}
                        </div>
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {studentName}
                        </div>
                        <div className="text-[10px] text-secondary font-mono mt-0.5">
                          {p.student?.user?.phone || p.sender_phone || 'لا يوجد هاتف مسجل'}
                        </div>
                      </td>

                      {/* Package */}
                      <td className="py-3.5 px-4">
                        <div className="text-foreground font-medium">{packageName}</div>
                        {p.package?.code && (
                          <div className="text-[10px] text-secondary font-mono">
                            كود: {p.package.code}
                          </div>
                        )}
                      </td>

                      {/* Payment Method & Ref */}
                      <td className="py-3.5 px-4">
                        <div className="text-secondary font-medium">
                          {getMethodLabel(p.payment_method)}
                        </div>
                        <div className="text-[10px] text-secondary font-mono mt-0.5">
                          {p.reference_code ? `مرجع: ${p.reference_code}` : 'بدون رقم مرجعي'}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sm text-primary font-mono">
                          {p.amount} {p.currency || 'ر.س'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setInspectingPayment(p)}
                            title="معاينة تفاصيل المعاملة والإيصال"
                          >
                            معاينة
                          </Button>

                          {p.status === 'pending' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setApprovingPayment(p)}
                                title="اعتماد التحويل وتفعيل الباقة"
                              >
                                اعتماد
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setRejectingPayment(p);
                                  setRejectionReason('');
                                }}
                                title="رفض الحوالة لعدم المطابقة"
                              >
                                رفض
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Drawer: Detailed Inspection Workspace */}
      <Drawer
        isOpen={Boolean(inspectingPayment)}
        onClose={() => setInspectingPayment(null)}
        title="تفاصيل المعاملة البنكية والتحقق"
        subtitle={
          inspectingPayment
            ? `معاملة رقم #${inspectingPayment.id.slice(0, 12)} — ${inspectingPayment.package?.name ?? 'باقة الاشتراك'}`
            : ''
        }
        width="lg"
      >
        {inspectingPayment && (
          <div className="space-y-6">
            {/* Status & Highlights */}
            <div className="p-4 rounded-[16px] border border-border bg-card/60 flex items-center justify-between">
              <div>
                <div className="text-xs text-secondary">حالة السداد الحالية</div>
                <div className="mt-1">{getStatusBadge(inspectingPayment.status)}</div>
              </div>
              <div className="text-left">
                <div className="text-xs text-secondary">المبلغ المطلوب تدقيقه</div>
                <div className="text-xl font-bold text-primary font-mono mt-0.5">
                  {inspectingPayment.amount} {inspectingPayment.currency || 'ر.س'}
                </div>
              </div>
            </div>

            {/* Student & Package Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-[16px] border border-border bg-card/40 space-y-2">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">
                  بيانات الطالب
                </h4>
                <div className="text-sm font-semibold text-white">
                  {inspectingPayment.student?.user?.name || 'طالب مسجل'}
                </div>
                <div className="text-xs text-secondary">
                  البريد: {inspectingPayment.student?.user?.email || 'غير مسجل'}
                </div>
                <div className="text-xs text-secondary">
                  الهاتف: {inspectingPayment.student?.user?.phone || inspectingPayment.sender_phone || 'غير مسجل'}
                </div>
              </div>

              <div className="p-4 rounded-[16px] border border-border bg-card/40 space-y-2">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">
                  تفاصيل الباقة والمحتوى
                </h4>
                <div className="text-sm font-semibold text-white">
                  {inspectingPayment.package?.name || 'باقة اشتراك شهري'}
                </div>
                <div className="text-xs text-secondary font-mono">
                  كود الباقة: {inspectingPayment.package?.code || 'PKG-BASIC'}
                </div>
                <div className="text-xs text-turquoise">
                  الاشتراك يمنح صلاحية الوصول لجميع الدروس والامتحانات المشمولة
                </div>
              </div>
            </div>

            {/* Transfer & Proof Information */}
            <div className="p-4 rounded-[16px] border border-border bg-card/40 space-y-3">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">
                بيانات إيصال التحويل البنكي
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-secondary">وسيلة التحويل:</span>{' '}
                  <span className="text-white font-medium">
                    {getMethodLabel(inspectingPayment.payment_method)}
                  </span>
                </div>
                <div>
                  <span className="text-secondary">رقم المرجع البنكي:</span>{' '}
                  <span className="text-white font-mono font-medium">
                    {inspectingPayment.reference_code || 'غير متوفر'}
                  </span>
                </div>
                <div>
                  <span className="text-secondary">رقم هاتف المحول:</span>{' '}
                  <span className="text-white font-mono">
                    {inspectingPayment.sender_phone || 'غير مسجل'}
                  </span>
                </div>
                <div>
                  <span className="text-secondary">تاريخ الإرسال:</span>{' '}
                  <span className="text-white">
                    {inspectingPayment.submitted_at
                      ? new Date(inspectingPayment.submitted_at).toLocaleString('ar-EG')
                      : 'منذ قليل'}
                  </span>
                </div>
              </div>

              {/* Receipt Preview Box */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="text-xs text-secondary mb-2">مستند الإيصال المرفق:</div>
                {inspectingPayment.proof_url ? (
                  <div className="rounded-lg overflow-hidden border border-border bg-background p-2">
                    <img
                      src={inspectingPayment.proof_url}
                      alt="إيصال التحويل"
                      className="max-h-64 mx-auto object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="p-6 rounded-lg border border-dashed border-border bg-background/60 text-center">
                    <FileTextIcon size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-secondary">
                      لم يقم الطالب بإرفاق صورة ضوئية للإيصال (تم الاعتماد على الرقم المرجعي البنكي).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Note (if rejected) */}
            {inspectingPayment.status === 'rejected' && inspectingPayment.rejection_reason && (
              <div className="p-4 rounded-[16px] border border-red-500/30 bg-red-500/10 space-y-1">
                <div className="text-xs font-bold text-red-400">سبب الرفض المسجل:</div>
                <div className="text-xs text-red-200">{inspectingPayment.rejection_reason}</div>
                {inspectingPayment.reviewed_at && (
                  <div className="text-[10px] text-red-400/80 mt-1">
                    تم الرفض في: {new Date(inspectingPayment.reviewed_at).toLocaleString('ar-EG')}
                  </div>
                )}
              </div>
            )}

            {/* Reviewer Note (if approved) */}
            {inspectingPayment.status === 'approved' && inspectingPayment.reviewer && (
              <div className="p-4 rounded-[16px] border border-primary/30 bg-primary/10 space-y-1">
                <div className="text-xs font-bold text-primary">بيانات الاعتماد:</div>
                <div className="text-xs text-emerald-200">
                  تم اعتماد التحويل وتفعيل الاشتراك بواسطة: {inspectingPayment.reviewer.name || 'المعلم'}
                </div>
              </div>
            )}

            {/* Action Buttons in Drawer */}
            {inspectingPayment.status === 'pending' && (
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => setApprovingPayment(inspectingPayment)}
                >
                  اعتماد وتفعيل الاشتراك
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    setRejectingPayment(inspectingPayment);
                    setRejectionReason('');
                  }}
                >
                  رفض الحوالة
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Modal: Confirmation for Approval */}
      <Modal
        isOpen={Boolean(approvingPayment)}
        onClose={() => {
          if (!isApproving) setApprovingPayment(null);
        }}
        title="تأكيد اعتماد التحويل وتفعيل الباقة"
        subtitle="سيتم ترقية حساب الطالب وتفعيل كافة الصلاحيات المرتبطة بالباقة فوراً."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setApprovingPayment(null)}
              disabled={isApproving}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={confirmApprove}
              isLoading={isApproving}
            >
              تأكيد الاعتماد وتفعيل الباقة
            </Button>
          </div>
        }
      >
        {approvingPayment && (
          <div className="space-y-4 py-2 text-sm text-secondary">
            <div className="p-3.5 rounded-lg border border-border bg-card/60 space-y-2">
              <div className="flex justify-between">
                <span className="text-secondary">الطالب:</span>
                <span className="text-white font-semibold">
                  {approvingPayment.student?.user?.name || 'طالب مسجل'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">الباقة:</span>
                <span className="text-indigo-300 font-semibold">
                  {approvingPayment.package?.name || 'باقة الاشتراك'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">المبلغ المدفوع:</span>
                <span className="text-primary font-bold font-mono">
                  {approvingPayment.amount} {approvingPayment.currency || 'ر.س'}
                </span>
              </div>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              وفقاً لقواعد النظام، عند الضغط على تأكيد:
              <br />
              1. سيتم تحديث حالة المعاملة إلى <span className="text-primary font-semibold">معتمدة</span>.
              <br />
              2. سيتم إنشاء سجل اشتراك نشط (Subscription) للطالب.
              <br />
              3. سيتم منح الصلاحيات (Entitlements) المحددة في الباقة تلقائياً دون أي تأخير.
            </p>
          </div>
        )}
      </Modal>

      {/* Modal: Rejection Reason Selection & Input */}
      <Modal
        isOpen={Boolean(rejectingPayment)}
        onClose={() => {
          if (!isRejecting) setRejectingPayment(null);
        }}
        title="رفض طلب التحويل البنكي"
        subtitle="يرجى تحديد سبب الرفض بدقة لإشعار الطالب وتمكينه من تصحيح الإيصال."
        size="md"

        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setRejectingPayment(null)}
              disabled={isRejecting}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={confirmReject}
              isLoading={isRejecting}
              disabled={!rejectionReason.trim()}
            >
              تأكيد رفض الطلب
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {/* Quick presets */}
          <div>
            <label className="text-xs font-semibold text-secondary block mb-2">
              أسباب الرفض الشائعة (اضغط للاختيار السريع):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {REJECTION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRejectionReason(preset)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                    rejectionReason === preset
                      ? 'border-indigo-500 bg-turquoise/20 text-indigo-300 font-medium'
                      : 'border-slate-800 bg-card/50 text-secondary hover:border-border hover:text-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason Textarea */}
          <div>
            <label className="text-xs font-semibold text-secondary block mb-1.5">
              نص سبب الرفض (يظهر للطالب):
            </label>
            <textarea
              className="w-full h-24 rounded-lg border border-border bg-background px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-turquoise focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              placeholder="اكتب سبب رفض التحويل بالتفصيل..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
