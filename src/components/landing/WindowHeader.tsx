'use client';

import { cn } from '@/design-system/utils';

interface WindowHeaderProps {
  title: string;
  variant?: 'default' | 'dark';
}

export function WindowHeader({ title, variant = 'default' }: WindowHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-3 border-b',
        variant === 'dark'
          ? 'border-bg-surface bg-bg-base'
          : 'border-border bg-bg-elevated/50'
      )}
    >
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
      </div>
      <span className="text-xs text-text-muted ml-2">{title}</span>
    </div>
  );
}
