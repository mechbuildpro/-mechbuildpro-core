'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useTranslations } from 'next-intl';

export default function ReportPage() {
  const t = useTranslations('Report');

  const [selected, setSelected] = useState<string[]>([]);

  const modules = [
    'hvac',
    'sprinkler',
    'zon',
    'boq',
    'sozlesme'
  ];

  const handleSelect = (mod: string) => {
    setSelected((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(t('title'), 14, 16);
    doc.setFontSize(12);

    selected.forEach((mod, idx) => {
      doc.text(`${idx + 1}. ${t(mod)}`, 14, 30 + idx * 10);
      doc.text(`${t('aiSummary')} ${mod.toUpperCase()}...`, 14, 36 + idx * 10);
    });

    doc.save('all-in-one-report.pdf');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>{t('title')}</h1>
      <p>{t('selectModules')}</p>

      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        {modules.map((mod) => (
          <label key={mod}>
            <input
              type="checkbox"
              checked={selected.includes(mod)}
              onChange={() => handleSelect(mod)}
            />
            {t(mod)}
          </label>
        ))}
      </div>

      {selected.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <button onClick={exportPDF}>{t('pdf')}</button>
        </div>
      )}
    </div>
  );
}
