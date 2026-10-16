'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { CheckCircleIcon, ShieldIcon } from '../../components/icons';

export default function RegisterSchoolPage() {
  const [formData, setFormData] = useState({
    institutionName: '',
    slug: '',
    institutionType: 'مدرسة خاصة / دولية',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    plan: 'professional',
    estimatedStudents: '100-500',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institutionName || !formData.slug || !formData.adminEmail || !formData.password) {
      alert('يرجى ملء جميع الحقول الإلزامية (*)');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white py-12 px-6 relative overflow-hidden" dir="rtl">
      {/* Background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Navigation back */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-secondary hover:text-white transition-colors">
            <span>←</span>
            <span>العودة للرئيسية</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <span className="font-bold text-white text-sm">منصة LMS التعليمية</span>
          </div>
        </div>

        {!isSuccess ? (
          <Card className="p-8 md:p-10 border-border bg-card/60 backdrop-blur-xl shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="h-12 w-12 rounded-[20px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3 shadow-inner">
                <ShieldIcon size={24} />
              </div>
              <h1 className="text-2xl font-black text-white">تسجيل وتأسيس مؤسسة تعليمية جديدة</h1>
              <p className="text-xs text-secondary mt-1.5 leading-relaxed">
                أنشئ بيئتك السحابية المعزولة لمدرستك أو مركزك التعليمي خلال دقيقتين مع تجربة مجانية لكافة الميزات.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Institution Info */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                  1. معلومات المؤسسة والنطاق
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5">
                      اسم المؤسسة أو المركز التعليمي *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: أكاديمية النخبة للغات"
                      value={formData.institutionName}
                      onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                      className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5">
                      معرف النطاق الفريد (Slug - إنجليزي فقط) *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: el-nokhba"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
                        })
                      }
                      className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-primary font-mono placeholder-slate-600 focus:outline-none focus:border-primary"
                      required
                    />
                    <span className="text-[10px] text-secondary block mt-1">
                      رابطكم سيكون: {formData.slug || 'slug'}.lms.edu.sa
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5">
                      نوع المؤسسة
                    </label>
                    <select
                      value={formData.institutionType}
                      onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                      className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    >
                      <option value="مدرسة خاصة / دولية">مدرسة خاصة / دولية</option>
                      <option value="مركز تدريب / دروس تقوية">مركز تدريب / دروس تقوية</option>
                      <option value="معهد لغات وعلوم">معهد لغات وعلوم</option>
                      <option value="أكاديمية تدريب مهني">أكاديمية تدريب مهني</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5">
                      العدد التقديري للطلاب
                    </label>
                    <select
                      value={formData.estimatedStudents}
                      onChange={(e) => setFormData({ ...formData, estimatedStudents: e.target.value })}
                      className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    >
                      <option value="أقل من 100">أقل من 100 طالب</option>
                      <option value="100-500">100 - 500 طالب</option>
                      <option value="500-2000">500 - 2,000 طالب</option>
                      <option value="أكثر من 2000">+2,000 طالب</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Administrator Profile */}
              <div className="space-y-4 pt-4 border-t border-border">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                  2. بيانات المدير المسؤول (Super User)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5">
                      الاسم الكامل للمسؤول *
                    </label>
                    <input
                      type="text"
                      placeholder="د. أحمد المحمدي"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5">
                      البريد الإلكتروني للإدارة *
                    </label>
                    <input
                      type="email"
                      placeholder="admin@institution.edu"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary font-mono"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5">
                      رقم الجوال
                    </label>
                    <input
                      type="tel"
                      placeholder="+966 50 123 4567"
                      value={formData.adminPhone}
                      onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                      className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5">
                      كلمة مرور الحساب الإداري *
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-[20px] bg-gradient-to-r bg-primary to-teal-600 hover:bg-primary hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>جارٍ تهيئة بيئة المؤسسة وقاعدة البيانات المعزولة...</span>
                    </>
                  ) : (
                    <span>تأكيد التسجيل وتأسيس المنصة فوراً (Get Started) ←</span>
                  )}
                </button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-8 md:p-12 border-primary/30 bg-[color-mix(in_srgb,var(--pri)_15%,transparent)] backdrop-blur-xl text-center space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <CheckCircleIcon size={32} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">مبروك! تم تأسيس بيئة مؤسستك بنجاح</h2>
              <p className="text-xs text-secondary mt-2">
                تم إنشاء قاعدة البيانات المعزولة بنجاح وحساب المدير التنفيذي الخاص بك.
              </p>
            </div>

            <div className="p-4 bg-background/80 rounded-[20px] border border-border text-right text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-border/80">
                <span className="text-secondary">المؤسسة:</span>
                <span className="text-white font-semibold">{formData.institutionName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/80">
                <span className="text-secondary">المعرف (Slug):</span>
                <span className="text-primary font-mono font-bold">{formData.slug}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/80">
                <span className="text-secondary">البريد الإلكتروني للإدارة:</span>
                <span className="text-white font-mono" dir="ltr">{formData.adminEmail}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-secondary">رابط البوابة:</span>
                <span className="text-teal-400 font-mono" dir="ltr">http://localhost:3000/login</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-[16px] bg-primary hover:bg-primary text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
              >
                <span>الانتقال لتسجيل الدخول</span>
                <span>←</span>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
