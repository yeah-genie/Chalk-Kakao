'use client';

import React from 'react';
import { Topic } from '@/lib/knowledge-graph';
import { X, MessageSquare, Target, Zap, Send, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface TopicInsightPanelProps {
    topic: Topic | null;
    onClose: () => void;
    masteryLevel: number;
    insights: {
        text: string;
        nextSteps: string[];
        evidence: string[];
        futureImpact?: string;
    };
}

export default function TopicInsightPanel({ topic, onClose, masteryLevel, insights }: TopicInsightPanelProps) {
    if (!topic) return null;

    return (
        <div className="w-[440px] h-full bg-[#0a0a1a] border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl z-20">
            {/* Header */}
            <div className="p-10 border-b border-white/5 flex items-start justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="pr-6">
                    <span className="text-[10px] text-[#10b981] font-bold uppercase tracking-[0.3em] mb-3 block text-shadow-sm">
                        Deep Insight
                    </span>
                    <h2 className="text-2xl font-bold text-white leading-tight tracking-tight">
                        {topic.name}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-3 hover:bg-white/5 rounded-2xl transition-all text-white/30 hover:text-white border border-transparent hover:border-white/10"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content Overflow Area */}
            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">

                {/* Mastery Level */}
                <div className="relative group">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-[11px] text-white/40 font-bold uppercase tracking-widest">Mastery Level</span>
                        <span className="text-4xl font-black text-[#10b981]">
                            {masteryLevel}%
                        </span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden blur-[0.2px]">
                        <div
                            className="h-full bg-gradient-to-r from-[#059669] to-[#10b981] transition-all duration-[1500ms] shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                            style={{ width: `${masteryLevel}%` }}
                        />
                    </div>
                </div>

                {/* AI Narrative */}
                <div className="space-y-5">
                    <div className="flex items-center space-x-3 text-white/30">
                        <MessageSquare size={16} className="text-[#10b981]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">The Verdict</span>
                    </div>
                    <div className="bg-white/[0.03] rounded-3xl p-6 border border-white/5 shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#10b981]/30 group-hover:bg-[#10b981] transition-colors" />
                        <p className="text-sm text-white/80 leading-relaxed italic font-serif opacity-90">
                            "{insights.text}"
                        </p>
                    </div>
                </div>

                {/* Predictive Gap Analysis (New) */}
                {insights.futureImpact && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 text-amber-500">
                            <AlertCircle size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Future Correlation Warning</span>
                        </div>
                        <p className="text-[13px] text-amber-500/80 leading-relaxed font-semibold italic">
                            "{insights.futureImpact}"
                        </p>
                    </div>
                )}

                {/* Visual Evidence Placeholder (Phase 4 Vision) */}
                <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-8 text-center group cursor-pointer hover:border-[#10b981]/30 transition-all hover:bg-[#10b981]/[0.02]">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-white/20 mb-4 group-hover:bg-[#10b981]/10 group-hover:text-[#10b981] transition-all">
                        <ImageIcon size={24} />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-all">Visual Auto-Ingestion</p>
                    <p className="text-[10px] text-white/10 mt-2 uppercase tracking-tighter leading-relaxed">Drag session photos or worksheets <br />to combine analysis</p>
                </div>

                {/* Next Steps */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-3 text-white/30">
                        <Target size={16} className="text-[#10b981]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Strategy Plan</span>
                    </div>
                    <div className="space-y-4">
                        {insights.nextSteps.map((step, i) => (
                            <div key={i} className="flex items-start space-x-4 p-5 bg-[#10b981]/[0.03] rounded-2xl border border-[#10b981]/10 hover:border-[#10b981]/20 transition-all hover:translate-x-1 group">
                                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#10b981] group-hover:scale-150 group-hover:shadow-[0_0_8px_#10b981] transition-all" />
                                <span className="text-[13px] text-white/70 leading-relaxed font-semibold">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Evidence / Quotes */}
                {insights.evidence.length > 0 && (
                    <div className="space-y-6 pb-8">
                        <div className="flex items-center space-x-3 text-white/30">
                            <Zap size={16} className="text-yellow-500" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Session Evidence</span>
                        </div>
                        <div className="space-y-6">
                            {insights.evidence.map((quote, i) => (
                                <div key={i} className="flex gap-4 group cursor-pointer">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#10b981]/20 group-hover:border-[#10b981]/30 transition-all">
                                        <svg className="w-4 h-4 text-white/40 group-hover:text-[#10b981]" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <p className="text-[13px] text-white/50 leading-relaxed italic group-hover:text-white/80 transition-colors">
                                            "{quote}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="p-10 border-t border-white/5 bg-gradient-to-t from-black/60 to-transparent">
                <button className="w-full py-5 px-8 bg-white text-black font-black rounded-2xl hover:bg-white/90 active:scale-[0.97] transition-all flex items-center justify-center space-x-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                    <Send size={20} />
                    <span className="tracking-tight">Generate Parent Report</span>
                </button>
                <p className="text-[10px] text-white/20 text-center mt-6 tracking-widest uppercase font-bold">
                    Zero-Action: Synced from {insights.evidence.length} audio signals
                </p>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
