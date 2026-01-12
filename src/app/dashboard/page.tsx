import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import LogoutButton from './LogoutButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default async function DashboardPage() {
    const t = await getTranslations('dashboard');
    const locale = await getLocale();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Redirect to onboarding if profile not complete
    if (!profile?.name) {
        redirect('/onboarding');
    }

    // Get logs
    const { data: logs } = await supabase
        .from('logs')
        .select('*, students(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const { count: totalLogs } = await supabase
        .from('logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // Get active students count
    const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', user.id)
        .eq('status', 'active');

    return (
        <div className="min-h-screen bg-[#0a0a0b]">
            {/* Header - Clean, minimal */}
            <header className="sticky top-0 z-50 bg-[#0a0a0b]/95 backdrop-blur-sm border-b border-zinc-800/50">
                <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
                    <span className="text-[15px] font-semibold text-white">Chalk</span>
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher />
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-5 py-8">
                {/* Greeting - Simple */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-white mb-1">
                        {t('greeting', { name: profile.name })}
                    </h1>
                    <p className="text-zinc-500 text-sm">{profile.subject}</p>
                </div>

                {/* Main CTA - Record Lesson */}
                <Link
                    href="/log/new"
                    className="block w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-center text-[15px] font-medium text-white transition-colors mb-8"
                >
                    {t('recordLesson')}
                </Link>

                {/* Stats - Minimal */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                        <p className="text-xs text-zinc-500 mb-1">{t('totalLogs')}</p>
                        <p className="text-2xl font-semibold text-white">{totalLogs || 0}</p>
                    </div>
                    <Link
                        href="/dashboard/students"
                        className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                    >
                        <p className="text-xs text-zinc-500 mb-1">{t('quickActions.students')}</p>
                        <p className="text-2xl font-semibold text-white">{totalStudents || 0}</p>
                    </Link>
                </div>

                {/* Quick Links - Simplified */}
                <div className="flex gap-2 mb-8">
                    <Link
                        href="/dashboard/students"
                        className="flex-1 py-3 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors text-center"
                    >
                        {t('quickActions.students')}
                    </Link>
                    <Link
                        href={`/tutor/${user.id}`}
                        className="flex-1 py-3 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors text-center"
                    >
                        {t('quickActions.publicProfile')}
                    </Link>
                </div>

                {/* Recent Logs - Clean list */}
                <div>
                    <h2 className="text-sm font-medium text-zinc-400 mb-4">{t('recentLogs')}</h2>

                    {logs && logs.length > 0 ? (
                        <div className="space-y-2">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-800"
                                >
                                    {/* Date and Student */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs text-zinc-500">
                                            {new Date(log.lesson_date).toLocaleDateString(locale, {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                        {log.students?.name && (
                                            <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">
                                                {log.students.name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Tags - Simplified, single color */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {log.problem_tags?.slice(0, 2).map((tag: string) => (
                                            <span key={tag} className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                        {log.diagnosis_tags?.slice(0, 2).map((tag: string) => (
                                            <span key={tag} className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                        {(log.problem_tags?.length > 2 || log.diagnosis_tags?.length > 2) && (
                                            <span className="text-xs text-zinc-600">
                                                +{(log.problem_tags?.length || 0) + (log.diagnosis_tags?.length || 0) - 4}
                                            </span>
                                        )}
                                    </div>

                                    {/* Detail preview */}
                                    {log.problem_detail && (
                                        <p className="text-sm text-zinc-500 mt-2 line-clamp-1">
                                            {log.problem_detail}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <p className="text-zinc-600 mb-4">{t('noLogs.title')}</p>
                            <Link
                                href="/log/new"
                                className="inline-block px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors"
                            >
                                {t('startRecording')}
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
