'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Student, StudentAnalytics } from '@/lib/supabase/types';

interface StudentWithAnalytics extends Student {
    analytics: StudentAnalytics | null;
}

export default function AnalyticsPage() {
    const t = useTranslations('analytics');
    const tCommon = useTranslations('common');
    const [students, setStudents] = useState<StudentWithAnalytics[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentWithAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        totalStudents: 0,
        activeStudents: 0,
        totalLessonsThisMonth: 0,
        avgUnderstandingScore: 0,
    });
    const supabase = createClient();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get students
        const { data: studentsData } = await supabase
            .from('students')
            .select('*')
            .eq('tutor_id', user.id)
            .order('name');

        if (!studentsData) {
            setLoading(false);
            return;
        }

        // Get analytics for each student
        const studentIds = studentsData.map(s => s.id);
        const { data: analyticsData } = await supabase
            .from('student_analytics')
            .select('*')
            .in('student_id', studentIds);

        const analyticsMap = new Map(
            (analyticsData || []).map(a => [a.student_id, a])
        );

        const studentsWithAnalytics: StudentWithAnalytics[] = studentsData.map(s => ({
            ...s,
            analytics: analyticsMap.get(s.id) || null,
        }));

        setStudents(studentsWithAnalytics);
        if (studentsWithAnalytics.length > 0) {
            setSelectedStudent(studentsWithAnalytics[0]);
        }

        // Calculate summary
        const activeStudents = studentsWithAnalytics.filter(s => s.status === 'active');
        const scores = studentsWithAnalytics
            .filter(s => s.analytics?.understanding_trend?.length)
            .map(s => s.analytics!.understanding_trend[s.analytics!.understanding_trend.length - 1]);

        // Get this month's logs
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: monthlyLogs } = await supabase
            .from('logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('lesson_date', startOfMonth.toISOString().split('T')[0]);

        setSummary({
            totalStudents: studentsWithAnalytics.length,
            activeStudents: activeStudents.length,
            totalLessonsThisMonth: monthlyLogs || 0,
            avgUnderstandingScore: scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 0,
        });

        setLoading(false);
    }

    const getProgressColor = (trend: number[] | undefined): string => {
        if (!trend || trend.length < 2) return 'text-zinc-400';
        const recent = trend[trend.length - 1];
        const previous = trend[trend.length - 2];
        if (recent > previous + 5) return 'text-emerald-400';
        if (recent < previous - 5) return 'text-red-400';
        return 'text-zinc-400';
    };

    const getProgressIcon = (trend: number[] | undefined): string => {
        if (!trend || trend.length < 2) return '→';
        const recent = trend[trend.length - 1];
        const previous = trend[trend.length - 2];
        if (recent > previous + 5) return '↑';
        if (recent < previous - 5) return '↓';
        return '→';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050506] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[#050506]" />
                <div className="absolute top-[-20%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-500/[0.02] blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.015] blur-[100px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#050506]/80 backdrop-blur-2xl border-b border-white/[0.04]">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-[14px] font-medium">대시보드</span>
                    </Link>
                    <span className="text-[15px] font-semibold text-white">학생 분석</span>
                    <div className="w-20" />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                {/* Summary Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
                >
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-[12px] text-zinc-500 mb-1">전체 학생</p>
                        <p className="text-2xl font-bold text-white">{summary.totalStudents}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-[12px] text-zinc-500 mb-1">활성 학생</p>
                        <p className="text-2xl font-bold text-emerald-400">{summary.activeStudents}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-[12px] text-zinc-500 mb-1">이번 달 수업</p>
                        <p className="text-2xl font-bold text-white">{summary.totalLessonsThisMonth}회</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-[12px] text-zinc-500 mb-1">평균 이해도</p>
                        <p className="text-2xl font-bold text-purple-400">{summary.avgUnderstandingScore}점</p>
                    </div>
                </motion.div>

                {students.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-white font-medium mb-2">학생이 없습니다</p>
                        <p className="text-zinc-500 text-sm mb-6">학생을 추가하고 수업을 기록하면 분석 데이터가 표시됩니다</p>
                        <Link
                            href="/dashboard/students"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            학생 추가하기
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Student List */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-1"
                        >
                            <h2 className="text-[14px] font-semibold text-zinc-400 mb-4">학생 목록</h2>
                            <div className="space-y-2">
                                {students.map((student) => (
                                    <button
                                        key={student.id}
                                        onClick={() => setSelectedStudent(student)}
                                        className={`w-full p-4 rounded-xl text-left transition-all ${selectedStudent?.id === student.id
                                                ? 'bg-purple-500/10 border border-purple-500/30'
                                                : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[14px] font-medium text-white">{student.name}</p>
                                                <p className="text-[12px] text-zinc-500">{student.subject} · {student.grade}</p>
                                            </div>
                                            <span className={`text-lg ${getProgressColor(student.analytics?.understanding_trend)}`}>
                                                {getProgressIcon(student.analytics?.understanding_trend)}
                                            </span>
                                        </div>
                                        {student.analytics && (
                                            <div className="mt-3 flex gap-4 text-[11px]">
                                                <span className="text-zinc-500">
                                                    수업 <span className="text-white">{student.analytics.total_lessons}회</span>
                                                </span>
                                                <span className="text-zinc-500">
                                                    이해도 <span className="text-purple-400">
                                                        {student.analytics.understanding_trend?.length
                                                            ? student.analytics.understanding_trend[student.analytics.understanding_trend.length - 1]
                                                            : '-'}
                                                    </span>
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Student Detail */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-2"
                        >
                            {selectedStudent ? (
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/20">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-white">{selectedStudent.name}</h2>
                                                <p className="text-zinc-400 text-sm mt-1">
                                                    {selectedStudent.subject} · {selectedStudent.grade}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedStudent.status === 'active'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-zinc-500/20 text-zinc-400'
                                                }`}>
                                                {selectedStudent.status === 'active' ? '활성' : '일시정지'}
                                            </span>
                                        </div>

                                        {selectedStudent.analytics ? (
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-[11px] text-zinc-500 mb-1">총 수업</p>
                                                    <p className="text-lg font-bold text-white">
                                                        {selectedStudent.analytics.total_lessons}회
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] text-zinc-500 mb-1">누적 시간</p>
                                                    <p className="text-lg font-bold text-white">
                                                        {selectedStudent.analytics.total_hours}시간
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] text-zinc-500 mb-1">성장률</p>
                                                    <p className={`text-lg font-bold ${selectedStudent.analytics.improvement_rate > 0
                                                            ? 'text-emerald-400'
                                                            : selectedStudent.analytics.improvement_rate < 0
                                                                ? 'text-red-400'
                                                                : 'text-zinc-400'
                                                        }`}>
                                                        {selectedStudent.analytics.improvement_rate > 0 ? '+' : ''}
                                                        {selectedStudent.analytics.improvement_rate}%
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-zinc-500 text-sm">수업 데이터가 충분하지 않습니다</p>
                                        )}
                                    </div>

                                    {selectedStudent.analytics && (
                                        <>
                                            {/* Understanding Trend */}
                                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                                                <h3 className="text-[13px] font-medium text-zinc-400 mb-4">이해도 추세</h3>
                                                <div className="flex items-end gap-1 h-24">
                                                    {(selectedStudent.analytics.understanding_trend || []).map((score, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex-1 bg-gradient-to-t from-purple-500/30 to-purple-500/10 rounded-t"
                                                            style={{ height: `${score}%` }}
                                                        />
                                                    ))}
                                                    {selectedStudent.analytics.understanding_trend?.length === 0 && (
                                                        <p className="text-zinc-600 text-sm w-full text-center">데이터 없음</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Strengths & Areas to Improve */}
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                                                    <h3 className="text-[13px] font-medium text-emerald-400 mb-3">강점</h3>
                                                    {selectedStudent.analytics.strengths?.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {selectedStudent.analytics.strengths.map((strength, i) => (
                                                                <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                    {strength}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-zinc-600 text-sm">분석 중...</p>
                                                    )}
                                                </div>
                                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                                                    <h3 className="text-[13px] font-medium text-orange-400 mb-3">개선 영역</h3>
                                                    {selectedStudent.analytics.areas_to_improve?.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {selectedStudent.analytics.areas_to_improve.map((area, i) => (
                                                                <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                                    {area}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-zinc-600 text-sm">분석 중...</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Common Struggles */}
                                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                                                <h3 className="text-[13px] font-medium text-zinc-400 mb-3">자주 어려워하는 부분</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedStudent.analytics.common_struggles?.map((item, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                                                        >
                                                            {item.tag} ({item.count})
                                                        </span>
                                                    ))}
                                                    {(!selectedStudent.analytics.common_struggles || selectedStudent.analytics.common_struggles.length === 0) && (
                                                        <p className="text-zinc-600 text-sm">데이터 수집 중...</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Recommendations */}
                                            {selectedStudent.analytics.next_focus_areas?.length > 0 && (
                                                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
                                                    <h3 className="text-[13px] font-medium text-cyan-400 mb-3">AI 추천</h3>
                                                    <ul className="space-y-2">
                                                        {selectedStudent.analytics.next_focus_areas.map((rec, i) => (
                                                            <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                                                                <span className="text-cyan-400">→</span>
                                                                {rec}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {selectedStudent.analytics.suggested_approach && (
                                                        <p className="mt-4 text-sm text-zinc-400 italic">
                                                            "{selectedStudent.analytics.suggested_approach}"
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-zinc-500">
                                    학생을 선택해주세요
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}
