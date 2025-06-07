'use client';

import { useState, useEffect } from 'react';

type FileItem = {
  name: string;
  path?: string;
  type: 'file' | 'folder';
  children?: FileItem[];
};

function flattenFiles(items: FileItem[], parentPath = ''): { name: string; path: string }[] {
  let flat: { name: string; path: string }[] = [];
  for (const item of items) {
    const fullPath = parentPath ? `${parentPath}/${item.name}` : item.name;
    if (item.type === 'folder' && item.children) {
      flat = flat.concat(flattenFiles(item.children, fullPath));
    } else if (item.type === 'file' && item.path) {
      flat.push({ name: item.name, path: item.path });
    }
  }
  return flat;
}

export default function FileManager() {
  const [flatFiles, setFlatFiles] = useState<{ name: string; path: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'docx' | 'pdf' | 'xlsx' | 'zip'>('all');

  useEffect(() => {
    fetch('/api/files')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFlatFiles(flattenFiles(data));
        } else {
          setFlatFiles([]);
        }
      })
      .catch(() => {
        setFlatFiles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredFiles = flatFiles.filter(f => {
    if (filter === 'all') return true;
    const ext = f.name.split('.').pop()?.toLowerCase();
    return ext === filter;
  });

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: 'auto' }}>
      <h1>Dosya Yönetim Paneli</h1>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <label>Filtrele: </label>
            <select value={filter} onChange={e => setFilter(e.target.value as 'all' | 'docx' | 'pdf' | 'xlsx' | 'zip')}>
              <option value="all">Tümü</option>
              <option value="docx">Word</option>
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel</option>
              <option value="zip">ZIP</option>
            </select>
          </div>
          {filteredFiles.length === 0 ? (
            <p>Seçilen filtre için dosya bulunamadı.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Dosya Adı</th>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>İndir</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{file.name}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <a
                        href={`/api/files/download?file=${encodeURIComponent(file.path)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        İndir
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
