'use client';

import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'emerald' | 'indigo' | 'amber' | 'purple';
  action?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  variant = 'default',
  action,
}) => {
  const colorMap = {
    default: 'var(--pri)',
    emerald: 'var(--tq)',
    indigo: 'var(--pri)',
    amber: 'var(--acc)',
    purple: 'var(--red)',
  };

  const cssVar = colorMap[variant] || 'var(--acc)';

  return (
    <div 
      className="bg-card border border-border rounded-[16px] p-4 border-s-4 shadow-sm hover:shadow-md transition-shadow"
      style={{ borderInlineStartColor: cssVar }}
      dir="rtl"
    >
      {icon && (
        <span 
          className="w-10 h-10 rounded-[10px] grid place-items-center mb-2"
          style={{ 
            backgroundColor: `color-mix(in srgb, ${cssVar} 15%, transparent)`,
            color: cssVar
          }}
        >
          {icon}
        </span>
      )}
      <div className="text-sm text-secondary font-medium">{title}</div>
      <div className="text-[26px] font-bold text-foreground leading-[1.3] mt-1">{value}</div>
      {trend ? (
        <div 
          className="text-xs mt-1"
          style={{ color: trend.isPositive ? 'var(--tq)' : 'var(--red)' }}
        >
          {trend.isPositive ? '↑' : '↓'} {trend.value}
        </div>
      ) : subtitle ? (
        <div className="text-xs text-secondary mt-1">{subtitle}</div>
      ) : null}
      {action && <div className="mt-3 pt-3 border-t border-border">{action}</div>}
    </div>
  );
};
