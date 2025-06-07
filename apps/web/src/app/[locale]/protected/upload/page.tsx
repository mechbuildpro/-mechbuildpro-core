'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function UploadPage() {
  const t = useTranslations('Upload');
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles(newFiles);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>{t('title')}</h1>

      <label style={{ display: 'block', marginBottom: 16 }}>
        {t('select')}
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'block', marginTop: 8 }}
        />
      </label>

      {files.length > 0 ? (
        <div>
          <h2>{t('files')}</h2>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({Math.round(file.size / 1024)} KB)
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{ color: '#666' }}>{t('noFiles')}</p>
      )}
    </div>
  );
}
