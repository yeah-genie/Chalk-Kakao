'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendUpIcon } from '@/components/Icons';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function ParentReportDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className="relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="relative bg-bg-base border border-border rounded-lg overflow-hidden"
      >
        {/* Email header style */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-bg-surface to-bg-surface/50">
          <div className="flex items-center gap-3">
            <Avatar size="sm" fallback="Chalk" gradient />
            <div className="flex-1">
              <p className="text-sm text-text-primary">Progress Report #5 — Alex</p>
              <p className="text-xs text-text-muted">Emma Chen → Alex's Parents</p>
            </div>
            <span className="text-xs text-text-muted">Just now</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-cyan-400 mb-2">Last 5 lessons summary</p>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>📚 Covered: Quadratic equations, completing the square</p>
              <p>✅ Strengths: Formula recall improved, accuracy up</p>
              <p>📝 Focus area: Word problem interpretation</p>
            </div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="p-4 bg-bg-surface/50 rounded-md border border-border/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">Overall progress</span>
              <span className="text-xs text-brand-light">On track</span>
            </div>
            <ProgressBar value={72} variant="gradient" size="md" />
            <div className="flex justify-between mt-2 text-[10px] text-text-muted">
              <span>Start</span>
              <span>72% complete</span>
              <span>Goal</span>
            </div>
          </motion.div>

          {/* Key insight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="p-4 bg-gradient-to-r from-brand-muted to-cyan-500/5 border border-brand/20 rounded-md"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-brand/20 flex items-center justify-center flex-shrink-0">
                <TrendUpIcon className="w-4 h-4 text-brand-light" />
              </div>
              <div>
                <p className="text-sm text-brand-light font-medium mb-1">This month's highlight</p>
                <p className="text-xs text-text-secondary">
                  Confusion frequency down <span className="text-brand-light">42%</span> compared to last month. Alex is grasping concepts faster.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Teacher comment */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="p-4 bg-bg-surface/30 border border-border/50 rounded-md"
          >
            <p className="text-xs text-text-muted mb-1">Tutor's note</p>
            <p className="text-sm text-text-secondary italic">
              "Alex is building real confidence. He's now attempting problems on his own before asking for help!"
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
