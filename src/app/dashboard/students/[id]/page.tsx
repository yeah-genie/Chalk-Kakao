'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { studentAnalyticsService } from '@/services/analytics/StudentAnalyticsService';
import type { Student, StudentAnalytics, LessonLog } from '@/lib/supabase/types';
import type { StudentGrowthData } from '@/services/analytics/StudentAnalyticsService';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function StudentDetailPage({ params }: PageProps) {
    const t = useTranslations('studentDetail');
    const tCommon = useTranslations('common');
    const { id: studentId } = use(params);
    const [student, setStudent] = useState<Student | null>(null);
    const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
    const [growthData, setGrowthData] = useState<StudentGrowthData | null>(null);
    const [recentLogs, setRecentLogs] = useState<LessonLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notifyMessage, setNotifyMessage] = useState('');
    const [notifying, setNotifying] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        loadStudentData();
    }, [studentId]);

    const loadStudentData = async () => {
        setIsLoading(true);

        try {
            // Load student profile with analytics
            const profile = await studentAnalyticsService.getStudentProfile(studentId);

            if (profile) {
                setStudent(profile.student);
                setAnalytics(profile.analytics);
                setGrowthData(profile.growthData);
                setRecentLogs(profile.recentLogs);
            }
        } catch (error) {
            console.error('Failed to load student data:', error);
        }

        setIsLoading(false);
    };

    const refreshAnalytics = async () => {
        const updated = await studentAnalyticsService.updateStudentAnalytics(studentId);
        if (updated) {
            setAnalytics(updated);
            loadStudentData();
        }
    };

    const handleNotifyParent = async () => {
        if (!student?.parent_contact || !notifyMessage.trim()) return;

        setNotifying(true);

        try {
            const res = await fetch('/api/notify-parent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    parentContact: student.parent_contact,
                    message: notifyMessage,
                }),
            });

            if (res.ok) {
                setShowNotifyModal(false);
                setNotifyMessage('');
                alert('알림이 전송되었습니다.');
            } else {
                alert('알림 전송에 실패했습니다.');
            }
        } catch {
            alert('알림 전송에 실패했습니다.');
        }

        setNotifying(false);
    };

    const getProgressColor = (progress: string) => {
        switch (progress) {
            case 'improving': return 'text-emerald-400 bg-emerald-500/10';
            case 'stable': return 'text-blue-400 bg-blue-500/10';
            case 'needs-attention': return 'text-red-400 bg-red-500/10';
            default: return 'text-zinc-400 bg-zinc-500/10';
        }
    };

    const getProgressLabel = (progress: string) => {
        switch (progress) {
            case 'improving': return '성장 중';
            case 'stable': return '안정적';
            case 'needs-attention': return '관심 필요';
            default: return '분석 중';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050506] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-500">학생 정보 로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-[#050506] text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-zinc-500 mb-4">학생을 찾을 수 없습니다</p>
                    <Link href="/dashboard/students" className="text-emerald-400 hover:underline">
                        학생 목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050506] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#050506]/80 backdrop-blur-2xl border-b border-white/[0.04]">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/students" className="text-zinc-500 hover:text-white transition">
                            ← 학생 목록
                        </Link>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={refreshAnalytics}
                            className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-sm transition"
                        >
                            분석 업데이트
                        </button>
                        {student.parent_contact && (
                            <button
                                onClick={() => setShowNotifyModal(true)}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition"
                            >
                                학부모 알림
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Student Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-start gap-5">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold ${
                            student.status === 'active'
                                ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                                : 'bg-zinc-700'
                        }`}>
                            {student.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold">{student.name}</h1>
                                {growthData && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProgressColor(growthData.recentProgress)}`}>
                                        {getProgressLabel(growthData.recentProgress)}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-4 text-zinc-400">
                                {student.subject && <span>{student.subject}</span>}
                                {student.grade && <span>· {student.grade}</span>}
                            </div>
                            {student.goal && (
                                <p className="mt-2 text-sm text-zinc-500">목표: {student.goal}</p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-4 gap-4 mb-8"
                >
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-xs text-zinc-500 mb-1">총 수업</p>
                        <p className="text-2xl font-bold">{analytics?.total_lessons || 0}회</p>
                    </div>
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-xs text-zinc-500 mb-1">총 시간</p>
                        <p className="text-2xl font-bold">{analytics?.total_hours || 0}시간</p>
                    </div>
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-xs text-zinc-500 mb-1">이해도</p>
                        <p className="text-2xl font-bold text-emerald-400">
                            {analytics?.understanding_trend?.slice(-1)[0] || '-'}점
                        </p>
                    </div>
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-xs text-zinc-500 mb-1">성장률</p>
                        <p className={`text-2xl font-bold ${(analytics?.improvement_rate || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {(analytics?.improvement_rate || 0) >= 0 ? '+' : ''}{analytics?.improvement_rate || 0}%
                        </p>
                    </div>
                </motion.div>

                {/* Understanding Trend Chart */}
                {analytics?.understanding_trend && analytics.understanding_trend.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-8"
                    >
                        <h3 className="text-sm font-medium text-zinc-400 mb-4">이해도 추이</h3>
                        <div className="h-32 flex items-end gap-2">
                            {analytics.understanding_trend.map((score, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-gradient-to-t from-emerald-500 to-cyan-500 rounded-t transition-all"
                                        style={{ height: `${score}%` }}
                                    />
                                    <span className="text-[10px] text-zinc-600 mt-1">{score}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Strengths & Areas to Improve */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
                    >
                        <h3 className="text-sm font-medium text-emerald-400 mb-3">강점</h3>
                        {analytics?.strengths && analytics.strengths.length > 0 ? (
                            <ul className="space-y-2">
                                {analytics.strengths.map((strength, i) => (
                                    <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                                        <span className="text-emerald-400">+</span>
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-zinc-600">아직 분석 데이터가 부족합니다</p>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="p-5 rounded-xl bg-orange-500/5 border border-orange-500/10"
                    >
                        <h3 className="text-sm font-medium text-orange-400 mb-3">개선 필요</h3>
                        {analytics?.areas_to_improve && analytics.areas_to_improve.length > 0 ? (
                            <ul className="space-y-2">
                                {analytics.areas_to_improve.map((area, i) => (
                                    <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                                        <span className="text-orange-400">!</span>
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-zinc-600">아직 분석 데이터가 부족합니다</p>
                        )}
                    </motion.div>
                </div>

                {/* Recommended Focus Areas */}
                {analytics?.next_focus_areas && analytics.next_focus_areas.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/10 mb-8"
                    >
                        <h3 className="text-sm font-medium text-purple-400 mb-3">추천 학습 방향</h3>
                        <div className="flex flex-wrap gap-2">
                            {analytics.next_focus_areas.map((focus, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-full text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20"
                                >
                                    {focus}
                                </span>
                            ))}
                        </div>
                        {analytics.suggested_approach && (
                            <p className="mt-4 text-sm text-zinc-400">{analytics.suggested_approach}</p>
                        )}
                    </motion.div>
                )}

                {/* Learning Style */}
                {analytics?.learning_style && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-8"
                    >
                        <h3 className="text-sm font-medium text-zinc-400 mb-4">학습 스타일</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {['visual', 'auditory', 'kinesthetic', 'reading'].map((style) => {
                                const value = analytics.learning_style?.[style as keyof typeof analytics.learning_style] || 0;
                                const isPrimary = analytics.learning_style?.primary === style;
                                const labels: Record<string, string> = {
                                    visual: '시각형',
                                    auditory: '청각형',
                                    kinesthetic: '체험형',
                                    reading: '읽기형',
                                };
                                return (
                                    <div key={style} className={`text-center p-3 rounded-lg ${isPrimary ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.02]'}`}>
                                        <p className={`text-lg font-bold ${isPrimary ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                            {typeof value === 'number' ? value : 0}%
                                        </p>
                                        <p className="text-xs text-zinc-500">{labels[style]}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Recent Logs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="text-sm font-medium text-zinc-400 mb-4">최근 수업 기록</h3>
                    {recentLogs.length > 0 ? (
                        <div className="space-y-3">
                            {recentLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                                >
                                    <p className="text-xs text-zinc-500 mb-3">
                                        {new Date(log.lesson_date).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                    <div className="space-y-2">
                                        {log.problem_tags && log.problem_tags.length > 0 && (
                                            <div className="flex gap-2">
                                                <span className="w-5 h-5 rounded bg-red-500/10 flex items-center justify-center text-red-400 text-[10px] font-bold">P</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {log.problem_tags.map((tag: string) => (
                                                        <span key={tag} className="text-xs text-red-400/70">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {log.diagnosis_tags && log.diagnosis_tags.length > 0 && (
                                            <div className="flex gap-2">
                                                <span className="w-5 h-5 rounded bg-orange-500/10 flex items-center justify-center text-orange-400 text-[10px] font-bold">D</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {log.diagnosis_tags.map((tag: string) => (
                                                        <span key={tag} className="text-xs text-orange-400/70">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {log.solution_tags && log.solution_tags.length > 0 && (
                                            <div className="flex gap-2">
                                                <span className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-[10px] font-bold">S</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {log.solution_tags.map((tag: string) => (
                                                        <span key={tag} className="text-xs text-emerald-400/70">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                            <p className="text-zinc-500">아직 수업 기록이 없습니다</p>
                            <Link
                                href="/log/new"
                                className="inline-block mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition"
                            >
                                수업 기록하기
                            </Link>
                        </div>
                    )}
                </motion.div>
            </main>

            {/* Notify Parent Modal */}
            {showNotifyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0a0a0b] rounded-2xl p-6 w-full max-w-md border border-white/[0.08]"
                    >
                        <h2 className="text-xl font-semibold mb-4">학부모 알림 보내기</h2>
                        <p className="text-sm text-zinc-500 mb-4">
                            {student.parent_contact}로 알림이 전송됩니다
                        </p>

                        <textarea
                            value={notifyMessage}
                            onChange={(e) => setNotifyMessage(e.target.value)}
                            placeholder={`${student.name} 학생의 학습 현황을 알려주세요...`}
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm focus:border-emerald-500 outline-none transition resize-none"
                            rows={4}
                        />

                        {/* Quick Templates */}
                        <div className="flex flex-wrap gap-2 mt-3 mb-4">
                            {[
                                '이번 주 수업에서 좋은 성과를 보였습니다.',
                                '복습이 조금 더 필요할 것 같습니다.',
                                '다음 수업 전까지 과제 확인 부탁드립니다.',
                            ].map((template) => (
                                <button
                                    key={template}
                                    onClick={() => setNotifyMessage(template)}
                                    className="px-3 py-1.5 text-xs bg-white/[0.05] hover:bg-white/[0.1] rounded-full text-zinc-400 transition"
                                >
                                    {template.slice(0, 20)}...
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowNotifyModal(false);
                                    setNotifyMessage('');
                                }}
                                className="flex-1 px-4 py-3 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleNotifyParent}
                                disabled={!notifyMessage.trim() || notifying}
                                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-medium transition disabled:opacity-50"
                            >
                                {notifying ? '전송 중...' : '알림 보내기'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
