'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface OnboardingTipProps {
  tipKey: string;
  locale: string;
}

export default function OnboardingTip({ tipKey, locale }: OnboardingTipProps) {
  const storageKey = `onboarding_${locale}_${tipKey}`;
  const t = useTranslations('Onboarding');

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      setVisible(true);
      localStorage.setItem(storageKey, 'true');
    }
  }, [storageKey]);

  if (!visible) return null;

  return (
    <div style={{
      backgroundColor: '#fffbe6',
      border: '1px solid #ffe58f',
      padding: '12px 16px',
      borderRadius: 6,
      fontSize: 14,
      marginBottom: 16
    }}>
      💡 {t(tipKey)}
    </div>
  );
}
