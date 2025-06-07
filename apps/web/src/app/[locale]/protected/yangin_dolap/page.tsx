'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useTranslations } from 'next-intl';

interface HoseCabinet {
  name: string;
  floor: number;
  diameter: number;
  length: number;
  pressureIn: number;
  pressureLoss: number;
  pressureOut: number;
}

export default function FireHosePage() {
  const t = useTranslations('FireHose');
  const [cabinets, setCabinets] = useState<HoseCabinet[]>([]);

  const [cabinet, setCabinet] = useState<Omit<HoseCabinet, 'pressureLoss' | 'pressureOut'>>({
    name: '',
    floor: 0,
    diameter: 50,
    length: 10,
    pressureIn: 6,
  });

  const Q = 100; // L/min sabit debi
  const calculateLoss = (length: number, diameter: number) =>
    (0.015 * length * Q * Q) / Math.pow(diameter, 5);

  const addCabinet = () => {
    const loss = calculateLoss(cabinet.length, cabinet.diameter);
    const out = cabinet.pressureIn - loss;
    setCabinets([
      ...cabinets,
      {
        ...cabinet,
        pressureLoss: parseFloat(loss.toFixed(2)),
        pressureOut: parseFloat(out.toFixed(2)),
      }
    ]);
    setCabinet({ name: '', floor: 0, diameter: 50, length: 10, pressureIn: 6 });
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(cabinets);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'FireHose');
    XLSX.writeFile(wb, 'firehose-export.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(t('title'), 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [[
        t('name'), t('floor'), t('diameter'), t('length'),
        t('pressureIn'), t('pressureLoss'), t('pressureOut')
      ]],
      body: cabinets.map(c => [
        c.name,
        c.floor,
        c.diameter,
        c.length,
        c.pressureIn,
        c.pressureLoss,
        c.pressureOut
      ])
    });
    doc.save('firehose-summary.pdf');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>{t('title')}</h1>

      <div style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
        <input placeholder={t('name')} value={cabinet.name} onChange={(e) => setCabinet({ ...cabinet, name: e.target.value })} />
        <input type="number" placeholder={t('floor')} value={cabinet.floor} onChange={(e) => setCabinet({ ...cabinet, floor: Number(e.target.value) })} />
        <input type="number" placeholder={t('diameter')} value={cabinet.diameter} onChange={(e) => setCabinet({ ...cabinet, diameter: Number(e.target.value) })} />
        <input type="number" placeholder={t('length')} value={cabinet.length} onChange={(e) => setCabinet({ ...cabinet, length: Number(e.target.value) })} />
        <input type="number" placeholder={t('pressureIn')} value={cabinet.pressureIn} onChange={(e) => setCabinet({ ...cabinet, pressureIn: Number(e.target.value) })} />
        <button onClick={addCabinet}>{t('add')}</button>
        {cabinets.length > 0 && (
          <>
            <button onClick={exportExcel}>{t('excel')}</button>
            <button onClick={exportPDF}>{t('pdf')}</button>
          </>
        )}
      </div>

      {cabinets.length > 0 && (
        <table border={1} cellPadding={8} style={{ marginTop: 32, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>{t('name')}</th>
              <th>{t('floor')}</th>
              <th>{t('diameter')}</th>
              <th>{t('length')}</th>
              <th>{t('pressureIn')}</th>
              <th>{t('pressureLoss')}</th>
              <th>{t('pressureOut')}</th>
            </tr>
          </thead>
          <tbody>
            {cabinets.map((c, i) => (
              <tr key={i}>
                <td>{c.name}</td>
                <td>{c.floor}</td>
                <td>{c.diameter}</td>
                <td>{c.length}</td>
                <td>{c.pressureIn}</td>
                <td>{c.pressureLoss}</td>
                <td>{c.pressureOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
