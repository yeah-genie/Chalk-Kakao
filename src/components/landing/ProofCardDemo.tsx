'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChartIcon, StarIcon, CheckIcon } from '@/components/Icons';
import { Avatar } from '@/components/ui/Avatar';

export function ProofCardDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-transparent to-brand/10 rounded-xl blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="relative"
      >
        {/* Card container - Instagram story aspect */}
        <div className="max-w-[320px] mx-auto bg-gradient-to-br from-bg-surface via-bg-surface to-bg-hover border border-border/50 rounded-xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <Avatar size="lg" fallback="Emma Chen" gradient />
              <div>
                <p className="text-text-primary font-semibold">Emma Chen</p>
                <p className="text-xs text-text-muted">Math Tutor · 4 years exp.</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-brand-muted border border-brand/20 rounded-md">
              <div className="w-10 h-10 rounded-md bg-brand/20 flex items-center justify-center text-brand">
                <ChartIcon />
              </div>
              <div>
                <p className="text-brand-light font-bold text-lg">+23 pts</p>
                <p className="text-[11px] text-text-secondary">Avg. grade improvement</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="p-3 bg-bg-hover/50 rounded-md text-center"
              >
                <p className="text-xl font-bold text-text-primary">87%</p>
                <p className="text-[10px] text-text-muted">Retention rate</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="p-3 bg-bg-hover/50 rounded-md text-center"
              >
                <p className="text-xl font-bold text-text-primary">520h</p>
                <p className="text-[10px] text-text-muted">Total hours</p>
              </motion.div>
            </div>

            {/* Transformation badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-400">
                  <StarIcon className="w-4 h-4" />
                </span>
                <span className="text-xs text-amber-400 font-medium">Verified Results</span>
              </div>
              <p className="text-sm text-text-secondary">
                "24 lessons → <span className="text-brand-light font-semibold">75% fewer blocks</span>"
              </p>
              <p className="text-[10px] text-text-muted mt-1">Anonymized real student data</p>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-sm bg-cyan-500/20 flex items-center justify-center">
                <CheckIcon className="w-2.5 h-2.5 text-cyan-400" />
              </div>
              <span className="text-[10px] text-text-muted">Verified by Chalk</span>
            </div>
            <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              View profile →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
