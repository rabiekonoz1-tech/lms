import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-slate-700/80 ${
        glow ? 'shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/10' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
