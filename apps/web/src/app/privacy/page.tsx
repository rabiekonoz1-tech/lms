'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '../../components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white py-12 px-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-secondary hover:text-white transition-colors">
            <span>←</span>
            <span>العودة للرئيسية</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <span className="font-bold text-white text-sm">منصة LMS التعليمية</span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black text-white">سياسة الخصوصية وسرية البيانات</h1>
          <p className="text-xs text-secondary mt-2">آخر تحديث: سبتمبر 2026</p>
        </div>

        <Card className="p-8 bg-card/60 border-border space-y-6 text-xs text-secondary leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white">1. مبدأ عزل البيانات (Database Isolation)</h2>
            <p>
              تعتمد المنصة معمارية عزل قواعد البيانات متعددة المستأجرين (Multi-Tenancy) حيث تتم معالجة وحفظ بيانات كل مدرسة في قاعدة بيانات منفصلة تماماً تمنع أي إمكانية للوصول غير المصرح به عبر المؤسسات.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white">2. البيانات المجمعة وأغراض استخدامها</h2>
            <p>
              نجمع البيانات الأساسية الضرورية لتشغيل العملية التعليمية (الاسم، البريد الإلكتروني، الحضور، الدرجات الأكاديمية، وسجلات الدخول) ولا يتم استخدام هذه البيانات لأي أغراض إعلانية خارجية.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white">3. التشفير والأمان السحابي</h2>
            <p>
              تُشفر جميع الاتصالات باستخدام بروتوكول TLS 1.3 مع تشفير أسرار الدخول والـ Tokens بخوارزميات SHA-256 و Hashing غير قابلة للعكس.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
