'use client';

import React, { useEffect } from 'react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    md: 'w-full max-w-md',
    lg: 'w-full max-w-xl',
    xl: 'w-full max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Box */}
      <div className={`relative z-10 ${widthClasses[width]} mr-auto h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-background/60">
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-secondary mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[16px] text-secondary hover:text-white hover:bg-card hover:border-border hover:border transition-colors"
            aria-label="إغلاق اللوحة"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-5 border-t border-border bg-background/60 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
