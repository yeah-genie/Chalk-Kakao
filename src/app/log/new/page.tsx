'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRecording } from '@/services/recording';
import type { Student } from '@/lib/supabase/types';

type Mode = 'select' | 'recording' | 'manual' | 'processing' | 'success';

export default function NewLogPage() {
    const t = useTranslations('log');
    const tCommon = useTranslations('common');
    const tAuth = useTranslations('auth');

    const [mode, setMode] = useState<Mode>('select');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0]);

    // Manual mode states
    const [problemTags, setProblemTags] = useState<string[]>([]);
    const [problemDetail, setProblemDetail] = useState('');
    const [diagnosisTags, setDiagnosisTags] = useState<string[]>([]);
    const [diagnosisDetail, setDiagnosisDetail] = useState('');
    const [solutionTags, setSolutionTags] = useState<string[]>([]);
    const [solutionDetail, setSolutionDetail] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    // Tag definitions - NO emojis, clean text only
    const PROBLEM_TAGS = ['calculation', 'concept', 'interpretation', 'time', 'formula', 'application'];
    const DIAGNOSIS_TAGS = ['basics', 'careless', 'practice', 'confusion', 'confidence', 'focus'];
    const SOLUTION_TAGS = ['repeat', 'organize', 'similar', 'visualize', 'errorNote', 'encourage'];

    // Recording hook
    const {
        formattedDuration,
        isRecording,
        isPaused,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        cancelRecording,
    } = useRecording();

    // Load students
    useEffect(() => {
        async function loadStudents() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('students')
                .select('*')
                .eq('tutor_id', user.id)
                .eq('status', 'active')
                .order('name');

            setStudents(data || []);
        }
        loadStudents();
    }, [supabase]);

    const toggleTag = (tag: string, tags: string[], setTags: (tags: string[]) => void) => {
        if (tags.includes(tag)) {
            setTags(tags.filter(t => t !== tag));
        } else {
            setTags([...tags, tag]);
        }
    };

    // Start recording for selected student
    const handleStartRecording = async () => {
        const sessionId = await startRecording(selectedStudent?.id || null);
        if (sessionId) {
            setMode('recording');
        }
    };

    // Poll for analysis completion
    const pollAnalysisStatus = async (recordingId: string) => {
        const maxAttempts = 60;
        let attempts = 0;

        const poll = async (): Promise<boolean> => {
            try {
                const res = await fetch(`/api/analyze-recording?recordingId=${recordingId}`);
                const data = await res.json();

                if (data.status === 'completed' && data.hasLog) {
                    return true;
                }

                attempts++;
                if (attempts >= maxAttempts) {
                    return false;
                }

                await new Promise(resolve => setTimeout(resolve, 2000));
                return poll();
            } catch {
                attempts++;
                if (attempts >= maxAttempts) return false;
                await new Promise(resolve => setTimeout(resolve, 2000));
                return poll();
            }
        };

        return poll();
    };

    // Stop recording and process
    const handleStopRecording = async () => {
        setMode('processing');
        const recording = await stopRecording();

        if (recording) {
            const success = await pollAnalysisStatus(recording.id);

            if (success) {
                setMode('success');
                setTimeout(() => router.push('/dashboard'), 2000);
            } else {
                setMode('success');
                setTimeout(() => router.push('/dashboard'), 2000);
            }
        } else {
            setError(t('error.saveFailed'));
            setMode('select');
        }
    };

    // Manual submit
    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (problemTags.length === 0 && diagnosisTags.length === 0 && solutionTags.length === 0) {
            setError(t('manual.selectOneTag'));
            return;
        }

        setLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError(tAuth('loginRequired'));
            setLoading(false);
            return;
        }

        // Convert tag keys to translated labels
        const translatedProblemTags = problemTags.map(key => t(`tags.problem.${key}`));
        const translatedDiagnosisTags = diagnosisTags.map(key => t(`tags.diagnosis.${key}`));
        const translatedSolutionTags = solutionTags.map(key => t(`tags.solution.${key}`));

        const { error } = await supabase.from('logs').insert({
            user_id: user.id,
            student_id: selectedStudent?.id || null,
            lesson_date: lessonDate,
            problem_tags: translatedProblemTags,
            problem_detail: problemDetail || null,
            diagnosis_tags: translatedDiagnosisTags,
            diagnosis_detail: diagnosisDetail || null,
            solution_tags: translatedSolutionTags,
            solution_detail: solutionDetail || null,
            auto_generated: false,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setMode('success');
            setTimeout(() => router.push('/dashboard'), 1500);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b]">
            {/* Success overlay */}
            <AnimatePresence>
                {mode === 'success' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#0a0a0b] flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-white">{t('success.title')}</p>
                            <p className="text-zinc-500 text-sm mt-1">{t('success.subtitle')}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Processing overlay */}
            <AnimatePresence>
                {mode === 'processing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#0a0a0b] flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-zinc-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-white">{t('processing.title')}</p>
                            <p className="text-zinc-500 text-sm mt-1">{t('processing.subtitle')}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0a0a0b]/95 backdrop-blur-sm border-b border-zinc-800/50">
                <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm">{tCommon('back')}</span>
                    </Link>
                    <span className="text-sm text-zinc-500">{t('title')}</span>
                    <div className="w-16" />
                </div>
            </header>

            <main className="max-w-lg mx-auto px-5 py-8">
                {/* Recording Mode */}
                {mode === 'recording' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        {/* Recording indicator */}
                        <div className="relative inline-block mb-6">
                            <div className={`w-24 h-24 rounded-full bg-red-600 flex items-center justify-center ${isRecording ? 'animate-pulse' : ''}`}>
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                            </div>
                            {isRecording && (
                                <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500" />
                            )}
                        </div>

                        <p className="text-3xl font-mono text-white mb-2">{formattedDuration}</p>
                        <p className="text-zinc-500 text-sm mb-8">
                            {selectedStudent ? t('recording.title', { student: selectedStudent.name }) : t('recording.titleNoStudent')}
                        </p>

                        {/* Controls */}
                        <div className="flex justify-center gap-4">
                            {isRecording ? (
                                <button
                                    onClick={pauseRecording}
                                    className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                </button>
                            ) : isPaused ? (
                                <button
                                    onClick={resumeRecording}
                                    className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                            ) : null}

                            <button
                                onClick={handleStopRecording}
                                className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h12v12H6z" />
                                </svg>
                            </button>

                            <button
                                onClick={async () => {
                                    await cancelRecording();
                                    setMode('select');
                                }}
                                className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-zinc-600 text-xs mt-8">{t('recording.aiNote')}</p>
                    </motion.div>
                )}

                {/* Select Mode */}
                {mode === 'select' && (
                    <>
                        <div className="mb-8">
                            <h1 className="text-2xl font-semibold text-white mb-1">{t('title')}</h1>
                            <p className="text-zinc-500 text-sm">{t('subtitle')}</p>
                        </div>

                        {/* Student selection */}
                        {students.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs text-zinc-500 mb-3">{t('selectStudent')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {students.map((student) => (
                                        <button
                                            key={student.id}
                                            onClick={() => setSelectedStudent(
                                                selectedStudent?.id === student.id ? null : student
                                            )}
                                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                                selectedStudent?.id === student.id
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                                            }`}
                                        >
                                            {student.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Main CTA - Record Button */}
                        <button
                            onClick={handleStartRecording}
                            className="w-full py-12 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-colors mb-6"
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mb-3">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                    </svg>
                                </div>
                                <span className="text-base font-medium text-white">{t('startRecording')}</span>
                                <span className="text-xs text-zinc-500 mt-1">{t('tapToRecord')}</span>
                            </div>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-zinc-800" />
                            <span className="text-xs text-zinc-600">{t('or')}</span>
                            <div className="flex-1 h-px bg-zinc-800" />
                        </div>

                        {/* Manual option */}
                        <button
                            onClick={() => setMode('manual')}
                            className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            {t('manualEntry')}
                        </button>
                    </>
                )}

                {/* Manual Mode */}
                {mode === 'manual' && (
                    <>
                        <div className="mb-6">
                            <button
                                onClick={() => setMode('select')}
                                className="text-sm text-zinc-500 hover:text-white mb-4 flex items-center gap-1 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                {t('manual.back')}
                            </button>
                            <h1 className="text-2xl font-semibold text-white mb-1">{t('manual.title')}</h1>
                            <p className="text-zinc-500 text-sm">{t('manual.subtitle')}</p>
                        </div>

                        <form onSubmit={handleManualSubmit} className="space-y-6">
                            {/* Date */}
                            <div>
                                <input
                                    type="date"
                                    value={lessonDate}
                                    onChange={(e) => setLessonDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
                                />
                            </div>

                            {/* Student selection in manual mode */}
                            {students.length > 0 && (
                                <div>
                                    <p className="text-xs text-zinc-500 mb-2">{t('selectStudent')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {students.map((student) => (
                                            <button
                                                key={student.id}
                                                type="button"
                                                onClick={() => setSelectedStudent(
                                                    selectedStudent?.id === student.id ? null : student
                                                )}
                                                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                                    selectedStudent?.id === student.id
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                                }`}
                                            >
                                                {student.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Problem */}
                            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400">P</span>
                                    <span className="text-sm font-medium text-white">{t('problem.label')}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {PROBLEM_TAGS.map((key) => {
                                        const label = t(`tags.problem.${key}`);
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => toggleTag(key, problemTags, setProblemTags)}
                                                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                                    problemTags.includes(key)
                                                        ? 'bg-zinc-600 text-white'
                                                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <input
                                    type="text"
                                    value={problemDetail}
                                    onChange={(e) => setProblemDetail(e.target.value)}
                                    placeholder={t('problem.detail')}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                                />
                            </div>

                            {/* Diagnosis */}
                            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400">D</span>
                                    <span className="text-sm font-medium text-white">{t('diagnosis.label')}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {DIAGNOSIS_TAGS.map((key) => {
                                        const label = t(`tags.diagnosis.${key}`);
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => toggleTag(key, diagnosisTags, setDiagnosisTags)}
                                                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                                    diagnosisTags.includes(key)
                                                        ? 'bg-zinc-600 text-white'
                                                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <input
                                    type="text"
                                    value={diagnosisDetail}
                                    onChange={(e) => setDiagnosisDetail(e.target.value)}
                                    placeholder={t('diagnosis.detail')}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                                />
                            </div>

                            {/* Solution */}
                            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400">S</span>
                                    <span className="text-sm font-medium text-white">{t('solution.label')}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {SOLUTION_TAGS.map((key) => {
                                        const label = t(`tags.solution.${key}`);
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => toggleTag(key, solutionTags, setSolutionTags)}
                                                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                                    solutionTags.includes(key)
                                                        ? 'bg-zinc-600 text-white'
                                                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <input
                                    type="text"
                                    value={solutionDetail}
                                    onChange={(e) => setSolutionDetail(e.target.value)}
                                    placeholder={t('solution.detail')}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                                />
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                                    {error}
                                </p>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {t('manual.saving')}
                                    </span>
                                ) : t('manual.saveLog')}
                            </button>
                        </form>
                    </>
                )}
            </main>
        </div>
    );
}
