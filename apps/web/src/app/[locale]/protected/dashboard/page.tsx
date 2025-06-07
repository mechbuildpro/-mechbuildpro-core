'use client';

import { useAuth } from '@/components/AuthProvider';
import Protected from '@/components/Protected';
import Link from 'next/link';

const allModules = [
  { name: 'BOQ', path: '/protected/boq', roles: ['admin', 'user'] },
  { name: 'HVAC', path: '/protected/hvac', roles: ['admin', 'user'] },
  { name: 'Sprinkler', path: '/protected/sprinkler', roles: ['admin', 'user'] },
  { name: 'Zon', path: '/protected/zon', roles: ['admin', 'user'] },
  { name: 'Upload', path: '/protected/upload', roles: ['admin', 'user', 'guest'] },
  { name: 'Yağmur', path: '/protected/yagmur', roles: ['admin', 'user'] },
  { name: 'Pissu', path: '/protected/pissu', roles: ['admin', 'user'] },
  { name: 'Yangın Dolap', path: '/protected/yangin_dolap', roles: ['admin'] },
  { name: 'Yangın Pompa', path: '/protected/yangin_pompa', roles: ['admin'] },
  { name: 'Sözleşme', path: '/protected/sozlesme', roles: ['admin'] },
  { name: 'Temiz Su', path: '/protected/temizsu', roles: ['admin'] }
];

interface User {
  role: 'admin' | 'user' | 'guest';
}

export default function ProtectedDashboardPage({ params }: { params: { locale: string } }) {
  const authContext = useAuth();
  const user = authContext?.user as User | null;
  const role = user?.role || 'guest';

  const accessibleModules = allModules.filter(mod => mod.roles.includes(role));

  return (
    <Protected locale={params.locale} allow={['admin', 'user', 'guest']}>
      <div style={{ padding: 24 }}>
        <h1>👋 Hoş geldiniz!</h1>
        <p>Giriş yapan rol: <strong>{role}</strong></p>
        <p>Erişebileceğiniz modüller:</p>

        <ul>
          {accessibleModules.map((mod) => (
            <li key={mod.path}>
              <Link href={mod.path}>{mod.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </Protected>
  );
}
