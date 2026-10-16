import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 selection:bg-primary selection:text-white relative overflow-hidden" dir="rtl">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-lg w-full text-center space-y-8 bg-card/60 border border-border/80 p-8 md:p-12 rounded-[24px] backdrop-blur-xl shadow-2xl">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span>خطأ 404 - صفحة غير متوفرة</span>
        </div>

        {/* 404 Graphic / Number */}
        <div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r bg-primary via-teal-300 to-sky-400">
            404
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-4">
            لم نتمكن من العثور على الصفحة المطلوبة
          </h2>
          <p className="text-sm text-secondary mt-2 leading-relaxed">
            الصفحة التي تحاول الوصول إليها قد تكون حُذفت، نُقلت إلى مسار آخر، أو قد لا تملك صلاحية الوصول إليها ضمن نطاق مؤسستك الحالية.
          </p>
        </div>

        {/* Quick Links */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[16px] bg-gradient-to-r bg-primary to-teal-600 hover:bg-primary hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <span>🏠</span>
            <span>العودة للصفحة الرئيسية</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[16px] bg-card border-border border hover:bg-background hover:border-border hover:border text-foreground font-medium text-xs border border-border transition-colors"
          >
            <span>🔑</span>
            <span>تسجيل الدخول</span>
          </Link>
        </div>

        {/* Support note */}
        <div className="pt-6 border-t border-border/80 text-[11px] text-secondary">
          منصة LMS التعليمية متعددة المؤسسات — جميع الحقوق محفوظة
        </div>
      </div>
    </div>
  );
}
