'use client';

import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-right" dir="rtl">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-secondary">
            {label}
            {props.required && <span className="text-rose-400 mr-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none rounded-[16px] border bg-card/80 px-3.5 py-2.5 text-xs text-white transition-all focus:outline-none focus:ring-1 ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-slate-800 focus:border-primary focus:ring-emerald-500/30 hover:border-slate-700'
            } disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-card text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-xs">
            ▼
          </div>
        </div>
        {error ? (
          <p className="text-[11px] font-medium text-rose-400 mt-1 flex items-center gap-1">
            <span>⚠</span>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-secondary mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
