"use client";

import { useState } from "react";
import { Camera, Brain, Lightbulb, FileText, Check, X, BarChart3, AlertTriangle } from "lucide-react";

export default function LandingPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
                return;
            }

            setSubmitted(true);
        } catch {
            setError('Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Gradient Background */}
            <div className="fixed inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A] to-[#1a1a2e] pointer-events-none" />

            {/* Subtle Grid Pattern */}
            <div
                className="fixed inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px'
                }}
            />

            <div className="relative z-10">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">C</span>
                        </div>
                        <span className="text-xl font-semibold tracking-tight">Chalk</span>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex flex-col items-center justify-center px-6 pt-20 pb-24">
                    {/* Badge */}
                    <div className="mb-8">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            AI-Powered Homework Analysis
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold text-center max-w-4xl leading-[1.1] tracking-tight">
                        Know exactly{" "}
                        <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                            why
                        </span>{" "}
                        your students make mistakes
                    </h1>

                    {/* Subheadline */}
                    <p className="mt-6 text-xl text-gray-400 text-center max-w-2xl leading-relaxed">
                        AI that analyzes homework photos in seconds and pinpoints the exact misconception behind every wrong answer.
                    </p>

                    {/* Email Signup */}
                    <div className="mt-12 w-full max-w-md">
                        {submitted ? (
                            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-white/5 border border-white/10 rounded-xl">
                                <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                                <span className="text-gray-300">You&apos;re on the list. We&apos;ll be in touch.</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-xl 
                             text-white placeholder:text-gray-500 
                             focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                             transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-4 bg-white text-black font-medium rounded-xl
                             hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all whitespace-nowrap"
                                >
                                    {loading ? "Joining..." : "Get Early Access"}
                                </button>
                            </form>
                        )}
                        {error && (
                            <p className="mt-3 text-center text-sm text-red-400">{error}</p>
                        )}
                        <p className="mt-4 text-center text-sm text-gray-500">
                            Join tutors already on the waitlist · No spam, ever
                        </p>
                    </div>

                    {/* What is Chalk Section */}
                    <div className="mt-28 w-full max-w-4xl">
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                            How Chalk works
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Step 1 */}
                            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                                <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                                    <Camera className="w-5 h-5 text-violet-400" aria-hidden="true" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Upload homework</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Student sends a photo of their completed homework to the chat.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                                <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                                    <Brain className="w-5 h-5 text-violet-400" aria-hidden="true" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">AI analyzes</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Our model reads handwriting, checks each step, and identifies errors with 98.7% accuracy.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                                <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                                    <Lightbulb className="w-5 h-5 text-violet-400" aria-hidden="true" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Instant feedback</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Get a detailed report explaining what went wrong and how to improve.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Demo Preview */}
                    <div className="mt-20 w-full max-w-3xl">
                        <div className="relative p-8 bg-white/[0.02] border border-white/10 rounded-2xl">
                            <div className="absolute top-4 left-4 flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>

                            <div className="mt-6 space-y-4 font-mono text-sm">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-4 h-4 text-gray-500 mt-0.5" aria-hidden="true" />
                                    <span className="text-gray-300">Analysis Complete</span>
                                </div>
                                <div className="pl-7 space-y-3 text-gray-400">
                                    <div className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                        <span>Problem 1: Correct</span>
                                    </div>
                                    <div>
                                        <div className="flex items-start gap-2">
                                            <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                            <span>Problem 2: <span className="text-red-400">Sign Error</span></span>
                                        </div>
                                        <p className="text-gray-500 text-xs mt-1 ml-6">→ Wrote 3x = 14 + 5 instead of 14 - 5</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                        <span>Problem 3: Correct</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4 text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <BarChart3 className="w-4 h-4" aria-hidden="true" />
                                        Score: 2/3
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                                        Focus: Sign operations
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-center text-sm text-gray-500">
                            Real analysis from a student&apos;s algebra homework
                        </p>
                    </div>

                    {/* Social Proof */}
                    <div className="mt-20 text-center">
                        <p className="text-gray-500 text-sm">
                            Trusted by tutors from
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-8 text-gray-400/60">
                            <span className="font-medium">Seoul</span>
                            <span className="text-gray-600">·</span>
                            <span className="font-medium">London</span>
                            <span className="text-gray-600">·</span>
                            <span className="font-medium">New York</span>
                            <span className="text-gray-600">·</span>
                            <span className="font-medium">Singapore</span>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-8 border-t border-white/5">
                    <p className="text-center text-sm text-gray-500">
                        © 2026 Chalk. Built for tutors who care.
                    </p>
                </footer>
            </div>
        </div>
    );
}
