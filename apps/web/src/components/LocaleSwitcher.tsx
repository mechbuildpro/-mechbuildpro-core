'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

interface LocaleSwitcherProps {
  currentLocale: string;
  currentPath: string;
}

export default function LocaleSwitcher({ currentLocale, currentPath }: LocaleSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    const segments = currentPath.split('/');
    segments[1] = newLocale;

    startTransition(() => {
      router.replace(segments.join('/'));
    });
  };

  return (
    <div>
      <button onClick={() => switchLocale('en')} disabled={isPending || currentLocale === 'en'}>
        English
      </button>
      <button onClick={() => switchLocale('tr')} disabled={isPending || currentLocale === 'tr'}>
        Türkçe
      </button>
    </div>
  );
} 