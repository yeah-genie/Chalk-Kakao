"use client";

import Link from "next/link";
import Image from "next/image";

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center px-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.05),transparent_50%)]" />

            <div className="w-full max-w-md z-10 text-center">
                <Link href="/" className="flex items-center justify-center gap-2 mb-12">
                    <Image src="/logo.png" alt="Chalk" width={32} height={32} />
                    <span className="text-xl font-bold tracking-tight">Chalk</span>
                </Link>

                <div className="bg-[#18181b] border border-[#27272a] p-10 rounded-3xl shadow-xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-3">Authentication failed</h1>
                    <p className="text-[#a1a1aa] mb-8 leading-relaxed">
                        The login link might have expired or has already been used.
                        Please try requesting a new magic link.
                    </p>

                    <Link
                        href="/login"
                        className="block w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-[#10b981] transition-all"
                    >
                        Try Again
                    </Link>
                </div>

                <p className="mt-8 text-[#71717a] text-sm">
                    Stuck? Contact us at <a href="mailto:support@chalk.ai" className="underline hover:text-white">support@chalk.ai</a>
                </p>
            </div>
        </div>
    );
}
