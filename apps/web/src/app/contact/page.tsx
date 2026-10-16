'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { CheckCircleIcon } from '../../components/icons';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    message: '',
  });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white py-12 px-6 relative overflow-hidden" dir="rtl">
      <div className="max-w-3xl mx-auto relative z-10 space-y-8">
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

        <div className="text-center space-y-3">
          <Badge variant="success">فريق المبيعات والدعم الفني</Badge>
          <h1 className="text-3xl font-black text-white">نحن هنا للإجابة على استفساراتك</h1>
          <p className="text-xs text-secondary max-w-lg mx-auto">
            أرسل لنا رسالة وسيقوم مستشارنا التعليمي بالتواصل معك خلال ساعات قليلة لتحديد موعد العرض الحي.
          </p>
        </div>

        {!isSent ? (
          <Card className="p-8 bg-card/60 border-border backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">الاسم الكريم *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أ. محمد القحطاني"
                    className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="m.qahtani@school.edu"
                    className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">رقم الجوال / الواتساب</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+966 5X XXX XXXX"
                    className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">اسم المؤسسة التعليمية</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="مدارس المناهج الأهلية"
                    className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">نص الاستفسار أو الرسالة *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="كيف يمكنني ربط المنصة بنظام الفصول الحالية لمدرستي؟"
                  className="w-full bg-background border border-border rounded-[16px] p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-[16px] bg-gradient-to-r bg-primary to-teal-600 hover:bg-primary hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                إرسال الرسالة إلى فريق الدعم ←
              </button>
            </form>
          </Card>
        ) : (
          <Card className="p-8 text-center space-y-4 bg-[color-mix(in_srgb,var(--pri)_15%,transparent)] border-primary/30">
            <div className="h-12 w-12 mx-auto rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <CheckCircleIcon size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">شكراً لتواصلك معنا!</h2>
            <p className="text-xs text-secondary">
              تم استلام رسالتك بنجاح، وسيتواصل معك أحد ممثلينا خلال وقت وجيز.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-2.5 rounded-[16px] bg-card border-border border hover:bg-background hover:border-border hover:border text-white text-xs font-semibold transition-colors"
            >
              العودة للرئيسية
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
