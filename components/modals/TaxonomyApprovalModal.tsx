"use client";

import { useState } from "react";
import { approveProposal, rejectProposal } from "@/lib/actions/taxonomy";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    proposals: any[];
    onRefresh: () => void;
}

export function TaxonomyApprovalModal({ isOpen, onClose, proposals, onRefresh }: Props) {
    const [processingId, setProcessingId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setProcessingId(id);
        try {
            const res = action === 'approve' ? await approveProposal(id) : await rejectProposal(id);
            if (res.success) {
                onRefresh();
                if (proposals.length === 1) onClose();
            } else {
                alert(res.error || "Action failed");
            }
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-8 border-b border-white/5">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">AI Taxonomy Queue</h2>
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-1">Pending Structure Review</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {proposals.map((prop) => (
                        <div key={prop.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 transition-all hover:bg-white/10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${prop.type === 'unit' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {prop.type}
                                        </span>
                                        <h3 className="text-lg font-black text-white">{prop.name}</h3>
                                    </div>
                                    <p className="text-sm text-white/50">{prop.description || "No description provided."}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-[#10b981] uppercase tracking-wider">{prop.kb_subjects?.name}</p>
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Source: {prop.sessions?.students?.name}</p>
                                </div>
                            </div>

                            {prop.type === 'topic' && prop.parent_id && (
                                <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/5">
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Suggested Parent Unit</p>
                                    <p className="text-xs text-white/70 font-bold">{prop.parent_id}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => handleAction(prop.id, 'approve')}
                                    disabled={processingId === prop.id}
                                    className="flex-1 py-3 bg-[#10b981] text-[#050510] rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {processingId === prop.id ? "Processing..." : "Approve & Merge"}
                                </button>
                                <button
                                    onClick={() => handleAction(prop.id, 'reject')}
                                    disabled={processingId === prop.id}
                                    className="px-6 py-3 bg-white/5 text-white/40 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/5 disabled:opacity-50"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-white/5 border-t border-white/5 text-center">
                    <button onClick={onClose} className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors">
                        Close Queue
                    </button>
                </div>
            </div>
        </div>
    );
}
