'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/design-system/utils';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Size of the avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Fallback text (initials) when no image */
  fallback?: string;
  /** Show online status indicator */
  status?: 'online' | 'offline' | 'away';
  /** Apply gradient background to fallback */
  gradient?: boolean;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      size = 'md',
      src,
      alt,
      fallback,
      status,
      gradient = false,
      ...props
    },
    ref
  ) => {
    // Get initials from fallback
    const initials = fallback
      ? fallback
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '?';

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full overflow-hidden',
          'font-semibold text-white',

          // Size styles
          size === 'xs' && 'w-6 h-6 text-[10px]',
          size === 'sm' && 'w-8 h-8 text-xs',
          size === 'md' && 'w-10 h-10 text-sm',
          size === 'lg' && 'w-12 h-12 text-base',
          size === 'xl' && 'w-16 h-16 text-lg',

          // Background
          !src && !gradient && 'bg-bg-surface',
          !src && gradient && 'bg-gradient-to-br from-brand to-brand-light',

          className
        )}
        {...props}
      >
        {/* Image */}
        {src ? (
          <img
            src={src}
            alt={alt || fallback || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          // Fallback initials
          <span className={cn(!gradient && 'text-text-secondary')}>
            {initials}
          </span>
        )}

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-bg-base',
              status === 'online' && 'bg-status-success',
              status === 'offline' && 'bg-text-muted',
              status === 'away' && 'bg-status-warning'
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
