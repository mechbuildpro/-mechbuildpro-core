'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useTranslations } from 'next-intl';

interface ContractItem {
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  rev: string;
  note: string;
}

export default function ContractPage() {
  const t = useTranslations('Contract');
  const [contracts, setContracts] = useState<ContractItem[]>([]);

  const [item, setItem] = useState<ContractItem>({
    title: '',
    type: 'main',
    startDate: '',
    endDate: '',
    rev: '',
    note: ''
  });

  const handleAdd = () => {
    if (!item.title) return;
    setContracts([...contracts, item]);
    setItem({ title: '', type: 'main', startDate: '', endDate: '', rev: '', note: '' });
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(contracts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contracts');
    XLSX.writeFile(wb, 'contracts-export.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(t('title'), 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [[
        t('title'),
        t('type'),
        t('startDate'),
        t('endDate'),
        t('rev'),
        t('note')
      ]],
      body: contracts.map((c) => [
        c.title,
        t(c.type),
        c.startDate,
        c.endDate,
        c.rev,
        c.note
      ])
    });
    doc.save('contracts-summary.pdf');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>{t('title')}</h1>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <input placeholder={t('title')} value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />
        <select value={item.type} onChange={(e) => setItem({ ...item, type: e.target.value })}>
          <option value="main">{t('main')}</option>
          <option value="protocol">{t('protocol')}</option>
          <option value="correspondence">{t('correspondence')}</option>
        </select>
        <input type="date" value={item.startDate} onChange={(e) => setItem({ ...item, startDate: e.target.value })} />
        <input type="date" value={item.endDate} onChange={(e) => setItem({ ...item, endDate: e.target.value })} />
        <input placeholder={t('rev')} value={item.rev} onChange={(e) => setItem({ ...item, rev: e.target.value })} />
        <textarea placeholder={t('note')} value={item.note} onChange={(e) => setItem({ ...item, note: e.target.value })} />
        <button onClick={handleAdd}>{t('add')}</button>
        {contracts.length > 0 && (
          <>
            <button onClick={exportExcel}>{t('excel')}</button>
            <button onClick={exportPDF}>{t('pdf')}</button>
          </>
        )}
      </div>

      {contracts.length > 0 && (
        <table border={1} cellPadding={8} style={{ marginTop: 24, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>{t('title')}</th>
              <th>{t('type')}</th>
              <th>{t('startDate')}</th>
              <th>{t('endDate')}</th>
              <th>{t('rev')}</th>
              <th>{t('note')}</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c, i) => (
              <tr key={i}>
                <td>{c.title}</td>
                <td>{t(c.type)}</td>
                <td>{c.startDate}</td>
                <td>{c.endDate}</td>
                <td>{c.rev}</td>
                <td>{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
