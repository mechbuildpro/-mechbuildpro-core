'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useTranslations } from 'next-intl';
import type { Material } from './types';

export const BOQComponent: React.FC = () => {
  const t = useTranslations('Material');

  const [materials, setMaterials] = useState<Material[]>([]);
  const [showPrice, setShowPrice] = useState<boolean>(false);

  const [item, setItem] = useState<Material>({
    name: '',
    quantity: 0,
    unit: '',
    unitPrice: undefined
  });

  const handleAdd = () => {
    if (!item.name || !item.quantity || !item.unit) return;
    setMaterials([...materials, item]);
    setItem({ name: '', quantity: 0, unit: '', unitPrice: undefined });
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(materials);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Materials');
    XLSX.writeFile(wb, 'materials-export.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    (doc as any).autoTable({
      startY: 20,
      head: showPrice
        ? [[t('name'), t('quantity'), t('unit'), t('unitPrice'), t('total')]]
        : [[t('name'), t('quantity'), t('unit')]],
      body: materials.map((m) =>
        showPrice
          ? [
              m.name,
              m.quantity,
              m.unit,
              m.unitPrice?.toFixed(2) ?? '-',
              m.unitPrice ? (m.quantity * m.unitPrice).toFixed(2) : '-'
            ]
          : [m.name, m.quantity, m.unit]
      )
    });
    doc.save('materials-summary.pdf');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">BOQ Yönetimi</h2>
      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showPrice}
            onChange={() => setShowPrice(!showPrice)}
            className="form-checkbox"
          />
          <span>{t('toggle')}</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-sm">
          <input
            type="text"
            placeholder={t('name')}
            value={item.name}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder={t('quantity')}
            value={item.quantity}
            onChange={(e) => setItem({ ...item, quantity: Number(e.target.value) })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder={t('unit')}
            value={item.unit}
            onChange={(e) => setItem({ ...item, unit: e.target.value })}
            className="border p-2 rounded"
          />
          {showPrice && (
            <input
              type="number"
              placeholder={t('unitPrice')}
              value={item.unitPrice || ''}
              onChange={(e) =>
                setItem({ ...item, unitPrice: Number(e.target.value) })
              }
              className="border p-2 rounded"
            />
          )}
          <button onClick={handleAdd} className="bg-blue-500 text-white p-2 rounded col-span-full">{t('add')}</button>
        </div>

        {materials.length > 0 && (
          <div className="mt-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('quantity')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('unit')}</th>
                {showPrice && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('unitPrice')}</th>}
                {showPrice && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('total')}</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((m, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.unit}</td>
                  {showPrice && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.unitPrice?.toFixed(2) ?? '-'}</td>}
                  {showPrice && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.unitPrice ? (m.quantity * m.unitPrice).toFixed(2) : '-'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {materials.length > 0 && (
          <div className="mt-4 space-x-4">
            <button onClick={exportExcel} className="bg-green-500 text-white p-2 rounded">{t('excel')}</button>
            <button onClick={exportPDF} className="bg-red-500 text-white p-2 rounded">{t('pdf')}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BOQComponent; 