'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LogoutButton() {
    const t = useTranslations('auth');
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <button
            onClick={handleLogout}
            className="text-sm text-zinc-500 hover:text-white transition-colors"
        >
            {t('logout')}
        </button>
    );
}
