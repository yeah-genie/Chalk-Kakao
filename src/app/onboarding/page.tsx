'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const SUBJECTS_EN = ['Math', 'English', 'Science', 'History', 'Languages', 'Other'];
const SUBJECTS_KO = ['수학', '영어', '국어', '과학', '사회', '한국사', '제2외국어', '기타'];

export default function OnboardingPage() {
    const t = useTranslations('onboarding');
    const tAuth = useTranslations('auth');

    const [name, setName] = useState('');
    const [school, setSchool] = useState('');
    const [subject, setSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    // Determine subjects based on current language
    const SUBJECTS = typeof window !== 'undefined' && navigator.language.startsWith('ko')
        ? SUBJECTS_KO
        : SUBJECTS_EN;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError(tAuth('loginRequired'));
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                name,
                school,
                subject,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-5">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-white mb-2">{t('title')}</h1>
                    <p className="text-sm text-zinc-500">Set up your tutor profile</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1.5">{t('name')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            required
                            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:border-zinc-600 outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-500 mb-1.5">{t('school')}</label>
                        <input
                            type="text"
                            value={school}
                            onChange={(e) => setSchool(e.target.value)}
                            placeholder={t('schoolPlaceholder')}
                            required
                            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:border-zinc-600 outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-500 mb-2">{t('subject')}</label>
                        <div className="flex flex-wrap gap-2">
                            {SUBJECTS.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSubject(s)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                        subject === s
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !name || !school || !subject}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? t('completing') : t('complete')}
                    </button>
                </form>
            </div>
        </div>
    );
}
