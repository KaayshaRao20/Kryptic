import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          'border-transparent bg-techBlue text-white hover:bg-techBlue/80': variant === 'default',
          'border-transparent bg-healthGreen text-white hover:bg-healthGreen/80': variant === 'success',
          'border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80': variant === 'warning',
          'border-transparent bg-riskRed text-white hover:bg-riskRed/80': variant === 'danger',
          'text-textPrimary border-secondary': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}
