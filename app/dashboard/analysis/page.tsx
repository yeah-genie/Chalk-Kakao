import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
    getStudents,
    getAllStudentsMasteryMap,
} from '@/lib/actions/crud';
import { getTopicPredictions } from '@/lib/services/prediction';
import Sidebar from '@/components/layout/Sidebar';
import { AlertTriangle, TrendingUp, Users, ChevronRight, Brain, Target } from 'lucide-react';

/**
 * Insights Page - All Students Overview
 * 튜터가 전체 학생 현황을 한눈에 파악
 */
export default async function InsightsPage() {
    let user = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        console.error("[InsightsPage] Error fetching user:", e);
    }

    if (!user) {
        redirect("/login");
    }

    // Fetch all students and their mastery
    const students = await getStudents();
    const masteryMap = await getAllStudentsMasteryMap();

    // Fetch predictions for all students to find alerts
    const allPredictions = await Promise.all(
        students.map(async (s) => ({
            student: s,
            predictions: await getTopicPredictions(s.id),
            mastery: masteryMap.get(s.id) || 0,
        }))
    );

    // Calculate summary stats
    const totalStudents = students.length;
    const avgMastery = totalStudents > 0
        ? Math.round(allPredictions.reduce((sum, p) => sum + p.mastery, 0) / totalStudents)
        : 0;

    // Find students needing attention (has critical or warning predictions)
    const studentsWithAlerts = allPredictions
        .map(p => ({
            ...p,
            criticalCount: p.predictions.filter(pred => pred.urgency === 'critical').length,
            warningCount: p.predictions.filter(pred => pred.urgency === 'warning').length,
        }))
        .filter(p => p.criticalCount > 0 || p.warningCount > 0)
        .sort((a, b) => (b.criticalCount * 2 + b.warningCount) - (a.criticalCount * 2 + a.warningCount));

    // Students sorted by mastery (lowest first = needs most help)
    const studentsByMastery = [...allPredictions].sort((a, b) => a.mastery - b.mastery);

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="md:ml-20 lg:ml-64 p-4 md:p-6 lg:p-8 pb-24 md:pb-10">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <div className="flex items-center gap-2 text-[#10b981] mb-1">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Student Insights</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold">All Students Overview</h1>
                    <p className="text-[#71717a] text-xs md:text-sm">Monitor progress and identify who needs attention</p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a]">
                        <div className="flex items-center gap-2 text-[#71717a] mb-2">
                            <Users size={14} />
                            <span className="text-xs">Total Students</span>
                        </div>
                        <p className="text-2xl font-bold">{totalStudents}</p>
                    </div>
                    <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a]">
                        <div className="flex items-center gap-2 text-[#71717a] mb-2">
                            <Target size={14} />
                            <span className="text-xs">Avg. Mastery</span>
                        </div>
                        <p className={`text-2xl font-bold ${avgMastery >= 70 ? 'text-emerald-400' : avgMastery >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {avgMastery}%
                        </p>
                    </div>
                    <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a]">
                        <div className="flex items-center gap-2 text-[#71717a] mb-2">
                            <AlertTriangle size={14} />
                            <span className="text-xs">Need Attention</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-400">{studentsWithAlerts.length}</p>
                    </div>
                    <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a]">
                        <div className="flex items-center gap-2 text-[#71717a] mb-2">
                            <Brain size={14} />
                            <span className="text-xs">At Risk Topics</span>
                        </div>
                        <p className="text-2xl font-bold text-red-400">
                            {allPredictions.reduce((sum, p) => sum + p.predictions.filter(pred => pred.urgency === 'critical').length, 0)}
                        </p>
                    </div>
                </div>

                {/* Class Performance Distribution (Phase 4.2) */}
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-[#10b981]/10 to-transparent border border-[#10b981]/20">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-white mb-1">Class Mastery Distribution</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Peer Performance Analysis</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-[10px] text-white/40 font-bold uppercase">High (70+)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-[10px] text-white/40 font-bold uppercase">Med (40-70)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-[10px] text-white/40 font-bold uppercase">Low (&lt;40)</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-4 flex rounded-full overflow-hidden bg-white/5">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${(allPredictions.filter(p => p.mastery >= 70).length / Math.max(1, totalStudents)) * 100}%` }}
                        ></div>
                        <div
                            className="h-full bg-yellow-500 transition-all duration-1000"
                            style={{ width: `${(allPredictions.filter(p => p.mastery >= 40 && p.mastery < 70).length / Math.max(1, totalStudents)) * 100}%` }}
                        ></div>
                        <div
                            className="h-full bg-red-500 transition-all duration-1000"
                            style={{ width: `${(allPredictions.filter(p => p.mastery < 40).length / Math.max(1, totalStudents)) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Priority Attention List */}
                    <div className="rounded-xl bg-[#18181b] border border-[#27272a] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#27272a] flex items-center gap-2">
                            <AlertTriangle size={16} className="text-yellow-400" />
                            <h2 className="font-semibold">Priority Attention</h2>
                        </div>
                        <div className="divide-y divide-[#27272a]">
                            {studentsWithAlerts.length > 0 ? (
                                studentsWithAlerts.slice(0, 5).map((item) => (
                                    <Link
                                        key={item.student.id}
                                        href={`/dashboard/students/${item.student.id}`}
                                        className="flex items-center justify-between p-4 hover:bg-[#1f1f23] transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#27272a] rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium">{item.student.name[0]}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.student.name}</p>
                                                <p className="text-xs text-[#71717a]">{item.student.subject_id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {item.criticalCount > 0 && (
                                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-bold">
                                                    {item.criticalCount} critical
                                                </span>
                                            )}
                                            {item.warningCount > 0 && (
                                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-bold">
                                                    {item.warningCount} warning
                                                </span>
                                            )}
                                            <ChevronRight size={16} className="text-[#3f3f46]" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-8 text-center text-[#71717a]">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Target size={24} className="text-emerald-400" />
                                    </div>
                                    <p className="font-medium text-emerald-400">All Students On Track</p>
                                    <p className="text-sm mt-1">No immediate attention needed</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mastery Leaderboard */}
                    <div className="rounded-xl bg-[#18181b] border border-[#27272a] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#27272a] flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#10b981]" />
                            <h2 className="font-semibold">Mastery Ranking</h2>
                        </div>
                        <div className="divide-y divide-[#27272a]">
                            {studentsByMastery.length > 0 ? (
                                studentsByMastery.map((item, index) => (
                                    <Link
                                        key={item.student.id}
                                        href={`/dashboard/students/${item.student.id}`}
                                        className="flex items-center justify-between p-4 hover:bg-[#1f1f23] transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                                index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                    index === 2 ? 'bg-amber-600/20 text-amber-600' :
                                                        'bg-[#27272a] text-[#71717a]'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="w-10 h-10 bg-[#27272a] rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium">{item.student.name[0]}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.student.name}</p>
                                                <p className="text-xs text-[#71717a]">{item.student.subject_id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className={`font-bold ${item.mastery >= 70 ? 'text-emerald-400' :
                                                    item.mastery >= 50 ? 'text-yellow-400' :
                                                        item.mastery >= 30 ? 'text-orange-400' : 'text-red-400'
                                                    }`}>
                                                    {item.mastery}%
                                                </p>
                                            </div>
                                            <ChevronRight size={16} className="text-[#3f3f46]" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-8 text-center text-[#71717a]">
                                    <p>No students yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Action */}
                {students.length === 0 && (
                    <div className="mt-8 p-8 rounded-xl border border-dashed border-[#27272a] text-center">
                        <p className="text-[#71717a] mb-4">Add students to see insights</p>
                        <Link
                            href="/dashboard/students"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#10b981] text-black rounded-lg font-medium text-sm"
                        >
                            <Users size={16} />
                            Go to Students
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
