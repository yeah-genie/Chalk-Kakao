'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

// Design System
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';

// Landing Components
import {
  TransformationDemo,
  ProofCardDemo,
  ParentReportDemo,
  HowItWorks,
  PrivacyBadges,
  FAQ,
  WaitlistForm,
} from '@/components/landing';

// Icons
import { CheckIcon } from '@/components/Icons';

// ===========================================
// SECTION COMPONENTS
// ===========================================

function ProblemSection() {
  const problems = [
    { claim: '5 years experience', reality: 'Experience ≠ quality' },
    { claim: '4.9 star reviews', reality: 'Easily manipulated' },
    { claim: 'Top university grad', reality: 'Irrelevant to teaching' },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="brand" className="mb-3">
            The problem
          </Badge>
          <Text variant="h1" className="mb-4">
            How do you prove
            <br />
            you're a great tutor?
          </Text>
          <Text color="muted" className="max-w-lg mx-auto">
            Everyone claims experience. Reviews are all positive.
            <br />
            Parents want real evidence.
          </Text>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {problems.map((item, i) => (
            <motion.div
              key={item.claim}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 bg-bg-surface/30 border border-border/50 rounded-md"
            >
              <div className="relative inline-block mb-1">
                <span className="text-text-secondary">{item.claim}</span>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.4, ease: 'easeOut' }}
                  className="absolute left-0 top-1/2 h-[2px] bg-status-error/60"
                />
              </div>
              <p className="text-status-error/80 text-sm">{item.reality}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section className="py-32 px-6 border-t border-border/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="brand" className="mb-3">
            The solution
          </Badge>
          <Text variant="h1">Student growth is the proof</Text>
          <Text color="muted" className="mt-3 max-w-lg mx-auto">
            As lessons accumulate, AI automatically documents the transformation.
          </Text>
        </div>
        <TransformationDemo />
      </div>
    </section>
  );
}

function ProofCardSection() {
  const tags = ['Your website', 'Tutor platforms', 'Instagram', 'LinkedIn'];

  return (
    <section className="py-32 px-6 border-t border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="brand" className="mb-3">
              Marketing asset
            </Badge>
            <Text variant="h1" className="mb-4">
              Share once, attract students
            </Text>
            <Text color="muted" className="mb-6">
              Your lesson history becomes a portfolio automatically.
              <br />
              Share anywhere — platforms, social media, your website.
            </Text>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="default" pill>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <ProofCardDemo />
        </div>
      </div>
    </section>
  );
}

function ParentReportSection() {
  const features = [
    'Auto-generated lesson summaries',
    'Visual progress tracking',
    'Share via email or link',
  ];

  return (
    <section className="py-32 px-6 border-t border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <ParentReportDemo />
          </div>
          <div className="order-1 md:order-2">
            <Badge variant="brand" className="mb-3">
              Parent trust
            </Badge>
            <Text variant="h1" className="mb-4">
              Reports write themselves
            </Text>
            <Text color="muted" className="mb-6">
              After each lesson, parent updates are auto-generated.
              <br />
              Stop spending time on admin.
            </Text>
            <ul className="space-y-3 text-sm text-text-secondary">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-brand-light" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-32 px-6 border-t border-border/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="brand" className="mb-3">
            How it works
          </Badge>
          <Text variant="h1">Just teach. We handle the rest.</Text>
        </div>
        <HowItWorks />
        <div className="mt-12">
          <PrivacyBadges />
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="py-32 px-6 border-t border-border/50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <Text variant="h2">Questions</Text>
        </div>
        <FAQ />
      </div>
    </section>
  );
}

function FinalCTASection({ count }: { count: number }) {
  return (
    <section className="py-32 px-6 border-t border-border/50">
      <div className="max-w-md mx-auto text-center">
        <Text variant="h2" className="mb-3">
          Prove your teaching impact
        </Text>
        <Text color="muted" className="mb-8">
          Free during beta. No credit card required.
        </Text>
        <WaitlistForm variant="compact" />
        {count > 0 && (
          <p className="text-xs text-text-muted mt-4">{count} tutors on the waitlist</p>
        )}
      </div>
    </section>
  );
}

// ===========================================
// MAIN PAGE
// ===========================================

export default function LandingPage() {
  const [count, setCount] = useState(0);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  useEffect(() => {
    fetch('/api/waitlist')
      .then((r) => r.json())
      .then((d) => d.count && setCount(d.count))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary antialiased">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-brand-muted to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-text-primary">
            Chalk
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted hidden sm:block">Lessons become proof</span>
            <Link
              href="/beta"
              className="text-xs bg-brand-muted text-brand px-3 py-1.5 rounded-md hover:bg-brand/20 transition-colors"
            >
              Join Beta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="min-h-screen flex items-center justify-center px-6 pt-14"
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Text variant="display" className="mb-6">
              Prove your
              <br />
              <span className="gradient-text">teaching impact</span>
            </Text>

            <Text color="secondary" variant="lg" className="mb-10 max-w-md mx-auto">
              Record lessons. AI tracks student growth.
              <br />
              Your teaching becomes provable evidence.
            </Text>

            <WaitlistForm className="max-w-sm mx-auto" />

            {count > 0 && (
              <p className="text-xs text-text-muted mt-4">{count} tutors on the waitlist</p>
            )}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-2"
            >
              <div className="w-1 h-2 bg-text-muted rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Content Sections */}
      <ProblemSection />
      <SolutionSection />
      <ProofCardSection />
      <ParentReportSection />
      <HowItWorksSection />
      <FAQSection />
      <FinalCTASection count={count} />

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-text-muted">© 2025 Chalk</p>
        </div>
      </footer>
    </div>
  );
}
