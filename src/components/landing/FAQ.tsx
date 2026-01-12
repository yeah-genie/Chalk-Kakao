'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@/components/Icons';

const items = [
  {
    q: 'How is this different from other lesson analysis tools?',
    a: "Chalk doesn't critique your teaching. Instead, it tracks student transformation over time — documenting growth that becomes provable marketing assets you can share anywhere.",
  },
  {
    q: 'How is student privacy protected?',
    a: "All data is fully anonymized. Students appear as 'Student A' or 'Student B' — never by name. Parent reports are private to each family. Recordings are deleted within 24 hours.",
  },
  {
    q: 'What subjects does it work for?',
    a: 'Any subject. Currently most effective for math, science, and subjects with clear concept progression. Language and coding support coming soon.',
  },
  {
    q: 'How much does it cost?',
    a: 'Free during beta. After launch, pricing starts at $15/month. Your first 2 students are always free, forever.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-border/50 rounded-md overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-bg-surface/30 transition-colors"
          >
            <span className="text-text-secondary">{item.q}</span>
            <motion.div
              animate={{ rotate: open === i ? 180 : 0 }}
              className="text-text-muted flex-shrink-0 ml-4"
            >
              <ChevronDownIcon />
            </motion.div>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-text-muted leading-relaxed">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
