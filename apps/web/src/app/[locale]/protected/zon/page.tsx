'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useTranslations } from 'next-intl';

interface ZoneEntry {
  name: string;
  floor: number;
  room: string;
  type: string;
  systems: string[];
}

export default function ZonPage() {
  const t = useTranslations('Zon');

  const [entry, setEntry] = useState<ZoneEntry>({
    name: '',
    floor: 0,
    room: '',
    type: 'clean',
    systems: []
  });

  const [zones, setZones] = useState<ZoneEntry[]>([]);

  const handleSystemChange = (value: string) => {
    setEntry((prev) => ({
      ...prev,
      systems: prev.systems.includes(value)
        ? prev.systems.filter((s) => s !== value)
        : [...prev.systems, value]
    }));
  };

  const addZone = () => {
    if (!entry.name) return;
    setZones([...zones, entry]);
    setEntry({ name: '', floor: 0, room: '', type: 'clean', systems: [] });
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(zones);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Zonlar');
    XLSX.writeFile(wb, 'zon-export.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(t('title'), 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [[
        t('name'),
        t('floor'),
        t('room'),
        t('type'),
        t('systems')
      ]],
      body: zones.map((z) => [
        z.name,
        z.floor,
        z.room,
        t(z.type),
        z.systems.join(', ')
      ])
    });
    doc.save('zon-summary.pdf');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>{t('title')}</h1>

      <div style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
        <input placeholder={t('name')} value={entry.name} onChange={(e) => setEntry({ ...entry, name: e.target.value })} />
        <input type="number" placeholder={t('floor')} value={entry.floor} onChange={(e) => setEntry({ ...entry, floor: Number(e.target.value) })} />
        <input placeholder={t('room')} value={entry.room} onChange={(e) => setEntry({ ...entry, room: e.target.value })} />
        <select value={entry.type} onChange={(e) => setEntry({ ...entry, type: e.target.value })}>
          <option value="clean">{t('clean')}</option>
          <option value="smoke">{t('smoke')}</option>
          <option value="fire">{t('fire')}</option>
          <option value="service">{t('service')}</option>
        </select>
        <div>
          <label><input type="checkbox" checked={entry.systems.includes('hvac')} onChange={() => handleSystemChange('hvac')} /> HVAC</label><br />
          <label><input type="checkbox" checked={entry.systems.includes('sprinkler')} onChange={() => handleSystemChange('sprinkler')} /> Sprinkler</label><br />
          <label><input type="checkbox" checked={entry.systems.includes('other')} onChange={() => handleSystemChange('other')} /> {t('other')}</label>
        </div>
        <button onClick={addZone}>{t('add')}</button>
        {zones.length > 0 && (
          <>
            <button onClick={exportExcel}>{t('excel')}</button>
            <button onClick={exportPDF}>{t('pdf')}</button>
          </>
        )}
      </div>

      {zones.length > 0 && (
        <table border={1} cellPadding={8} style={{ marginTop: 32, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>{t('name')}</th>
              <th>{t('floor')}</th>
              <th>{t('room')}</th>
              <th>{t('type')}</th>
              <th>{t('systems')}</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z, i) => (
              <tr key={i}>
                <td>{z.name}</td>
                <td>{z.floor}</td>
                <td>{z.room}</td>
                <td>{t(z.type)}</td>
                <td>{z.systems.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
