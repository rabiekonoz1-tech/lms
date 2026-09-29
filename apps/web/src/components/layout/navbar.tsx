'use client';

import React from 'react';
import { useTenant } from '../../context/tenant-context';
import { useAuth } from '../../context/auth-context';
import { Badge } from '../ui/badge';
import { GraduationCapIcon, UserIcon, ShieldIcon } from '../icons';

export const Navbar: React.FC = () => {
  const { currentTenant, setTenantSlug, availableTenants } = useTenant();
  const { user, currentRole, switchRole } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-xl">
      {/* Right / Start (RTL): Tenant branding & switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20 text-white font-bold text-lg">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm md:text-base">
                {currentTenant.name}
              </span>
              <Badge variant="success" size="sm">نشط (Active)</Badge>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              tenant: {currentTenant.slug}
            </span>
          </div>
        </div>

        {/* Tenant selector */}
        <select
          value={currentTenant.slug}
          onChange={(e) => setTenantSlug(e.target.value)}
          className="mr-3 hidden md:block rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
        >
          {availableTenants.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.slug}
            </option>
          ))}
        </select>
      </div>

      {/* Middle & Left: Role Persona Switcher & User Profile */}
      <div className="flex items-center gap-4">
        {/* Role Persona Switcher */}
        <div className="hidden sm:flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1">
          <button
            onClick={() => switchRole('student')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-all ${
              currentRole === 'student'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCapIcon size={14} />
            طالب
          </button>
          <button
            onClick={() => switchRole('teacher')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-all ${
              currentRole === 'teacher'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldIcon size={14} />
            معلم / إدارة
          </button>
          <button
            onClick={() => switchRole('parent')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-all ${
              currentRole === 'parent'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon size={14} />
            ولي أمر
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-r border-slate-800 pr-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-emerald-400 font-semibold text-xs border border-emerald-500/20">
            {user.name.slice(0, 2)}
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-xs font-semibold text-slate-200">{user.name}</p>
            <p className="text-[10px] text-slate-400">{user.roles?.[0]?.label || user.type}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
