'use client';

import Link from 'next/link';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function HomePage({ params: { locale } }: PageProps) {
  const modules = [
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
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>🧠 MechBuild Pro - Kontrol Paneli</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        {modules.map((mod) => (
          <Link
            key={mod.path}
            href={mod.path}
            style={{
              padding: 16,
              border: '1px solid #ccc',
              borderRadius: 8,
              textAlign: 'center',
              backgroundColor: '#f9f9f9',
              textDecoration: 'none',
              color: '#333',
              fontWeight: 500
            }}
          >
            {mod.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
