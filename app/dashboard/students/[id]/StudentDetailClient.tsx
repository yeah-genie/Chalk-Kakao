'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MasteryMatrix from '@/components/analysis/MasteryMatrix';
import PredictionPanel from '@/components/insights/PredictionPanel';
import { Topic, Subject } from '@/lib/knowledge-graph';
import { Student, Session } from '@/lib/types/database';
import {
    Zap,
    MessageSquare,
    Target,
    Award,
    Calendar,
    ArrowRight,
    Share2,
    TrendingUp,
    Brain
} from 'lucide-react';
import TopicInsightPanel from '@/components/analysis/TopicInsightPanel';
import VoiceRecorder from '@/components/monitoring/VoiceRecorder';
import LearningTrendChart from '@/components/insights/LearningTrendChart';
import { type PredictionData } from '@/lib/services/prediction';
import { generateParentReport } from '@/lib/actions/reports';

interface StudentDetailClientProps {
    student: Student;
    initialMastery: { topicId: string; score: number }[];
    subject: Subject;
    sessions: Session[];
    predictions: PredictionData;
    latestNotes?: string | null;
    masteryHistory: { date: string; score: number }[];
}

export default function StudentDetailClient({
    student,
    initialMastery,
    subject,
    sessions,
    predictions,
    latestNotes,
    masteryHistory
}: StudentDetailClientProps) {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [activeTab, setActiveTab] = useState<'insights' | 'predictions'>('insights');

    // Convert score to level for MasteryMatrix compatibility
    const masteryForMatrix = initialMastery.map(m => ({
        topicId: m.topicId,
        level: m.score
    }));

    // Combine real notes with placeholders for missing fields
    const studentInsights = {
        text: latestNotes || "No student-wide AI summary available yet. Capture a session to generate insights.",
        nextSteps: [
            "Focus on the recommended topics in the Predictions tab",
            "Review recent session evidence below",
            "Prepare for the next scheduled session"
        ],
        evidence: [],
        futureImpact: " मास्टर(Mastery) level is being tracked based on historical performance."
    };

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            const result = await generateParentReport(student.id);
            if (result.success && result.report) {
                // Copy to clipboard
                await navigator.clipboard.writeText(result.report);
                alert(`AI Parent Report Generated!\n\nThe summary has been copied to your clipboard. You can now paste it into an email or message to the parent.\n\nSummary Preview:\n${result.report.substring(0, 100)}...`);
            } else {
                alert(`Failed to generate report: ${result.error}`);
            }
        } catch (e) {
            console.error("Report generation error:", e);
            alert("An error occurred while generating the report.");
        } finally {
            setIsGeneratingReport(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col md:flex-row overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col md:ml-20 lg:ml-64 overflow-y-auto pb-24 md:pb-0">
                <header className="p-4 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between bg-white/[0.01] gap-4">
                    <div>
                        <div className="flex items-center gap-3 text-[#10b981] mb-1">
                            <Zap size={14} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Student Dashboard</span>
                        </div>
                        <h1 className="text-xl md:text-3xl font-black tracking-tighter flex flex-wrap items-center gap-2 md:gap-3">
                            {student.name}
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                {subject.name}
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleGenerateReport}
                            disabled={isGeneratingReport}
                            className="w-full md:w-auto px-4 md:px-6 py-3 bg-[#10b981] text-black font-black rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
                        >
                            {isGeneratingReport ? (
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Share2 size={16} />
                                    <span className="hidden md:inline">Generate Parent Report</span>
                                    <span className="md:hidden">Report</span>
                                </>
                            )}
                        </button>
                    </div>
                </header>

                <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                    {/* Left Column: Mastery & Analysis */}
                    <div className="lg:col-span-8 space-y-6 md:space-y-8 order-2 lg:order-1">
                        {/* Mastery Section */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity hidden md:block">
                                <Award size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2">
                                    <Target size={18} className="text-[#10b981]" />
                                    Mastery Matrix
                                </h3>
                                <div className="h-[300px] md:h-[500px] relative overflow-x-auto">
                                    <MasteryMatrix
                                        subject={subject}
                                        mastery={masteryForMatrix}
                                        onTopicClick={(topic) => setSelectedTopic(topic)}
                                        isCompact={false}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Proof of Lesson Section */}
                        <section className="space-y-4">
                            <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                                <Award size={18} className="text-[#10b981]" />
                                Proof of Lesson
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {sessions.map((session) => (
                                    <div key={session.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all cursor-pointer group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-[#71717a] text-xs">
                                                <Calendar size={12} />
                                                {new Date(session.created_at).toLocaleDateString()}
                                            </div>
                                            <span className="px-2 py-0.5 bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold rounded uppercase">
                                                {session.status}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm mb-2 group-hover:text-[#10b981] transition-colors">Session: {session.subject_id}</h4>
                                        <p className="text-xs text-[#71717a] line-clamp-2 leading-relaxed">
                                            Evidence of learning captured. Automatic transcript and mastery updates applied.
                                        </p>
                                    </div>
                                ))}
                                {sessions.length === 0 && (
                                    <div className="col-span-2 p-10 text-center border border-dashed border-white/10 rounded-2xl text-[#71717a] text-sm italic">
                                        No recorded sessions yet. Start a session to capture proof.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-4 space-y-4 md:space-y-6 order-1 lg:order-2">
                        {/* Session Capture (P0 Integration) */}
                        <div className="rounded-2xl bg-[#18181b] border border-white/5 overflow-hidden shadow-2xl">
                            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-[#10b981]" />
                                        Session Capture
                                    </h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Record to update mastery matrix</p>
                                </div>
                            </div>
                            <div className="p-2">
                                <VoiceRecorder
                                    studentId={student.id}
                                    subjectId={student.subject_id}
                                    students={[student]}
                                    className="border-none bg-transparent shadow-none"
                                />
                            </div>
                        </div>
                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
                            <button
                                onClick={() => setActiveTab('insights')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeTab === 'insights'
                                    ? 'bg-[#10b981] text-black shadow-lg shadow-[#10b981]/20'
                                    : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Zap size={14} />
                                    AI Insights
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('predictions')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeTab === 'predictions'
                                    ? 'bg-[#10b981] text-black shadow-lg shadow-[#10b981]/20'
                                    : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <TrendingUp size={14} />
                                    Predictions
                                </span>
                            </button>
                        </div>

                        {activeTab === 'insights' ? (
                            <div className="space-y-8">
                                {/* Historical Learning Trend (Phase 4.1) */}
                                <LearningTrendChart history={masteryHistory} />

                                {/* AI Tipping */}
                                <section className="bg-gradient-to-br from-[#10b981]/10 to-transparent border border-[#10b981]/20 rounded-3xl p-8 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center text-black">
                                            <Zap size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#10b981]">AI Tipping</h3>
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none mt-1">Next Session Co-pilot</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {studentInsights.nextSteps.map((step, i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#10b981]/50" />
                                                <p className="text-sm text-white/70 leading-relaxed font-medium">{step}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                                            <Target size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Growth Forecast</span>
                                        </div>
                                        <p className="text-xs text-white/50 italic leading-relaxed">
                                            &quot;{studentInsights.futureImpact}&quot;
                                        </p>
                                    </div>
                                </section>

                                {/* Parent Summary Card */}
                                <section className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-6">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                                        <MessageSquare size={16} />
                                        Parental Summary
                                    </h3>
                                    <div className="bg-[#09090b] rounded-2xl p-5 border border-white/5">
                                        <p className="text-sm text-white/80 italic leading-relaxed font-serif">
                                            &quot;{studentInsights.text}&quot;
                                        </p>
                                    </div>
                                    <button className="w-full group flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-[#71717a] hover:text-white transition-all">
                                        <span>Preview Generated Report</span>
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </section>
                            </div>
                        ) : (
                            <PredictionPanel data={predictions} />
                        )}

                        {/* Quick Stats */}
                        <section className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                                <p className="text-[10px] font-bold text-[#71717a] uppercase mb-1">Total Lessons</p>
                                <p className="text-2xl font-black text-[#10b981]">{sessions.length}</p>
                            </div>
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                                <p className="text-[10px] font-bold text-[#71717a] uppercase mb-1">Avg Score</p>
                                <p className="text-2xl font-black text-[#10b981]">
                                    {initialMastery.length > 0
                                        ? Math.round(initialMastery.reduce((acc, m) => acc + m.score, 0) / initialMastery.length)
                                        : 0}%
                                </p>
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {/* Topic Insight Overlay (Reuse Existing) */}
            <TopicInsightPanel
                topic={selectedTopic}
                onClose={() => setSelectedTopic(null)}
                masteryLevel={initialMastery.find(m => m.topicId === selectedTopic?.id)?.score || 0}
                insights={studentInsights}
            />
        </div>
    );
}
