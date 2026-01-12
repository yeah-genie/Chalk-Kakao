import React from 'react';
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CheckCircle2, AlertCircle, Target, TrendingUp, Mic, Brain } from 'lucide-react';
import { cn } from "@/lib/utils";
import { AP_SUBJECTS } from "@/lib/knowledge-graph";
import InteractiveTranscript from '@/components/sessions/InteractiveTranscript';

export default async function ReportPage({ params }: { params: { sessionId: string } }) {
    const supabase = await createServerSupabaseClient();

    // Fetch Session and related data
    const { data: session, error } = await supabase
        .from('sessions')
        .select(`
            *,
            students (name, subject_id),
            session_topics (*)
        `)
        .eq('id', params.sessionId)
        .single();

    if (error || !session) {
        return <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center p-10 text-center">
            <div>
                <h1 className="text-2xl font-black mb-2">Report Not Found</h1>
                <p className="text-white/40">This report may have been removed or is no longer accessible.</p>
            </div>
        </div>;
    }

    const { students, session_topics } = session;
    const subject = AP_SUBJECTS.find(s => s.id === students.subject_id);

    return (
        <div className="min-h-screen bg-[#050510] text-white font-sans selection:bg-[#10b981]/30">
            {/* Header / Branding */}
            <div className="max-w-4xl mx-auto pt-20 pb-12 px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-[#10b981] p-1.5 rounded-lg">
                                <TrendingUp size={20} className="text-black" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#10b981]">Learning Report</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter leading-none">
                            {students.name}'s <br />
                            <span className="text-[#10b981]">Progress</span>
                        </h1>
                        <p className="text-white/40 font-bold uppercase tracking-widest text-[11px]">
                            {subject?.name} • {new Date(session.scheduled_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto pb-32 px-6 space-y-6">
                {/* AI Summary Section */}
                <div className="bg-[#18181b] border border-[#27272a] rounded-[2rem] p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-[#10b981]/10 transition-colors">
                        <Brain size={120} />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-white/30 mb-6 flex items-center gap-2">
                        <Target size={14} /> The Verdict
                    </h2>
                    <p className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-white mb-8 relative z-10">
                        {session.notes || "The AI is still processing the fine details of this session."}
                    </p>
                    <div className="flex items-center gap-2 text-[#10b981] font-bold text-sm">
                        <Mic size={16} />
                        Recorded Analysis Powered by Gemini
                    </div>
                </div>

                {/* Interactive Transcript Section (P1) */}
                <InteractiveTranscript
                    recordingUrl={session.recording_url}
                    segments={session.transcript_segments}
                />

                {/* Topics Covered Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {session_topics.map((st: any) => {
                        const topicInfo = subject?.topics.find(t => t.id === st.topic_id);
                        return (
                            <div key={st.id} className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-full">
                                        {st.status_after}
                                    </span>
                                    <Target size={20} className="text-white/10" />
                                </div>
                                <h3 className="text-xl font-bold leading-snug">{topicInfo?.name || st.topic_id}</h3>
                                {st.evidence && (
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5 italic text-sm text-white/60 leading-relaxed">
                                        "{st.evidence}"
                                    </div>
                                )}
                                {st.future_impact && (
                                    <div className="flex gap-3 text-amber-500/80 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                                        <AlertCircle size={18} className="shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest">Future Impact</p>
                                            <p className="text-xs leading-relaxed font-semibold">{st.future_impact}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footnote */}
                <div className="pt-12 text-center">
                    <p className="text-white/20 text-xs font-bold uppercase tracking-[0.2em]">
                        Chalk Intelligence System • End of Session Report
                    </p>
                </div>
            </main>
        </div>
    );
}
