'use client';

import { useTranslation } from 'next-i18next';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');

  return (
    <div style={{ padding: 24 }}>
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>
    </div>
  );
}
