'use client';

import { useTranslations } from 'next-intl';

interface InfoBoxProps {
  currentPath: string;
}

export default function InfoBox({ currentPath }: InfoBoxProps) {
  const t = useTranslations('Help');

  // /tr/protected/boq → 'boq'
  const moduleKey = currentPath.split('/').pop() || 'dashboard';

  let message: string;
  try {
    message = t(moduleKey);
  } catch {
    message = '';
  }

  if (!message) return null;

  return (
    <div style={{
      backgroundColor: '#f9f9f9',
      border: '1px solid #ddd',
      padding: 16,
      borderRadius: 6,
      marginBottom: 24,
      fontSize: 14
    }}>
      {message}
    </div>
  );
}
