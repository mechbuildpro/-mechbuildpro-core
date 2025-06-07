'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useTranslations } from 'next-intl';

interface PaymentItem {
  item: string;
  unit: string;
  unitPrice: number;
  totalQty: number;
  doneQty: number;
  deduction?: number;
}

export default function PaymentPage() {
  const t = useTranslations('Progress');
  const [data, setData] = useState<PaymentItem[]>([]);

  const [item, setItem] = useState<PaymentItem>({
    item: '',
    unit: '',
    unitPrice: 0,
    totalQty: 0,
    doneQty: 0,
    deduction: 0
  });

  const handleAdd = () => {
    if (!item.item || !item.unit || !item.totalQty || !item.unitPrice) return;
    setData([...data, item]);
    setItem({ item: '', unit: '', unitPrice: 0, totalQty: 0, doneQty: 0, deduction: 0 });
  };

  const exportExcel = () => {
    const rows = data.map((d) => ({
      item: d.item,
      unit: d.unit,
      unitPrice: d.unitPrice,
      totalQty: d.totalQty,
      doneQty: d.doneQty,
      total: d.doneQty * d.unitPrice,
      deduction: d.deduction || 0,
      net: d.doneQty * d.unitPrice - (d.deduction || 0)
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, 'hakediş.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(t('title'), 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [[
        t('item'),
        t('unit'),
        t('unitPrice'),
        t('totalQty'),
        t('doneQty'),
        t('total'),
        t('deduction'),
        t('net')
      ]],
      body: data.map((d) => [
        d.item,
        d.unit,
        d.unitPrice.toFixed(2),
        d.totalQty,
        d.doneQty,
        (d.unitPrice * d.doneQty).toFixed(2),
        d.deduction?.toFixed(2) || '0.00',
        (d.unitPrice * d.doneQty - (d.deduction || 0)).toFixed(2)
      ])
    });
    doc.save('hakediş.pdf');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>{t('title')}</h1>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <input placeholder={t('item')} value={item.item} onChange={(e) => setItem({ ...item, item: e.target.value })} />
        <input placeholder={t('unit')} value={item.unit} onChange={(e) => setItem({ ...item, unit: e.target.value })} />
        <input type="number" placeholder={t('unitPrice')} value={item.unitPrice} onChange={(e) => setItem({ ...item, unitPrice: Number(e.target.value) })} />
        <input type="number" placeholder={t('totalQty')} value={item.totalQty} onChange={(e) => setItem({ ...item, totalQty: Number(e.target.value) })} />
        <input type="number" placeholder={t('doneQty')} value={item.doneQty} onChange={(e) => setItem({ ...item, doneQty: Number(e.target.value) })} />
        <input type="number" placeholder={t('deduction')} value={item.deduction || ''} onChange={(e) => setItem({ ...item, deduction: Number(e.target.value) })} />
        <button onClick={handleAdd}>{t('add')}</button>
        {data.length > 0 && (
          <>
            <button onClick={exportExcel}>{t('excel')}</button>
            <button onClick={exportPDF}>{t('pdf')}</button>
          </>
        )}
      </div>

      {data.length > 0 && (
        <table border={1} cellPadding={8} style={{ marginTop: 24, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>{t('item')}</th>
              <th>{t('unit')}</th>
              <th>{t('unitPrice')}</th>
              <th>{t('totalQty')}</th>
              <th>{t('doneQty')}</th>
              <th>{t('total')}</th>
              <th>{t('deduction')}</th>
              <th>{t('net')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{d.item}</td>
                <td>{d.unit}</td>
                <td>{d.unitPrice.toFixed(2)}</td>
                <td>{d.totalQty}</td>
                <td>{d.doneQty}</td>
                <td>{(d.unitPrice * d.doneQty).toFixed(2)}</td>
                <td>{d.deduction?.toFixed(2) || '0.00'}</td>
                <td>{(d.unitPrice * d.doneQty - (d.deduction || 0)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
