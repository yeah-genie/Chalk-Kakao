'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Premium animated background */}
            <div className="fixed inset-0 -z-10">
                {/* Base */}
                <div className="absolute inset-0 bg-[#050506]" />

                {/* Gradient orbs */}
                <div className="absolute top-[-30%] left-[20%] w-[600px] h-[600px] rounded-full bg-emerald-500/[0.03] blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.02] blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[40%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.02] blur-[100px]" />

                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
                        backgroundSize: '100px 100px'
                    }}
                />

                {/* Top fade */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-500/[0.03] to-transparent" />
            </div>

            {/* Header - 여백 확보 */}
            <header className="pt-8 px-8">
                <Link href="/" className="inline-flex items-center gap-3 group">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                    >
                        <span className="text-white text-sm font-bold">C</span>
                    </motion.div>
                    <span className="text-lg font-semibold text-white/90 tracking-tight">Chalk</span>
                </Link>
            </header>

            {/* Main content - 넓은 여백 */}
            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[380px]"
                >
                    {/* Title section - 더 큰 여백 */}
                    <div className="text-center mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-[32px] font-bold text-white tracking-tight"
                        >
                            다시 오셨군요
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-[15px] text-zinc-500 mt-3"
                        >
                            수업 기록을 이어서 쌓아보세요
                        </motion.p>
                    </div>

                    {/* Form */}
                    <motion.form
                        onSubmit={handleLogin}
                        className="space-y-5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {/* Email input */}
                        <div className="space-y-2">
                            <label className="block text-[13px] font-medium text-zinc-400">
                                이메일
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused(null)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[15px] text-white placeholder-zinc-600 focus:outline-none focus:bg-white/[0.05] focus:border-emerald-500/40 transition-all duration-200"
                                />
                                {focused === 'email' && (
                                    <motion.div
                                        layoutId="input-focus"
                                        className="absolute inset-0 rounded-xl border-2 border-emerald-500/30 pointer-events-none"
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Password input */}
                        <div className="space-y-2">
                            <label className="block text-[13px] font-medium text-zinc-400">
                                비밀번호
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocused('password')}
                                    onBlur={() => setFocused(null)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[15px] text-white placeholder-zinc-600 focus:outline-none focus:bg-white/[0.05] focus:border-emerald-500/40 transition-all duration-200"
                                />
                                {focused === 'password' && (
                                    <motion.div
                                        layoutId="input-focus"
                                        className="absolute inset-0 rounded-xl border-2 border-emerald-500/30 pointer-events-none"
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                className="flex items-start gap-3 p-4 bg-red-500/[0.08] border border-red-500/20 rounded-xl"
                            >
                                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-red-400 text-xs">!</span>
                                </div>
                                <p className="text-[13px] text-red-400 leading-relaxed">{error}</p>
                            </motion.div>
                        )}

                        {/* Submit button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.99 }}
                            className="relative w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed mt-8"
                        >
                            {/* Hover glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Shadow */}
                            <div className="absolute inset-0 rounded-xl shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow duration-300" />

                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        로그인 중
                                    </>
                                ) : '계속하기'}
                            </span>
                        </motion.button>
                    </motion.form>

                    {/* Signup link */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center text-zinc-500 text-[14px] mt-10"
                    >
                        처음이신가요?{' '}
                        <Link href="/signup" className="text-white hover:text-emerald-400 font-medium transition-colors">
                            계정 만들기
                        </Link>
                    </motion.p>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="py-6 px-8 text-center">
                <p className="text-[12px] text-zinc-600">
                    수업 로그가 포트폴리오가 됩니다
                </p>
            </footer>
        </div>
    );
}
