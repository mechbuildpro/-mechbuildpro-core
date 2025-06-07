// src/app/layout.tsx

import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
// Removed: import { NextIntlClientProvider } from 'next-intl';
// Removed: import { notFound } from 'next/navigation';

// Removed: Get locale config
// Removed: import i18nConfig from '@/lib/i18n';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
