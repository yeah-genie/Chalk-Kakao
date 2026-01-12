'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckIcon } from '@/components/Icons';
import { cn } from '@/design-system/utils';

interface WaitlistFormProps {
  onSuccess?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
}

export function WaitlistForm({ onSuccess, className, variant = 'default' }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || status === 'loading') return;

    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        onSuccess?.();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'inline-flex items-center gap-2 px-5 py-2.5 bg-bg-surface border border-border rounded-md',
          className
        )}
      >
        <CheckIcon className="w-4 h-4 text-brand-light" />
        <span className="text-sm text-text-secondary">You're on the list</span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        size={variant === 'compact' ? 'md' : 'md'}
        className="flex-1"
      />
      <Button
        type="submit"
        variant="primary"
        loading={status === 'loading'}
        className="bg-white text-bg-base hover:bg-text-secondary"
      >
        {variant === 'compact' ? 'Join' : 'Join beta'}
      </Button>
    </form>
  );
}
