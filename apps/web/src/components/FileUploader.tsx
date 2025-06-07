'use client';

import { useState } from 'react';

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    setFiles((prev) => [...prev, ...selected]);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '2px dashed #ccc',
          padding: '24px',
          textAlign: 'center',
          borderRadius: 8,
          backgroundColor: '#fafafa',
          marginBottom: 16
        }}
      >
        <p>📂 Dosyaları buraya sürükleyin veya seçin</p>
        <input type="file" multiple onChange={handleFileChange} />
      </div>

      {files.length > 0 && (
        <div>
          <h4>📋 Yüklenen Dosyalar:</h4>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({Math.round(file.size / 1024)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
