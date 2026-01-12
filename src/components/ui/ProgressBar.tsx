'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/design-system/utils';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value */
  max?: number;
  /** Size of the progress bar */
  size?: 'sm' | 'md' | 'lg';
  /** Visual style variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
  /** Animate the progress bar */
  animated?: boolean;
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value,
      max = 100,
      size = 'md',
      variant = 'default',
      showLabel = false,
      label,
      animated = true,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* Label */}
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-2">
            {label && (
              <span className="text-sm text-text-secondary">{label}</span>
            )}
            {showLabel && (
              <span className="text-sm text-text-muted">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        {/* Track */}
        <div
          className={cn(
            'w-full bg-bg-surface rounded-full overflow-hidden',
            size === 'sm' && 'h-1',
            size === 'md' && 'h-2',
            size === 'lg' && 'h-3'
          )}
        >
          {/* Fill */}
          <div
            className={cn(
              'h-full rounded-full',
              animated && 'transition-all duration-500 ease-out',

              // Variant colors
              variant === 'default' && 'bg-brand',
              variant === 'success' && 'bg-status-success',
              variant === 'warning' && 'bg-status-warning',
              variant === 'error' && 'bg-status-error',
              variant === 'gradient' && 'bg-gradient-to-r from-brand to-brand-light'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export { ProgressBar };
