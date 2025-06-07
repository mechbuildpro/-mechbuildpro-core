'use client';

import { useEffect, useState } from 'react';
import { setTheme, getStoredTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const [theme, setLocalTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const current = getStoredTheme();
    setLocalTheme(current);
    document.documentElement.className = current;
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setLocalTheme(next);
  };

  return (
    <button
      onClick={toggle}
      style={{
        padding: '8px 12px',
        backgroundColor: '#555',
        color: 'white',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 14
      }}
    >
      Tema: {theme === 'light' ? '☀️' : '🌙'}
    </button>
  );
}
