'use client';

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconPrefix?: React.ReactNode;
  iconSuffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, iconPrefix, iconSuffix, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-right" dir="rtl">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[var(--ink)]">
            {label}
            {props.required && <span className="text-[var(--red)] mr-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {iconPrefix && (
            <div className="absolute right-3 flex items-center pointer-events-none text-[var(--mut)]">
              {iconPrefix}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`in2 ${iconPrefix ? 'pr-10' : ''} ${iconSuffix ? 'pl-10' : ''} ${
              error ? 'border-[var(--red)] focus:border-[var(--red)]' : ''
            } ${className}`}
            {...props}
          />
          {iconSuffix && (
            <div className="absolute left-3 flex items-center text-[var(--mut)]">
              {iconSuffix}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] font-medium text-[var(--red)] mt-1 flex items-center gap-1">
            <span>⚠</span>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-[var(--mut)] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
