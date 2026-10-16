import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow,
  ...props
}) => {
  return (
    <div
      className={`c ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
