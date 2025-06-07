'use client';

import Link from 'next/link';

const modules = [
  { name: 'BOQ', path: '/boq' },
  { name: 'HVAC', path: '/hvac' },
  { name: 'Sprinkler', path: '/sprinkler' },
  { name: 'Zon', path: '/zon' },
  { name: 'Upload', path: '/upload' },
  { name: 'Yağmur', path: '/yagmur' },
  { name: 'Pissu', path: '/pissu' },
  { name: 'Yangın Dolap', path: '/yangin_dolap' },
];

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  return (
    <aside style={{
      width: 200,
      minHeight: '100vh',
      backgroundColor: '#f9f9f9',
      padding: 16,
      borderRight: '1px solid #ddd'
    }}>
      <h3 style={{ fontSize: 18, marginBottom: 16 }}>🧭 Modüller</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {modules.map((mod) => {
          const isActive = currentPath === mod.path;
          return (
            <li key={mod.path} style={{ marginBottom: 10 }}>
              <Link
                href={mod.path}
                style={{
                  fontWeight: isActive ? 'bold' : 'normal',
                  color: isActive ? '#000' : '#555',
                  textDecoration: isActive ? 'underline' : 'none'
                }}
              >
                {mod.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
