'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MicIcon, ChartIcon, ShareIcon } from '@/components/Icons';
import { cn } from '@/design-system/utils';

const steps = [
  {
    icon: MicIcon,
    title: 'Connect once, auto-sync',
    desc: 'Link Zoom or Meet. Lessons upload automatically after each session.',
    color: 'cyan' as const,
  },
  {
    icon: ChartIcon,
    title: 'AI tracks transformation',
    desc: 'Question patterns, confusion frequency, concept mastery — all tracked.',
    color: 'emerald' as const,
  },
  {
    icon: ShareIcon,
    title: 'Get proof assets',
    desc: 'Portfolio cards and parent reports generated automatically.',
    color: 'amber' as const,
  },
];

const colorClasses = {
  cyan: 'bg-cyan-500/10 text-cyan-400',
  emerald: 'bg-brand-muted text-brand-light',
  amber: 'bg-amber-500/10 text-amber-400',
};

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className="relative">
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className="relative p-6 bg-bg-surface/50 border border-border/50 rounded-lg hover:border-border-hover transition-colors"
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-md flex items-center justify-center mb-4',
                  colorClasses[step.color]
                )}
              >
                <Icon />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{step.title}</h3>
              <p className="text-sm text-text-secondary">{step.desc}</p>

              {/* Step number */}
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-bg-hover flex items-center justify-center text-xs text-text-muted font-medium">
                {i + 1}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
