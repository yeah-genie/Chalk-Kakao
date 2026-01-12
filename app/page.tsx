import Link from "next/link";
import Image from "next/image";
import { Mic, Shield, TrendingUp } from "lucide-react";
import { HeroProductPreview } from "@/components/landing/HeroProductPreview";
import { LiveActivityIndicator, ScrollReveal } from "@/components/landing/AnimatedElements";

// ===================================
// CHALK - LINEAR-STYLE LANDING PAGE
// Cinematic Hero + 3D Effects
// ===================================

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-[#10b981]/30 bg-[#09090b] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary Gradient Orb */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        {/* Secondary Gradient Orb */}
        <div
          className="absolute top-[30%] right-[-15%] w-[50%] h-[50%] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite reverse',
          }}
        />
        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }}
        />
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+')]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05]">
        <div className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center shadow-lg shadow-[#10b981]/20 transition-transform group-hover:scale-110 group-hover:shadow-[#10b981]/40">
              <Image src="/logo.png" alt="Chalk" width={24} height={24} className="invert brightness-0" />
            </div>
            <span className="font-bold text-xl tracking-tight">Chalk</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Features</Link>
            <Link href="#curriculum" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Curriculum</Link>
            <Link href="/login" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">Sign in</Link>
            <Link
              href="/login"
              className="text-sm px-5 py-2.5 bg-[#10b981] text-black rounded-full font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col items-center pt-28 md:pt-36 pb-20 px-6">
        {/* Hero Content */}
        <div className="max-w-4xl text-center z-10 mb-16 md:mb-20">
          {/* Live Activity Badge */}
          <div className="flex justify-center mb-10">
            <LiveActivityIndicator />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.05]">
            <span className="block">Teaching without</span>
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#10b981] via-emerald-400 to-[#10b981] bg-clip-text text-transparent">
                Data Burden
              </span>
              {/* Animated Underline */}
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#10b981] via-emerald-400 to-[#10b981] rounded-full opacity-60" />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#a1a1aa] mb-12 max-w-2xl mx-auto leading-relaxed">
            Chalk is your <span className="text-white font-medium">Invisible AI Scribe</span>.
            Focus 100% on your student while we map their mastery with clinical precision.
            <br className="hidden md:block" />
            Zero notes. Zero forms. Total Trust.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="group relative px-8 py-4 bg-[#10b981] text-black rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>
            <Link
              href="#features"
              className="group px-8 py-4 bg-white/[0.03] border border-white/[0.1] rounded-2xl font-semibold text-lg hover:bg-white/[0.06] hover:border-white/[0.15] transition-all"
            >
              <span className="flex items-center gap-2">
                See How It Works
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* 3D Product Preview */}
        <HeroProductPreview imageSrc="/product-preview.png" />
      </main>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="max-w-2xl mb-24">
              <span className="text-[#10b981] text-sm font-bold uppercase tracking-widest mb-4 block">Zero-Action Philosophy</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">You Teach. AI Scribes.</h2>
              <p className="text-[#a1a1aa] text-xl font-light">
                We've automated the 80% of reporting paperwork. No more manual data entry. No more forgotten details. Just pure human connection.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Mic,
                title: 'AI Scribing (Zero-Action)',
                description: 'Just start the session. Our AI extracts every concept, mistake, and breakthrough with zero effort from you.',
              },
              {
                icon: Shield,
                title: 'Data Sovereignty (Trust)',
                description: 'You are in control. Review analysis, then choose to commit or trash. Audio is purged immediately after processing.',
              },
              {
                icon: TrendingUp,
                title: 'Proof of Growth',
                description: 'Automatic mastery heatmaps calibrated against official exam boards. Show parents the real progress data.',
              },
            ].map((feature, i) => {
              const IconComponent = feature.icon;
              return (
                <ScrollReveal key={feature.title} delay={i * 100}>
                  <div className="group p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-[#10b981]/30 transition-all duration-300 hover:bg-white/[0.04]">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-[#10b981]/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6 md:w-7 md:h-7 text-[#10b981]" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-semibold mb-2 md:mb-4">{feature.title}</h3>
                    <p className="text-sm md:text-base text-[#a1a1aa] leading-relaxed">{feature.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum" className="py-24 px-6 bg-white/[0.015] border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Trust is built on accuracy.</h2>
              <p className="text-[#a1a1aa] max-w-xl mx-auto">
                Chalk uses your specific curriculum as the truth. Our AI maps every word to a standard, providing indisputable evidence of growth.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['AP Calculus', 'AP Physics', 'SAT Math', 'Custom Roadmap'].map((item, i) => (
              <ScrollReveal key={item} delay={i * 50}>
                <div className="p-6 rounded-3xl bg-[#18181b] border border-white/[0.05] hover:border-[#10b981]/50 transition-all cursor-default group">
                  <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center mb-4 text-[#10b981] group-hover:scale-110 transition-transform font-bold">
                    {item === 'Custom Roadmap' ? '✎' : '✓'}
                  </div>
                  <h4 className="font-semibold text-lg mb-1">{item}</h4>
                  <p className="text-xs text-[#71717a]">Clinical Precision</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
            }}
          />
        </div>
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              Focus on the teaching.
              <br />
              <span className="text-[#10b981]">We'll handle the proof.</span>
            </h2>
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#10b981] text-black rounded-2xl font-bold text-xl hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
            >
              Start Your Zero-Action Portfolio
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#10b981] flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-sm" />
            </div>
            <span className="font-bold">Chalk</span>
          </div>
          <div className="flex gap-10 text-sm text-[#71717a]">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
          <p className="text-sm text-[#71717a]">
            © 2024 Chalk. The Proof Generation Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
