'use client';

import React from 'react';
import {
  BarChartIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  FileTextIcon,
  GraduationCapIcon,
  QrCodeIcon,
  VideoIcon,
} from '../icons';

export type NavigationTab =
  | 'dashboard'
  | 'courses'
  | 'attendance'
  | 'assessments'
  | 'meetings'
  | 'analytics'
  | 'reports'
  | 'credentials';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم (Dashboard)', icon: <BarChartIcon size={18} /> },
    { id: 'courses', label: 'المقررات والدروس (Courses)', icon: <BookOpenIcon size={18} />, badge: '4 نشطة' },
    { id: 'attendance', label: 'الحضور والحصص (Attendance)', icon: <CalendarIcon size={18} /> },
    { id: 'assessments', label: 'الواجبات والاختبارات (Assessments)', icon: <CheckCircleIcon size={18} />, badge: 'مستحق' },
    { id: 'meetings', label: 'الاجتماعات المباشرة (Live Meetings)', icon: <VideoIcon size={18} /> },
    { id: 'analytics', label: 'التحليلات والمؤشرات (Analytics)', icon: <GraduationCapIcon size={18} /> },
    { id: 'reports', label: 'التقارير الأكاديمية (Reports)', icon: <FileTextIcon size={18} /> },
    { id: 'credentials', label: 'الهوية والأجهزة (Credentials)', icon: <QrCodeIcon size={18} /> },
  ];

  return (
    <aside className="w-64 border-l border-slate-800/80 bg-slate-950/60 p-4 flex flex-col justify-between backdrop-blur-xl">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">
            القائمة الرئيسية
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-l from-emerald-600/20 to-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer info */}
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-center">
        <p className="text-[11px] font-medium text-slate-300">منصة LMS التعليمية</p>
        <p className="text-[10px] text-slate-500">الإصدار 1.0.0 (Saudi Core)</p>
      </div>
    </aside>
  );
};
