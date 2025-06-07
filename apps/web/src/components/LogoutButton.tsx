'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from './AuthProvider';

export default function LogoutButton() {
  const t = useTranslations('Logout');
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
    >
      {t('button')}
    </button>
  );
}
