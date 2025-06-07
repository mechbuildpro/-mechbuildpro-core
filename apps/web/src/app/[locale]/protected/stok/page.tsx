'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useTranslations } from 'next-intl';

interface StockItem {
  material: string;
  quantity: number;
  unit: string;
  supplier: string;
  receivedDate: string;
  used: number;
}

export default function StockPage() {
  const t = useTranslations('Stock');
  const [stocks, setStocks] = useState<StockItem[]>([]);

  const [item, setItem] = useState<StockItem>({
    material: '',
    quantity: 0,
    unit: '',
    supplier: '',
    receivedDate: '',
    used: 0
  });

  const handleAdd = () => {
    if (!item.material || !item.quantity || !item.unit || !item.supplier || !item.receivedDate) return;
    setStocks([...stocks, item]);
    setItem({ material: '', quantity: 0, unit: '', supplier: '', receivedDate: '', used: 0 });
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(stocks);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stok');
    XLSX.writeFile(wb, 'stok-export.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(t('title'), 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [[
        t('material'),
        t('quantity'),
        t('used'),
        t('remaining'),
        t('unit'),
        t('supplier'),
        t('receivedDate')
      ]],
      body: stocks.map((s) => [
        s.material,
        s.quantity,
        s.used,
        s.quantity - s.used,
        s.unit,
        s.supplier,
        s.receivedDate
      ])
    });
    doc.save('stok-summary.pdf');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>{t('title')}</h1>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <input placeholder={t('material')} value={item.material} onChange={(e) => setItem({ ...item, material: e.target.value })} />
        <input type="number" placeholder={t('quantity')} value={item.quantity} onChange={(e) => setItem({ ...item, quantity: Number(e.target.value) })} />
        <input type="number" placeholder={t('used')} value={item.used} onChange={(e) => setItem({ ...item, used: Number(e.target.value) })} />
        <input placeholder={t('unit')} value={item.unit} onChange={(e) => setItem({ ...item, unit: e.target.value })} />
        <input placeholder={t('supplier')} value={item.supplier} onChange={(e) => setItem({ ...item, supplier: e.target.value })} />
        <input type="date" value={item.receivedDate} onChange={(e) => setItem({ ...item, receivedDate: e.target.value })} />
        <button onClick={handleAdd}>{t('add')}</button>
        {stocks.length > 0 && (
          <>
            <button onClick={exportExcel}>{t('excel')}</button>
            <button onClick={exportPDF}>{t('pdf')}</button>
          </>
        )}
      </div>

      {stocks.length > 0 && (
        <table border={1} cellPadding={8} style={{ marginTop: 24, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>{t('material')}</th>
              <th>{t('quantity')}</th>
              <th>{t('used')}</th>
              <th>{t('remaining')}</th>
              <th>{t('unit')}</th>
              <th>{t('supplier')}</th>
              <th>{t('receivedDate')}</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s, i) => (
              <tr key={i}>
                <td>{s.material}</td>
                <td>{s.quantity}</td>
                <td>{s.used}</td>
                <td>{s.quantity - s.used}</td>
                <td>{s.unit}</td>
                <td>{s.supplier}</td>
                <td>{s.receivedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
