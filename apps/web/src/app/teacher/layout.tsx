'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '../../components/layout/navbar';
import {
  BarChartIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  FileTextIcon,
  GraduationCapIcon,
  QrCodeIcon,
  UserIcon,
  VideoIcon,
} from '../../components/icons';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/teacher/dashboard', label: 'لوحة التحكم (Dashboard)', icon: <BarChartIcon size={18} /> },
  { href: '/teacher/courses', label: 'المقررات والدروس (Courses)', icon: <BookOpenIcon size={18} /> },
  { href: '/teacher/meetings', label: 'فصول Google Meet (Live)', icon: <VideoIcon size={18} /> },
  { href: '/teacher/media', label: 'فيديوهات Google Drive (Media)', icon: <FileTextIcon size={18} /> },
  { href: '/teacher/students', label: 'إدارة الطلبة (Students)', icon: <UserIcon size={18} /> },
  { href: '/teacher/attendance', label: 'الحصص والحضور (Attendance)', icon: <CalendarIcon size={18} /> },
  { href: '/teacher/assessments', label: 'التقييمات والدرجات (Assessments)', icon: <CheckCircleIcon size={18} /> },
  { href: '/teacher/payments', label: 'مراجعة المدفوعات (Payments)', icon: <FileTextIcon size={18} /> },
  { href: '/teacher/credentials', label: 'أكواد الدخول والأجهزة (Credentials)', icon: <QrCodeIcon size={18} /> },
  { href: '/teacher/analytics', label: 'التحليلات والمؤشرات (Analytics)', icon: <GraduationCapIcon size={18} /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderNavLinks = (onItemClick?: () => void) => (
    <nav className="mt-2 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm transition-all ${
              isActive
                ? 'bg-white/10 text-white font-semibold'
                : 'text-white/80 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className={isActive ? 'text-white' : 'text-white/70'}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar
        onToggleSidebar={() => setIsMobileMenuOpen((prev) => !prev)}
        isSidebarOpen={isMobileMenuOpen}
      />
      <div className="flex-1 w-full flex md:grid md:grid-cols-[260px_1fr] gap-4 p-4 md:gap-6 md:p-6 max-w-[1600px] mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col justify-between bg-sidebar text-white rounded-[26px] p-4 shadow-xl overflow-hidden self-start sticky top-[80px] h-[calc(100vh-100px)]">
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2 pt-2">
              <div className="w-10 h-10 rounded-[14px] bg-accent text-sidebar flex items-center justify-center font-bold text-lg">
                👨‍🏫
              </div>
              <div>
                <span className="text-sm font-bold block">بوابة المعلم</span>
                <span className="text-xs opacity-70">إدارة التعليم</span>
              </div>
            </div>
            <div className="pt-2">
              {renderNavLinks()}
            </div>
          </div>

          <div className="rounded-[16px] bg-white/5 p-4 text-center mt-4">
            <p className="text-sm font-medium text-white">منصة مدار التعليمية</p>
            <p className="text-xs text-white/70">حساب المعلم والإدارة</p>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden" dir="rtl">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-72 max-w-[80vw] bg-sidebar border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl h-full animate-in slide-in-from-right">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <span className="text-sm font-bold text-white">بوابة المعلم والإدارة</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-white/70 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                {renderNavLinks(() => setIsMobileMenuOpen(false))}
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 min-w-0 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};
