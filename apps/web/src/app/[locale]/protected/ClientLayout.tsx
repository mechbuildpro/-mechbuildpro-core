'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Protected from '@/components/Protected';

interface ClientLayoutProps {
  children: React.ReactNode;
  locale: string;
}

export function ClientLayout({ children, locale }: ClientLayoutProps) {
  const authContext = useAuth();
  const user = authContext?.user;
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace(`/${locale}/login`);
    }
  }, [user, router, locale]);

  if (!user) return null;

  return (
    <Protected locale={locale}>
      {children}
    </Protected>
  );
} 