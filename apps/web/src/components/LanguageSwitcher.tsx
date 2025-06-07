'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

const locales = ['en', 'tr', 'ar', 'ru'];

interface LanguageSwitcherProps {
  currentLocale: string;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    const newPath = `/${nextLocale}${window.location.pathname.substring(3)}`;
    startTransition(() => {
      router.push(newPath);
    });
  };

  return (
    <div>
      <label style={{ marginRight: 8 }}>🌐 Language:</label>
      <select onChange={handleChange} defaultValue={currentLocale} disabled={isPending}>
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
