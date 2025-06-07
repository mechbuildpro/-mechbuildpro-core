'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from './AuthProvider';
import type { UserRole } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  locale: string;
}

export default function ProtectedRoute({ children, requiredRoles = [], locale }: ProtectedRouteProps) {
  const router = useRouter();
  const t = useTranslations('Protected');
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/login`);
      return;
    }

    if (!isLoading && user && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      alert(t('unauthorized'));
      router.push(`/${locale}/login`);
    }
  }, [router, requiredRoles, t, locale, user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
