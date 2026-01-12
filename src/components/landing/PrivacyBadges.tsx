'use client';

import { LockIcon, CheckIcon, ShieldIcon } from '@/components/Icons';

export function PrivacyBadges() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-text-muted">
      <span className="flex items-center gap-2">
        <LockIcon className="w-4 h-4 text-cyan-500" />
        Fully anonymized
      </span>
      <span className="hidden sm:block text-border-hover">·</span>
      <span className="flex items-center gap-2">
        <CheckIcon className="w-4 h-4 text-brand-light" />
        No student data exposed
      </span>
      <span className="hidden sm:block text-border-hover">·</span>
      <span className="flex items-center gap-2">
        <ShieldIcon className="w-4 h-4 text-amber-500" />
        Recordings deleted in 24h
      </span>
    </div>
  );
}
