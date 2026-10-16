'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { Navbar } from './navbar';
import { BarChartIcon, UserIcon, CalendarIcon, AwardIcon, FileTextIcon } from '../icons';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/parent/dashboard', label: 'ملخص الأبناء', icon: <BarChartIcon size={18} /> },
  { href: '/parent/children', label: 'الملف الأكاديمي والدرجات', icon: <AwardIcon size={18} /> },
];

export const ParentNavLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const parentName = user?.name || 'أبو سلطان';

  const renderNavLinks = (onItemClick?: () => void) => (
    <div className="space-y-0.5">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={isActive ? 'on' : ''}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      <Navbar
        onToggleSidebar={() => setIsMobileMenuOpen((prev) => !prev)}
        isSidebarOpen={isMobileMenuOpen}
      />

      <div className="app">
        {/* Desktop Rounded Brand Sidebar with Sadu */}
        <aside className="sd">
          <div className="sadu" />
          <div className="me">
            <span className="av">{parentName.charAt(0)}</span>
            <div>
              <b>{parentName}</b>
              <small>ولي أمر — سلطان وريما</small>
            </div>
          </div>
          {renderNavLinks()}
        </aside>

        {/* Mobile Slide Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden" dir="rtl">
            <div
              className="fixed inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-72 max-w-[80vw] bg-[var(--sb)] text-white p-0 flex flex-col justify-between shadow-2xl h-full animate-in slide-in-from-right overflow-hidden">
              <div>
                <div className="sadu" />
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="av" style={{ width: '32px', height: '32px' }}>
                      {parentName.charAt(0)}
                    </span>
                    <span className="text-xs font-bold">{parentName}</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-white/70 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-2 sd" style={{ position: 'static', borderRadius: 0, boxShadow: 'none' }}>
                  {renderNavLinks(() => setIsMobileMenuOpen(false))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Workspace */}
        <main className="main min-w-0">{children}</main>
      </div>
    </div>
  );
};
