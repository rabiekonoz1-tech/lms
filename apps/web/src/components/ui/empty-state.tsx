'use client';

import React from 'react';
import { Card } from './card';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <Card className={`p-12 text-center flex flex-col items-center justify-center space-y-4 border-dashed border-border bg-background/40 ${className}`} dir="rtl">
      <div className="h-14 w-14 rounded-[20px] bg-card border border-border flex items-center justify-center text-2xl text-secondary">
        {icon || '📭'}
      </div>
      <div className="max-w-md">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <p className="text-xs text-secondary mt-1 leading-relaxed">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-[16px] bg-primary hover:bg-primary text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
        >
          {action.label}
        </button>
      )}
    </Card>
  );
};
