import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TutorProfilePage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (!profile || !profile.name) {
        notFound();
    }

    // Get logs
    const { data: logs } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(5);

    const { count: totalLogs } = await supabase
        .from('logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id);

    // Calculate badges
    const { data: allLogs } = await supabase
        .from('logs')
        .select('lesson_date, created_at, problem_tags, diagnosis_tags, solution_tags')
        .eq('user_id', id);

    let sameDayRate = 0;
    if (allLogs && allLogs.length > 0) {
        const sameDayCount = allLogs.filter(log => {
            const lessonDate = new Date(log.lesson_date).toDateString();
            const createdDate = new Date(log.created_at).toDateString();
            return lessonDate === createdDate;
        }).length;
        sameDayRate = Math.round((sameDayCount / allLogs.length) * 100);
    }

    const hasInstantFeedbackBadge = sameDayRate >= 80 && (totalLogs || 0) >= 5;

    // Get top tags
    const allSolutionTags: string[] = [];
    allLogs?.forEach(log => {
        if (log.solution_tags) allSolutionTags.push(...log.solution_tags);
    });

    const getTopTags = (tags: string[], limit = 3) => {
        const counts: Record<string, number> = {};
        tags.forEach(tag => { counts[tag] = (counts[tag] || 0) + 1; });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([tag, count]) => ({ tag, count }));
    };

    const topSolutionTags = getTopTags(allSolutionTags);

    return (
        <div className="min-h-screen relative">
            {/* Premium background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[#050506]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[150px]" />
                <div className="absolute bottom-0 right-[20%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.02] blur-[100px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#050506]/80 backdrop-blur-2xl border-b border-white/[0.04]">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">C</span>
                        </div>
                        <span className="text-[15px] font-semibold text-white/90">Chalk</span>
                    </Link>
                    <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Verified Tutor
                    </span>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-12">
                {/* Profile hero */}
                <div className="text-center mb-14">
                    {/* Avatar with glow */}
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 blur-2xl opacity-30" />
                        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                            <span className="text-white text-4xl font-bold">{profile.name?.charAt(0)}</span>
                        </div>
                    </div>

                    <h1 className="text-[28px] font-bold text-white tracking-tight">{profile.name} 선생님</h1>
                    <p className="text-[15px] text-zinc-500 mt-2">{profile.school}</p>

                    {/* Subject badge */}
                    <div className="flex justify-center mt-4">
                        <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-[13px] font-medium text-emerald-400">
                            {profile.subject} 전문
                        </span>
                    </div>

                    {/* Achievement badges */}
                    {hasInstantFeedbackBadge && (
                        <div className="flex justify-center mt-5">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[13px] font-medium text-amber-400">
                                <span className="text-base">🚀</span>
                                즉시 피드백
                            </span>
                        </div>
                    )}
                </div>

                {/* Stats - 큰 숫자 강조 */}
                <div className="grid grid-cols-3 gap-3 mb-14">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center">
                        <p className="text-[40px] font-bold text-white tracking-tight">{totalLogs || 0}</p>
                        <p className="text-[12px] text-zinc-500 mt-1">누적 기록</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center">
                        <p className="text-[40px] font-bold text-emerald-400 tracking-tight">{sameDayRate}<span className="text-[18px]">%</span></p>
                        <p className="text-[12px] text-zinc-500 mt-1">당일 기록률</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center">
                        <p className="text-[40px] font-bold text-cyan-400 tracking-tight">{topSolutionTags[0]?.count || 0}</p>
                        <p className="text-[12px] text-zinc-500 mt-1">주요 해결법</p>
                    </div>
                </div>

                {/* Top solution methods */}
                {topSolutionTags.length > 0 && (
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] mb-10">
                        <h2 className="text-[13px] font-medium text-zinc-500 mb-4">자주 사용하는 해결 방법</h2>
                        <div className="flex flex-wrap gap-2">
                            {topSolutionTags.map(({ tag, count }, i) => (
                                <span
                                    key={tag}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium ${i === 0
                                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                            : 'bg-white/[0.03] border border-white/[0.06] text-zinc-300'
                                        }`}
                                >
                                    #{tag}
                                    <span className="text-[11px] text-zinc-500">{count}회</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent logs */}
                <div>
                    <h2 className="text-[15px] font-semibold text-zinc-400 mb-5">최근 수업 기록</h2>

                    {logs && logs.length > 0 ? (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div key={log.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                    <p className="text-[12px] text-zinc-600 mb-4">
                                        {new Date(log.lesson_date).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-red-400 text-[10px] font-bold">P</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap gap-2">
                                                    {log.problem_tags?.map((tag: string) => (
                                                        <span key={tag} className="text-[12px] text-red-400/80">#{tag}</span>
                                                    ))}
                                                </div>
                                                {log.problem_detail && <p className="text-[13px] text-zinc-400 mt-1">{log.problem_detail}</p>}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-orange-400 text-[10px] font-bold">D</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap gap-2">
                                                    {log.diagnosis_tags?.map((tag: string) => (
                                                        <span key={tag} className="text-[12px] text-orange-400/80">#{tag}</span>
                                                    ))}
                                                </div>
                                                {log.diagnosis_detail && <p className="text-[13px] text-zinc-400 mt-1">{log.diagnosis_detail}</p>}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-emerald-400 text-[10px] font-bold">S</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap gap-2">
                                                    {log.solution_tags?.map((tag: string) => (
                                                        <span key={tag} className="text-[12px] text-emerald-400/80">#{tag}</span>
                                                    ))}
                                                </div>
                                                {log.solution_detail && <p className="text-[13px] text-zinc-400 mt-1">{log.solution_detail}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <p className="text-zinc-500 text-[14px]">아직 기록이 없습니다</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-16 pt-8 border-t border-white/[0.04]">
                    <p className="text-[12px] text-zinc-600">
                        Powered by <span className="text-emerald-500">Chalk</span>
                    </p>
                    <p className="text-[11px] text-zinc-700 mt-1">수업 로그가 포트폴리오가 됩니다</p>
                </div>
            </main>
        </div>
    );
}
