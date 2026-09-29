'use client';

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  CheckCircleIcon,
  QrCodeIcon,
  RefreshCwIcon,
  ShieldIcon,
} from '../icons';

export const CredentialsHub: React.FC = () => {
  const [deviceReplaced, setDeviceReplaced] = useState(false);

  const simulateDeviceReplace = () => {
    setDeviceReplaced(true);
    setTimeout(() => setDeviceReplaced(false), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <QrCodeIcon size={24} className="text-emerald-400" />
            الهوية الرقمية والتحكم بالأجهزة (Credentials & Devices)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            إدارة بيانات الاعتماد المشفرة (M8 Invariant: Secret Hashed) وتطبيق سياسة الجهاز الواحد والتبديل المعتمد إدارياً.
          </p>
        </div>
        <Badge variant="success" size="md">حالة الهوية: نشطة ومقترنة بجهاز</Badge>
      </div>

      {deviceReplaced && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircleIcon size={20} className="text-emerald-400" />
            <div>
              <p className="text-sm font-bold">تم اعتماد استبدال الجهاز وتحديث سجل التدقيق (Audit Log)!</p>
              <p className="text-xs text-emerald-400/80">تم فك ارتباط الجهاز السابق وإلزام الجهاز الجديد بالربط المشفر.</p>
            </div>
          </div>
          <Badge variant="success">Device Replaced</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Virtual ID Card */}
        <Card className="flex flex-col justify-between border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950/20 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 tracking-wider">بطاقة الطالب الرقمية</span>
              <Badge variant="success" size="sm">ACTIVE</Badge>
            </div>

            <div className="flex justify-center py-4">
              <div className="h-44 w-44 rounded-2xl border-2 border-emerald-500/40 bg-white p-3 flex flex-col items-center justify-center shadow-lg">
                <QrCodeIcon size={140} className="text-slate-950" />
                <span className="text-[10px] font-mono text-slate-700 font-bold mt-1">CRD-2026-9941</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">عمر الأحمد</h3>
              <p className="text-xs text-slate-400 font-mono">الكود: STU-2026-001</p>
              <p className="text-xs text-emerald-400">أكاديمية المستقبل التعليمية</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
            السر مشفر ومحمي بـ SHA-256 ولا يمكن استرجاعه
          </div>
        </Card>

        {/* Right 2 Cols: Device Security & Policies */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldIcon size={18} className="text-emerald-400" />
                الجهاز المرتبط حالياً (Active Hardware Binding)
              </h3>
              <Badge variant="info">جهاز معتمد 1 / 1</Badge>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">معرف الجهاز (Device ID):</span>
                  <p className="font-mono text-slate-200 mt-0.5">DEV-WIN-CHROME-9281</p>
                </div>
                <div>
                  <span className="text-slate-400">بصمة الجهاز (Fingerprint):</span>
                  <p className="font-mono text-slate-200 mt-0.5">a8f9c1...3b7e (SHA-256)</p>
                </div>
                <div>
                  <span className="text-slate-400">نظام التشغيل والمتصفح:</span>
                  <p className="text-slate-200 mt-0.5">Windows 11 / Chrome 129</p>
                </div>
                <div>
                  <span className="text-slate-400">تاريخ الربط:</span>
                  <p className="text-slate-200 mt-0.5">25 سبتمبر 2026 (نشط)</p>
                </div>
              </div>
            </div>

            {/* Invariant Info */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-300/90 flex items-start gap-2.5">
              <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
              <div>
                <p className="font-bold text-amber-300">سياسة الجهاز الواحد (Second Device Policy):</p>
                <p className="mt-0.5 leading-relaxed">
                  تمنع المنصة فتح الحساب أو استخدام بطاقة الهوية على جهاز ثانٍ في وقت واحد. محاولة الدخول من جهاز آخر ترفض برمز <code className="bg-black/30 px-1 py-0.5 rounded text-[10px]">403 SECOND_DEVICE_PROHIBITED</code>.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={simulateDeviceReplace}>
                <RefreshCwIcon size={14} />
                طلب استبدال الجهاز المعتمد (إدارياً)
              </Button>
            </div>
          </Card>

          {/* Audit Log */}
          <Card className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300">سجل تدقيق الأجهزة (Device Change Audit Trail)</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-slate-400">
                <span>ربط الجهاز الأولي بنجاح</span>
                <span className="font-mono text-slate-500 text-[11px]">25 سبتمبر 2026</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-slate-400">
                <span>تأكيد البصمة الرقمية من الخادم</span>
                <span className="font-mono text-slate-500 text-[11px]">25 سبتمبر 2026</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
