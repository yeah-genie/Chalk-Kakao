import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStudents, getSessions, getAllStudentsMasteryMap } from "@/lib/actions/crud";
import { AP_CALCULUS_AB, getUnits, getTopicsByUnit } from "@/lib/knowledge-graph";
import Sidebar from "@/components/layout/Sidebar";
import VoiceRecorder from "@/components/monitoring/VoiceRecorder";
import { TaxonomyProposalBanner } from "@/components/dashboard/TaxonomyProposalBanner";

// ===================================
// CHALK DASHBOARD (Server Component)
// ===================================

function getScoreColor(score: number): string {
    if (score >= 80) return "bg-[#22c55e]";
    if (score >= 60) return "bg-[#10b981]";
    if (score >= 40) return "bg-[#f59e0b]";
    if (score >= 20) return "bg-[#ef4444]";
    return "bg-[#3f3f46]";
}

function getScoreTextColor(score: number): string {
    if (score >= 80) return "text-[#22c55e]";
    if (score >= 60) return "text-[#10b981]";
    if (score >= 40) return "text-[#f59e0b]";
    if (score >= 20) return "text-[#ef4444]";
    return "text-[#71717a]";
}

export default async function Dashboard() {
    let user = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        console.error("[Dashboard] Error fetching user:", e);
    }

    if (!user) {
        redirect("/login");
    }

    // Fetch data
    const students = await getStudents();
    const sessions = await getSessions();
    const masteryMap = await getAllStudentsMasteryMap();

    const calcUnits = students.length > 0 ? getUnits(AP_CALCULUS_AB) : []; // Default or placeholder
    const firstStudentSubject = students.length > 0 ? students[0].subject_id : "No Subject";

    // Calculate stats
    const totalStudents = students.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;

    // Calculate real average mastery across all students
    let avgMastery = 0;
    if (students.length > 0) {
        const masteries = students.map(s => masteryMap.get(s.id) || 0);
        avgMastery = Math.round(masteries.reduce((a, b) => a + b, 0) / students.length);
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            {/* Main Content */}
            <main className="md:ml-20 lg:ml-64 p-4 md:p-6 lg:p-10 pb-24 md:pb-10">
                {/* Header & Status */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">Welcome Back</h1>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
                                <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">Trust Engine Active</span>
                            </div>
                            <p className="text-[#a1a1aa] text-sm">You teach. Your Invisible Scribe handles the rest.</p>
                        </div>
                    </div>

                    {/* Primary Hero Action (Zero-Action) */}
                    <button className="group relative px-6 py-4 bg-[#10b981] text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-[0.98] shadow-[0_8px_32px_rgba(16,185,129,0.25)] flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        Connect AI Scribe
                    </button>
                </div>

                <TaxonomyProposalBanner />

                {/* Performance Snapshot */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
                        <p className="text-[#71717a] text-[10px] font-black uppercase tracking-widest mb-3">Managed Minds</p>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-black">{totalStudents}</p>
                            <span className="text-[10px] text-[#10b981] font-bold">+2 this week</span>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
                        <p className="text-[#71717a] text-[10px] font-black uppercase tracking-widest mb-3">AI Scribed</p>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-black uppercase">{completedSessions}</p>
                            <span className="text-[10px] text-[#a1a1aa] font-bold">Sessions Processed</span>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
                        <p className="text-[#71717a] text-[10px] font-black uppercase tracking-widest mb-3">Global Mastery</p>
                        <div className="flex items-end justify-between">
                            <p className={`text-3xl font-black ${getScoreTextColor(avgMastery)}`}>{avgMastery}%</p>
                            <div className="w-16 h-1 px-1 bg-white/5 rounded-full overflow-hidden mb-2">
                                <div className={`h-full ${getScoreColor(avgMastery)}`} style={{ width: `${avgMastery}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-[#10b981]/5 border border-[#10b981]/20 hover:bg-[#10b981]/10 transition-all">
                        <p className="text-[#10b981] text-[10px] font-black uppercase tracking-widest mb-3">System Health</p>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-black">99.9%</p>
                            <span className="text-[10px] text-[#10b981] font-bold">Local-First</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Students List */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <div className="rounded-2xl md:rounded-xl bg-white/[0.02] md:bg-[#18181b] border border-white/[0.05] md:border-[#27272a] overflow-hidden">
                            <div className="px-4 md:px-5 py-4 border-b border-white/[0.05] md:border-[#27272a] flex items-center justify-between">
                                <h2 className="font-bold text-sm md:text-base">Recent Students</h2>
                                <Link href="/dashboard/students" className="text-xs md:text-sm text-[#10b981] font-medium">View All</Link>
                            </div>
                            <div className="divide-y divide-white/[0.05] md:divide-[#27272a]">
                                {students.slice(0, 5).map((student) => {
                                    const studentMastery = masteryMap.get(student.id) || 0;
                                    return (
                                        <Link
                                            key={student.id}
                                            href={`/dashboard/students/${student.id}`}
                                            className="flex items-center justify-between p-4 md:p-5 hover:bg-white/[0.02] md:hover:bg-[#1f1f23] transition active:bg-white/[0.04]"
                                        >
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="w-9 h-9 md:w-10 md:h-10 bg-[#27272a] rounded-full flex items-center justify-center">
                                                    <span className="text-xs md:text-sm font-medium">{student.name[0]}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm md:text-base">{student.name}</p>
                                                    <p className="text-xs md:text-sm text-[#71717a]">{student.subject_id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 md:gap-6">
                                                <div className="text-right">
                                                    <p className={`font-bold text-sm md:text-base ${getScoreTextColor(studentMastery)}`}>{studentMastery}%</p>
                                                </div>
                                                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#3f3f46]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </Link>
                                    );
                                })}
                                {students.length === 0 && (
                                    <div className="p-8 md:p-10 text-center text-[#71717a] text-sm">
                                        No students yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Session Recorder - On top for mobile */}
                    <div className="order-1 lg:order-2 space-y-4 md:space-y-6">
                        <div className="rounded-2xl md:rounded-xl bg-white/[0.02] md:bg-[#18181b] border border-white/[0.05] md:border-[#27272a] overflow-hidden">
                            <div className="px-4 md:px-5 py-3 md:py-4 border-b border-white/[0.05] md:border-[#27272a]">
                                <h2 className="font-bold text-sm md:text-base">Quick AI Scribe</h2>
                                <p className="text-[10px] md:text-xs text-[#71717a] mt-1">Capture session to update mastery</p>
                            </div>
                            <div className="p-2">
                                {students.length > 0 ? (
                                    <VoiceRecorder
                                        className="border-none bg-transparent shadow-none"
                                        students={students}
                                        studentId={students[0].id}
                                        subjectId={students[0].subject_id}
                                    />
                                ) : (
                                    <div className="p-6 text-center text-xs text-[#71717a] italic">
                                        Add a student to enable session recording
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mastery Overview - Hidden on mobile, shown on larger screens */}
                        <div className="hidden md:block rounded-xl bg-[#18181b] border border-[#27272a]">
                            <div className="px-5 py-4 border-b border-[#27272a]">
                                <h2 className="font-semibold">Student Progress</h2>
                                <p className="text-xs text-[#71717a] mt-1">
                                    {students.length > 0 ? `${students[0].name} - ${students[0].subject_id}` : "Select a student"}
                                </p>
                            </div>
                            <div className="p-5 space-y-3">
                                {calcUnits.length > 0 ? (
                                    calcUnits.slice(0, 5).map((unit) => {
                                        const score = 0;
                                        const topics = getTopicsByUnit(AP_CALCULUS_AB, unit.id);

                                        return (
                                            <div key={unit.id} className="group cursor-default">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm truncate pr-2 group-hover:text-white transition-colors">{unit.name}</span>
                                                    <span className={`text-xs font-semibold ${getScoreTextColor(score)}`}>{score}%</span>
                                                </div>
                                                <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getScoreColor(score)} transition-all duration-500`}
                                                        style={{ width: `${score}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-[#52525b] mt-1 font-bold uppercase tracking-widest">{topics.length} topics</p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-10 text-center text-[#71717a] text-sm italic">
                                        Add students to see progress.
                                    </div>
                                )}
                            </div>
                            {students.length > 0 && (
                                <div className="px-5 py-4 border-t border-[#27272a]">
                                    <Link
                                        href="/dashboard/analysis"
                                        className="text-[10px] font-black text-[#10b981] uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5"
                                    >
                                        Full Analysis Matrix
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

