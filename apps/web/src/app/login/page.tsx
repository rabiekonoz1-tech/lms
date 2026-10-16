'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';

interface DemoAccount {
  roleName: string;
  roleBadge: string;
  email: string;
  tenantSlug: string;
  color: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    roleName: 'طالب (Student)',
    roleBadge: 'عمر أحمد',
    email: 'student@almustaqbal.edu',
    tenantSlug: 'almustaqbal',
    color: 'bg-primary/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
  },
  {
    roleName: 'معلم (Teacher)',
    roleBadge: 'د. سارة عبد الله',
    email: 'teacher@almustaqbal.edu',
    tenantSlug: 'almustaqbal',
    color: 'bg-turquoise/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
  },
  {
    roleName: 'ولي أمر (Parent)',
    roleBadge: 'أحمد فاروق',
    email: 'parent@almustaqbal.edu',
    tenantSlug: 'almustaqbal',
    color: 'bg-accent/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  },
  {
    roleName: 'مدير المنصة (Admin)',
    roleBadge: 'Super Admin',
    email: 'admin@almustaqbal.edu',
    tenantSlug: 'almustaqbal',
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
  },
];

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();

  const [email, setEmail]           = useState('student@almustaqbal.edu');
  const [password, setPassword]     = useState('password123');
  const [tenantSlug, setTenantSlug] = useState('almustaqbal');
  const [showPass, setShowPass]     = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const supportToken = searchParams?.get('support_token');
    const slugFromUrl = searchParams?.get('tenant') || tenantSlug;
    if (supportToken) {
      // Auto login with support token
      supportLogin(supportToken, slugFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password, tenantSlug);
  };

  const handleSelectDemo = async (demo: DemoAccount, autoSubmit = false) => {
    setEmail(demo.email);
    setPassword('password123');
    setTenantSlug(demo.tenantSlug);

    if (autoSubmit) {
      await login(demo.email, 'password123', demo.tenantSlug);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-turquoise/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo / Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-primary/20 border border-primary/30 mb-3 shadow-lg shadow-emerald-500/10">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">منصة LMS التعليمية</h1>
          <p className="text-secondary text-xs mt-1">سجّل الدخول إلى حسابك أو اختر حساباً تجريبياً فورياً</p>
        </div>

        {/* Quick Demo Login Grid */}
        <div className="mb-5 bg-card/60 backdrop-blur-md border border-border rounded-[20px] p-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-secondary">⚡ دخول سريع بحساب تجريبي جاهز:</span>
            <span className="text-[10px] text-secondary font-mono">كلمة المرور: password123</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => handleSelectDemo(demo, true)}
                disabled={isLoading}
                className={`flex flex-col text-right p-3 rounded-[16px] border bg-gradient-to-br ${demo.color} hover:brightness-125 transition-all text-xs disabled:opacity-50`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-white text-xs">{demo.roleName}</span>
                  <span className="text-[10px] opacity-80">دخول ↵</span>
                </div>
                <span className="text-[11px] opacity-90 mt-1 font-medium">{demo.roleBadge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-[20px] p-7 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Tenant Slug */}
            <div>
              <label className="block text-xs font-medium text-secondary mb-1" htmlFor="tenant">
                كود المؤسسة / المدرسة (Tenant Slug)
              </label>
              <input
                id="tenant"
                type="text"
                value={tenantSlug}
                onChange={e => setTenantSlug(e.target.value)}
                placeholder="almustaqbal"
                required
                dir="ltr"
                className="w-full bg-card/60 border-border/60 border border border-border/50 text-white placeholder-slate-500 rounded-[16px] px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-secondary mb-1" htmlFor="email">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                dir="ltr"
                className="w-full bg-card/60 border-border/60 border border border-border/50 text-white placeholder-slate-500 rounded-[16px] px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-secondary mb-1" htmlFor="password">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  className="w-full bg-card/60 border-border/60 border border border-border/50 text-white placeholder-slate-500 rounded-[16px] px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all pr-12 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground transition-colors"
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-[16px] px-4 py-3">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-[16px] py-3 px-4 text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جارٍ تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-secondary text-xs mt-6">
          منصة التعليم وإدارة التعلم — جميع الحقوق محفوظة © 2026
        </p>
      </div>
    </div>
  );
}
