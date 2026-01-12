"use client";

import React from 'react';
import {
    TrendingUp,
    AlertCircle,
    Zap,
    Target,
    Clock,
    ShieldAlert,
    Brain,
    ArrowRight,
    Check
} from 'lucide-react';
import { type PredictionData } from '@/lib/services/prediction';

interface PredictionPanelProps {
    data: PredictionData;
}

export default function PredictionPanel({ data }: PredictionPanelProps) {
    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* 1. Next Session Recommendation */}
            <div className="p-6 bg-[#10b981]/5 border border-[#10b981]/20 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center text-black">
                        <Zap size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#10b981]">Recommended Focus</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">AI Lesson Plan Co-pilot</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-lg font-bold text-white tracking-tight">{data.nextSessionRecommendation.topicName}</p>
                    <p className="text-xs text-white/60 leading-relaxed italic">
                        "{data.nextSessionRecommendation.reason}"
                    </p>
                </div>
            </div>

            {/* 1.1 Adaptive Learning Path (Phase 4.2) */}
            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#71717a] mb-6 flex items-center gap-2">
                    <ArrowRight size={14} />
                    Adaptive Learning Road-map
                </h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                    <div className="relative">
                        <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center text-black z-10">
                            <Check size={12} strokeWidth={3} />
                        </div>
                        <p className="text-xs font-bold text-white/90">{data.nextSessionRecommendation.topicName}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">Current Focus</p>
                    </div>
                    <div className="relative opacity-50">
                        <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/40 z-10 border border-white/5">
                            <span className="text-[10px] font-black">2</span>
                        </div>
                        <p className="text-xs font-bold text-white/90">Advanced Application & Synthesis</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">Locked (Pending Mastery)</p>
                    </div>
                </div>
            </div>

            {/* 2. Progress Forecast */}
            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#71717a] mb-6 flex items-center gap-2">
                    <Target size={14} />
                    Mastery Progress Forecast
                </h4>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                            <span className="text-white/40">Current Path</span>
                            <span className="text-[#10b981]">{data.progressForecast.currentMastery}% / {data.progressForecast.targetMastery}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#10b981] transition-all duration-1000"
                                style={{ width: `${data.progressForecast.currentMastery}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-white/40 mb-1">
                                <Clock size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Est. Sessions</span>
                            </div>
                            <p className="text-xl font-black text-[#10b981]">{data.progressForecast.estimatedSessionsNeeded}</p>
                        </div>
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-white/40 mb-1">
                                <TrendingUp size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Velocity</span>
                            </div>
                            <p className="text-xl font-black text-[#10b981] uppercase text-[14px]">{data.progressForecast.velocity}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Adaptive Learning Roadmap (Phase 4.2) */}
            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#71717a] mb-6 flex items-center gap-2">
                    <ArrowRight size={14} />
                    Adaptive Roadmap
                </h4>
                <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                    {/* Stage 1: Current Focus */}
                    <div className="relative pl-8">
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center text-black z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <Check size={12} strokeWidth={3} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-white/90">{data.nextSessionRecommendation.topicName}</p>
                            <p className="text-[10px] text-[#10b981] font-black uppercase tracking-widest">Active Focus</p>
                            <p className="text-[10px] text-white/40 leading-relaxed italic mt-2">
                                &quot;{data.nextSessionRecommendation.reason.substring(0, 100)}...&quot;
                            </p>
                        </div>
                    </div>

                    {/* Stage 2: Complexity Increment */}
                    <div className="relative pl-8 opacity-40 grayscale-[0.5]">
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/40 z-10">
                            <span className="text-[10px] font-black">2</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-white/90">Multivariable Integration & Solids</p>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Upcoming Milestone</p>
                        </div>
                    </div>

                    {/* Stage 3: Project Synergy */}
                    <div className="relative pl-8 opacity-20 grayscale">
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 z-10">
                            <span className="text-[10px] font-black">3</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-white/90">Real-world Kinematics Project</p>
                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Synthesis Goal</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Retention Alerts (Forgetting Curve) */}
            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#71717a] mb-4 flex items-center gap-2">
                    <Brain size={14} />
                    Memory Retention Risk
                </h4>
                <div className="space-y-3">
                    {data.retentionAlerts.map((alert, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={14} className={alert.urgency === 'critical' ? 'text-rose-500' : 'text-amber-500'} />
                                <span className="text-xs font-medium text-white/80">{alert.topicName}</span>
                            </div>
                            <span className="text-[10px] font-bold text-white/40">{alert.predictedScore}% Score</span>
                        </div>
                    ))}
                    {data.retentionAlerts.length === 0 && (
                        <p className="text-[10px] text-[#71717a] italic">All topics stable. No immediate review needed.</p>
                    )}
                </div>
            </div>

            {/* 4. Weakness Analysis */}
            <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 mb-4 flex items-center gap-2">
                    <ShieldAlert size={14} />
                    Weakness Analysis
                </h4>
                <div className="space-y-4">
                    {data.weaknessPatterns.map((p, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-500 text-[8px] font-black uppercase rounded tracking-tighter">
                                    {p.pattern.replace('_', ' ')}
                                </span>
                                <span className="text-xs font-bold text-white/90">{p.topicName}</span>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed">{p.details}</p>
                        </div>
                    ))}
                    {data.weaknessPatterns.length === 0 && (
                        <p className="text-[10px] text-[#71717a] italic tracking-widest uppercase">No critical weakness patterns detected.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
