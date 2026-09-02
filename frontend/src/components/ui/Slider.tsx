import React from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  valueDisplay?: string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueDisplay, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-textSecondary">{label}</label>
          {valueDisplay && <span className="text-sm font-mono text-textPrimary">{valueDisplay}</span>}
        </div>
        <input
          type="range"
          ref={ref}
          className={cn(
            "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-techBlue",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";
