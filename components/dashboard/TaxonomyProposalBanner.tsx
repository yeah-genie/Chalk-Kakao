"use client";

import { useState, useEffect } from "react";
import { getPendingProposals } from "@/lib/actions/taxonomy";
import { TaxonomyApprovalModal } from "@/components/modals/TaxonomyApprovalModal";

export function TaxonomyProposalBanner() {
    const [proposals, setProposals] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        const data = await getPendingProposals();
        setProposals(data);
        setLoading(false);
    };

    useEffect(() => {
        refresh();
    }, []);

    if (loading) return null;

    if (proposals.length === 0) {
        // Only show config warning if no proposals but also no real Supabase config
        const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL &&
            process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

        if (!isConfigured) {
            return (
                <div className="mb-6 mx-auto max-w-7xl">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-black font-bold">!</span>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Supabase Configuration Missing</p>
                            <p className="text-white/40 text-[11px]">Please add NEXT_PUBLIC_SUPABASE_URL and ANON_KEY to Vercel env vars.</p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }

    return (
        <>
            <div className="mb-6 mx-auto max-w-7xl animate-in slide-in-from-top duration-500">
                <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center shadow-[0_0_15px_#10b981]/30">
                            <span className="text-[#050510] font-black text-sm">AI</span>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">
                                Curriculum Growth Detected
                            </p>
                            <p className="text-white/40 text-[11px] font-medium tracking-wide">
                                AI has identified <span className="text-[#10b981] font-bold">{proposals.length} new structural nodes</span> from your recent sessions.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 bg-[#10b981] text-[#050510] rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                    >
                        Review Suggestions
                    </button>
                </div>
            </div>

            <TaxonomyApprovalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                proposals={proposals}
                onRefresh={refresh}
            />
        </>
    );
}
