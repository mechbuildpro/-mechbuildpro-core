'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface NotFoundProps {
  locale: string;
}

export default function NotFound({ locale }: NotFoundProps) {
  const t = useTranslations('NotFound');

  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 16px',
      maxWidth: 600,
      margin: '0 auto'
    }}>
      <h1 style={{ fontSize: 48, marginBottom: 16 }}>404</h1>
      <p style={{ fontSize: 18, marginBottom: 24 }}>{t('message')}</p>
      <Link href={`/${locale}`} style={{
        padding: '10px 20px',
        backgroundColor: '#0070f3',
        color: '#fff',
        borderRadius: 4,
        textDecoration: 'none'
      }}>
        {t('home')}
      </Link>
    </div>
  );
}
