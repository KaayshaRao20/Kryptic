import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-textSecondary">{label}</label>
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-secondary bg-surface px-3 py-2 text-sm text-textPrimary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-textSecondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
