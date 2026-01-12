import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { getPendingProposals, approveProposal, rejectProposal } from '@/lib/actions/taxonomy';
import { Database, Plus, X, Check, ArrowRight, Brain, Info } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function KnowledgePage() {
    const proposals = await getPendingProposals();

    return (
        <div className="flex min-h-screen overflow-hidden bg-[#0a0a0c] text-white">
            <Sidebar />
            <main className="flex-1 md:ml-20 lg:ml-64 overflow-y-auto p-4 md:p-8 lg:p-12 pb-24 md:pb-12">
                <header className="mb-8 md:mb-12">
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                        <div className="bg-[#10b981]/20 p-2 rounded-xl">
                            <Database className="text-[#10b981]" size={20} />
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight">AI Taxonomy</h1>
                    </div>
                    <p className="text-white/40 max-w-2xl text-sm md:text-lg leading-relaxed">
                        Review and approve new topics suggested by AI during student sessions.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {proposals.length === 0 ? (
                        <div className="bg-[#18181b] border border-dashed border-white/10 rounded-[2rem] p-20 text-center">
                            <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="text-white/20" size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No pending proposals</h3>
                            <p className="text-white/40">Our AI hasn't suggested any new topics recently. Great job keeping the base clean!</p>
                        </div>
                    ) : (
                        proposals.map((prop: any) => (
                            <div key={prop.id} className="bg-[#18181b] border border-white/5 rounded-[2rem] p-8 hover:border-[#10b981]/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                    <Brain size={120} />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                    <div className="space-y-4 max-w-2xl">
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                                prop.type === 'unit' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                                            )}>
                                                Proposed {prop.type}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1">
                                                <Info size={12} />
                                                Suggested for {prop.kb_subjects?.name || prop.subject_id}
                                            </span>
                                        </div>

                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            {prop.parent_id && (
                                                <>
                                                    <span className="text-white/30 text-lg font-medium">{prop.parent_id}</span>
                                                    <ArrowRight size={18} className="text-white/20" />
                                                </>
                                            )}
                                            {prop.name}
                                        </h2>

                                        <p className="text-white/60 leading-relaxed italic">
                                            "{prop.description || "No description provided by AI."}"
                                        </p>

                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                                                Origin: Session with {prop.sessions?.students?.name || "Student"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <form action={async () => {
                                            'use server';
                                            await approveProposal(prop.id);
                                            revalidatePath('/dashboard/knowledge');
                                        }}>
                                            <button className="h-14 px-8 bg-[#10b981] text-black font-black rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                                <Check size={20} />
                                                Approve
                                            </button>
                                        </form>
                                        <form action={async () => {
                                            'use server';
                                            await rejectProposal(prop.id);
                                            revalidatePath('/dashboard/knowledge');
                                        }}>
                                            <button className="h-14 w-14 border border-white/5 bg-white/5 text-white/60 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 rounded-2xl flex items-center justify-center transition-all">
                                                <X size={20} />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

// Helper for classNames (simple version)
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
