import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  // Map design system variants to mockup classes:
  // .ok (--tq: Saudi Azure/Turquoise)
  // .wn (--x: #B98413 gold/amber)
  // .er (--x: var(--red) Desert Terracotta)
  // .in (--x: var(--pri) Deep Navy / Indigo)
  const variantClassMap = {
    success: 'ok',
    warning: 'wn',
    info: 'ok',
    danger: 'er',
    neutral: 'in',
    purple: 'in',
  };

  return (
    <span className={`ch ${variantClassMap[variant]} ${className}`}>
      {children}
    </span>
  );
};
