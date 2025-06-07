'use client';

import Link from 'next/link';
import LogoutButton from './LogoutButton';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  currentPath: string;
  locale: string;
}

export default function Navbar({ currentPath, locale }: NavbarProps) {
  const modules = [
    { name: 'Dashboard', path: `/${locale}/protected/dashboard` },
    { name: 'BOQ', path: `/${locale}/protected/boq` },
    { name: 'HVAC', path: `/${locale}/protected/hvac` },
    { name: 'Sprinkler', path: `/${locale}/protected/sprinkler` },
    { name: 'Zon', path: `/${locale}/protected/zon` },
    { name: 'Upload', path: `/${locale}/protected/upload` },
    { name: 'Yağmur', path: `/${locale}/protected/yagmur` },
    { name: 'Pissu', path: `/${locale}/protected/pissu` },
    { name: 'Yangın Dolap', path: `/${locale}/protected/yangin_dolap` },
    { name: 'Yangın Pompa', path: `/${locale}/protected/yangin_pompa` },
    { name: 'Sözleşme', path: `/${locale}/protected/sozlesme` },
    { name: 'Temiz Su', path: `/${locale}/protected/temizsu` }
  ];

  return (
    <nav style={{
      padding: '12px 24px',
      backgroundColor: 'var(--bg)',
      borderBottom: '1px solid #ccc',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {modules.map((mod) => {
          const isActive = currentPath === mod.path;
          return (
            <Link
              key={mod.path}
              href={mod.path}
              style={{
                fontWeight: isActive ? 'bold' : 'normal',
                textDecoration: isActive ? 'underline' : 'none',
                color: isActive ? '#000' : '#333',
              }}
            >
              {mod.name}
            </Link>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <ThemeToggle />
        <LogoutButton locale={locale} />
      </div>
    </nav>
  );
}
