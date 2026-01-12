'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/design-system/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual style variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand';
  /** Size of the badge */
  size?: 'sm' | 'md';
  /** Show dot indicator */
  dot?: boolean;
  /** Make badge pill-shaped */
  pill?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      dot = false,
      pill = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center gap-1.5 font-medium',
          'transition-colors duration-200',

          // Size styles
          size === 'sm' && 'text-[10px] px-1.5 py-0.5',
          size === 'md' && 'text-xs px-2 py-1',

          // Border radius
          pill ? 'rounded-full' : 'rounded-sm',

          // Variant styles
          variant === 'default' && [
            'bg-bg-surface text-text-secondary border border-border',
          ],
          variant === 'success' && [
            'bg-status-successMuted text-status-success',
          ],
          variant === 'warning' && [
            'bg-status-warningMuted text-status-warning',
          ],
          variant === 'error' && [
            'bg-status-errorMuted text-status-error',
          ],
          variant === 'info' && [
            'bg-status-infoMuted text-status-info',
          ],
          variant === 'brand' && [
            'bg-brand-muted text-brand',
          ],

          className
        )}
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              variant === 'default' && 'bg-text-muted',
              variant === 'success' && 'bg-status-success',
              variant === 'warning' && 'bg-status-warning',
              variant === 'error' && 'bg-status-error',
              variant === 'info' && 'bg-status-info',
              variant === 'brand' && 'bg-brand'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
