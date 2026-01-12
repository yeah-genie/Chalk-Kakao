'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { WindowHeader } from './WindowHeader';
import { cn } from '@/design-system/utils';

interface JourneyStep {
  month: string;
  status: string;
  concept: string;
  struggle: string;
  blockFreq: number;
  color: 'red' | 'amber' | 'cyan' | 'emerald';
}

const journey: JourneyStep[] = [
  {
    month: 'Mar',
    status: 'Start',
    concept: 'Fractions',
    struggle: "Couldn't add unlike denominators",
    blockFreq: 8,
    color: 'red',
  },
  {
    month: 'Apr',
    status: 'Progress',
    concept: 'Linear equations',
    struggle: 'Understanding equals sign',
    blockFreq: 5,
    color: 'amber',
  },
  {
    month: 'May',
    status: 'Breakthrough',
    concept: 'Quadratics',
    struggle: 'Mastered quadratic formula',
    blockFreq: 3,
    color: 'cyan',
  },
  {
    month: 'Jun',
    status: 'Mastery',
    concept: 'Functions',
    struggle: 'None — self-directed learning',
    blockFreq: 1,
    color: 'emerald',
  },
];

const colorClasses = {
  red: {
    bg: 'bg-red-500',
    text: 'text-red-400',
    border: 'border-red-500/30',
    bgMuted: 'bg-red-500/20',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    bgMuted: 'bg-amber-500/20',
  },
  cyan: {
    bg: 'bg-cyan-500',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bgMuted: 'bg-cyan-500/20',
  },
  emerald: {
    bg: 'bg-brand',
    text: 'text-brand-light',
    border: 'border-brand/30',
    bgMuted: 'bg-brand/20',
  },
};

export function TransformationDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setCurrentStep((s) => (s + 1) % journey.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isInView]);

  const currentJourney = journey[currentStep];
  const colors = colorClasses[currentJourney.color];

  return (
    <div ref={ref} className="relative">
      <div className="relative bg-bg-base border border-border rounded-lg overflow-hidden">
        <WindowHeader title="Student A — Transformation Story" variant="dark" />

        <div className="p-6">
          {/* Progress Timeline */}
          <div className="relative mb-8">
            <div className="flex justify-between items-center">
              {journey.map((step, i) => {
                const stepColors = colorClasses[step.color];
                return (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300',
                        i === currentStep
                          ? `${stepColors.bg} text-white shadow-lg`
                          : i < currentStep
                            ? 'bg-bg-hover text-text-secondary'
                            : 'bg-bg-surface text-text-muted border border-border'
                      )}
                    >
                      {step.month}
                    </motion.div>
                    <span
                      className={cn(
                        'text-[10px] mt-2',
                        i === currentStep ? stepColors.text : 'text-text-muted'
                      )}
                    >
                      {step.status}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress line */}
            <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-bg-surface -z-10">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 via-amber-500 via-cyan-500 to-brand"
                initial={{ width: 0 }}
                animate={isInView ? { width: `${(currentStep / (journey.length - 1)) * 100}%` } : {}}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Current Step Detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'p-5 rounded-lg border bg-gradient-to-br from-bg-surface/50 to-bg-surface/20',
                colors.border
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-sm',
                        colors.bgMuted,
                        colors.text
                      )}
                    >
                      {currentJourney.month}
                    </span>
                    <span className="text-sm font-medium text-text-primary">
                      {currentJourney.concept}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm">{currentJourney.struggle}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-text-primary">{currentJourney.blockFreq}</p>
                  <p className="text-[10px] text-text-muted">blocks/lesson</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { value: '24', label: 'Total lessons', color: null },
              { value: '75%↓', label: 'Fewer blocks', color: 'text-brand-light' },
              { value: '12', label: 'Concepts mastered', color: 'text-cyan-400' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-3 bg-bg-surface/50 rounded-md border border-border/50 text-center"
              >
                <p className={cn('text-lg font-bold', stat.color || 'text-text-primary')}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
