'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { getItems, calculateStats } from './logic';
import InventoryForm from './Form';
import { InventoryItem, InventoryStats, CATEGORY_COLORS, UNIT_SYMBOLS } from './types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const InventoryComponent: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const fetchedItems = await getItems();
      setItems(fetchedItems);
      setStats(calculateStats(fetchedItems));
      setError(null);
    } catch (err) {
      setError('Malzemeler yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, 'inventory-export.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    (doc as any).autoTable({
      startY: 20,
      head: [['Malzeme', 'Kategori', 'Miktar', 'Birim Fiyat', 'Konum', 'Durum']],
      body: items.map(item => [
        item.itemName,
        item.category,
        `${item.quantity} ${UNIT_SYMBOLS[item.unit]}`, // Using UNIT_SYMBOLS from types
        item.unitPrice ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.unitPrice) : '-',
        item.location,
        item.quantity <= 0 ? 'Stok Dışı' : item.quantity <= item.minQuantity ? 'Düşük Stok' : 'Normal'
      ])
    });
    doc.save('inventory-summary.pdf');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Stok Yönetimi</h1>

      {/* İstatistikler */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Toplam Malzeme</h3>
            <p className="text-2xl font-bold">{stats.totalItems}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Toplam Değer</h3>
            <p className="text-2xl font-bold text-green-500">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats.totalValue)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Düşük Stok</h3>
            <p className="text-2xl font-bold text-yellow-500">{stats.lowStockItems}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Stok Dışı</h3>
            <p className="text-2xl font-bold text-red-500">{stats.outOfStockItems}</p>
          </div>
        </div>
      )}

      {/* Malzeme Formu */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Yeni Malzeme Ekle</h2>
        <InventoryForm onSuccess={loadItems} />
      </div>

      {/* Malzeme Listesi */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Malzeme Listesi</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Malzeme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Birim Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Konum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                    <div className="text-sm text-gray-500">{item.itemCode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${CATEGORY_COLORS[item.category]}-100 text-${CATEGORY_COLORS[item.category]}-800`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity} {UNIT_SYMBOLS[item.unit]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.unitPrice ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.unitPrice) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${item.quantity <= 0 ? 'bg-red-100 text-red-800' :
                        item.quantity <= item.minQuantity ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'}`}>
                      {item.quantity <= 0 ? 'Stok Dışı' :
                       item.quantity <= item.minQuantity ? 'Düşük Stok' :
                       'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length > 0 && (
          <div className="mt-4 space-x-4">
            <button onClick={exportExcel} className="bg-green-500 text-white p-2 rounded">Export Excel</button>
            <button onClick={exportPDF} className="bg-red-500 text-white p-2 rounded">Export PDF</button>
          </div>
        )}
      </div>
    </div>
  );
}; 