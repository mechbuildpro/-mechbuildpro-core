'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface ProtectedProps {
  children: React.ReactNode;
  allow?: Array<'admin' | 'user' | 'guest'>;
  locale: string;
}

export default function Protected({
  children,
  allow = ['admin', 'user'],
  locale
}: ProtectedProps) {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = Cookies.get('isLoggedIn') === 'true';
    const role = Cookies.get('userRole') as 'admin' | 'user' | 'guest';

    if (!isLoggedIn || !role || !allow.includes(role)) {
      router.push(`/${locale}/login`);
    }
  }, [allow, router, locale]);

  return <>{children}</>;
}
