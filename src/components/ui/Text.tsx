'use client';

import { forwardRef, type HTMLAttributes, type ElementType } from 'react';
import { cn } from '@/design-system/utils';

type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'lg'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';

type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'inherit';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Typography variant */
  variant?: TextVariant;
  /** Text color */
  color?: TextColor;
  /** HTML element to render as */
  as?: ElementType;
  /** Font weight override */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Apply gradient effect */
  gradient?: boolean;
  /** Truncate with ellipsis */
  truncate?: boolean;
}

const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      className,
      variant = 'body',
      color = 'primary',
      as,
      weight,
      align,
      gradient = false,
      truncate = false,
      children,
      ...props
    },
    ref
  ) => {
    // Determine the HTML element based on variant
    const defaultElement: Record<TextVariant, ElementType> = {
      display: 'h1',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      lg: 'p',
      body: 'p',
      bodySmall: 'p',
      caption: 'span',
      label: 'label',
    };

    const Component = as || defaultElement[variant];

    return (
      <Component
        ref={ref}
        className={cn(
          // Variant styles
          variant === 'display' && 'text-4xl font-bold tracking-tight leading-tight',
          variant === 'h1' && 'text-2xl font-bold tracking-tight leading-tight',
          variant === 'h2' && 'text-xl font-semibold tracking-tight leading-snug',
          variant === 'h3' && 'text-lg font-semibold leading-snug',
          variant === 'lg' && 'text-lg leading-relaxed',
          variant === 'body' && 'text-base leading-relaxed',
          variant === 'bodySmall' && 'text-sm leading-relaxed',
          variant === 'caption' && 'text-xs leading-normal',
          variant === 'label' && 'text-sm font-medium',

          // Color styles
          color === 'primary' && 'text-text-primary',
          color === 'secondary' && 'text-text-secondary',
          color === 'muted' && 'text-text-muted',
          color === 'brand' && 'text-brand',
          color === 'success' && 'text-status-success',
          color === 'warning' && 'text-status-warning',
          color === 'error' && 'text-status-error',
          color === 'inherit' && 'text-inherit',

          // Weight override
          weight === 'normal' && 'font-normal',
          weight === 'medium' && 'font-medium',
          weight === 'semibold' && 'font-semibold',
          weight === 'bold' && 'font-bold',

          // Alignment
          align === 'left' && 'text-left',
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',

          // Gradient effect
          gradient && [
            'bg-gradient-to-r from-brand to-brand-light',
            'bg-clip-text text-transparent',
          ],

          // Truncate
          truncate && 'truncate',

          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

export { Text };
