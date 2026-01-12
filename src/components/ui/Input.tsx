'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/design-system/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Size of the input */
  size?: 'sm' | 'md' | 'lg';
  /** Show error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Icon to show at the start */
  leftIcon?: ReactNode;
  /** Icon to show at the end */
  rightIcon?: ReactNode;
  /** Label for the input */
  label?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Full width input */
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      size = 'md',
      error = false,
      errorMessage,
      leftIcon,
      rightIcon,
      label,
      helperText,
      fullWidth = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}

          {/* Input element */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full bg-bg-surface border rounded-md',
              'text-text-primary placeholder:text-text-muted',
              'transition-all duration-200',
              'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',

              // Default border
              !error && 'border-border hover:border-border-hover',

              // Error state
              error && 'border-status-error focus:border-status-error focus:ring-status-error/20',

              // Size styles
              size === 'sm' && 'h-8 px-2.5 text-xs',
              size === 'md' && 'h-10 px-3.5 text-sm',
              size === 'lg' && 'h-12 px-4 text-base',

              // Icon padding
              leftIcon && size === 'sm' && 'pl-8',
              leftIcon && size === 'md' && 'pl-10',
              leftIcon && size === 'lg' && 'pl-12',
              rightIcon && size === 'sm' && 'pr-8',
              rightIcon && size === 'md' && 'pr-10',
              rightIcon && size === 'lg' && 'pr-12',

              className
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper text or error message */}
        {(helperText || errorMessage) && (
          <p
            className={cn(
              'text-xs',
              error ? 'text-status-error' : 'text-text-muted'
            )}
          >
            {error ? errorMessage : helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
