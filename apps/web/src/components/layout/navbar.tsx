'use client';

import React from 'react';
import { useTenant } from '../../context/tenant-context';
import { useAuth, UserRole } from '../../context/auth-context';
import { Badge } from '../ui/badge';
import { GraduationCapIcon, UserIcon, ShieldIcon, SparklesIcon } from '../icons';

export const Navbar: React.FC<{
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { currentTenant } = useTenant();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex h-[70px] w-full items-center justify-between border-b border-border bg-card px-4 md:px-6">
      {/* Right / Start (RTL): Tenant branding & switcher */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-[16px] text-secondary hover:bg-background transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        )}
        <div className="flex items-center gap-3">
          {currentTenant?.logo_url ? (
            <img
              src={currentTenant.logo_url}
              alt={currentTenant.name}
              className="h-10 w-10 rounded-[12px] object-contain border border-border bg-card p-1 shadow-sm"
            />
          ) : (
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-[12px] font-bold text-lg text-white shadow-sm"
              style={{ backgroundColor: currentTenant?.primary_color || 'var(--primary)' }}
            >
              {currentTenant?.name ? currentTenant.name.charAt(0) : '🎓'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm md:text-base">
                {currentTenant?.name || 'جاري التحميل...'}
              </span>
              {currentTenant && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[color-mix(in_srgb,var(--tq)_15%,transparent)] text-turquoise">
                  نشط
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary font-mono">
                tenant: {currentTenant?.slug || '---'}
              </span>
              {currentTenant?.brand_tagline && (
                <span className="hidden lg:inline text-[11px] text-muted-foreground truncate max-w-[200px]">
                  • {currentTenant.brand_tagline}
                </span>
              )}
            </div>
          </div>
        </div>


      </div>

      {/* Middle & Left: Role Persona Switcher & User Profile */}
      <div className="flex items-center gap-4">
        {/* Logout Button */}
        <button
          onClick={logout}
          className="hidden sm:flex items-center gap-2 rounded-[14px] border border-destructive/20 bg-[color-mix(in_srgb,var(--red)_10%,transparent)] px-4 py-2 text-xs font-bold text-destructive hover:bg-[color-mix(in_srgb,var(--red)_20%,transparent)] transition-all"
        >
          تسجيل الخروج
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-r border-border pr-4">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[12px] bg-[color-mix(in_srgb,var(--acc)_20%,transparent)] text-accent font-semibold text-xs border border-accent/20 shrink-0">
            {user?.name ? user.name.slice(0, 2) : 'ز'}
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-xs font-bold text-foreground leading-tight">{user?.name || 'زائر'}</p>
            <p className="text-[10px] text-secondary">{user?.roles?.[0]?.label || user?.type || 'ضيف'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
