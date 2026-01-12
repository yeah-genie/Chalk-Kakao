'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();

  const handleChange = async (newLocale: Locale) => {
    // Set cookie via API
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    });

    // Refresh the page to apply new locale
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`px-2 py-1 text-[12px] rounded transition ${
            locale === loc
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-zinc-500 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}
