'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or error reporting service
    console.error('Next.js Client Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 selection:bg-rose-500 selection:text-white relative overflow-hidden" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-lg w-full text-center space-y-6 bg-card/60 border border-border/80 p-8 md:p-12 rounded-[24px] backdrop-blur-xl shadow-2xl">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-[20px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-2xl shadow-inner">
          ⚠️
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-3">
            حدث خطأ غير متوقع في المعالجة
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            نعتذر، واجه النظام مشكلة أثناء تحميل الصفحة
          </h2>
          <p className="text-xs text-secondary mt-2 leading-relaxed">
            تم تسجيل الخطأ، يمكنك محاولة إعادة تحميل الصفحة أو الرجوع للوحة التحكم.
          </p>
        </div>

        {/* Error Details (if present) */}
        {error?.message && (
          <div className="p-3 bg-background/80 rounded-[16px] border border-border text-right text-[11px] font-mono text-rose-300/80 overflow-x-auto" dir="ltr">
            {error.message}
            {error.digest && <div className="text-secondary text-[10px] mt-1">Digest: {error.digest}</div>}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[16px] bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-medium text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            <span>🔄</span>
            <span>إعادة المحاولة (Try Again)</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[16px] bg-card border-border border hover:bg-background hover:border-border hover:border text-foreground font-medium text-xs border border-border transition-colors"
          >
            <span>🏠</span>
            <span>الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
