import { BaseItem } from './logic';

// Tip tanımlamaları
interface ExcelData {
  name: string;
  description: string;
  status: string;
  priority: string;
  systems: string;
  startDate: string;
  endDate: string;
  [key: string]: string | number | boolean; // Diğer dinamik alanlar için
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('tr-TR');
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('tr-TR');
};

export const createTable = (headers: string[], rows: string[][]): string => {
  const table = document.createElement('table');
  table.className = 'min-w-full divide-y divide-gray-200';

  // Header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.className = 'px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = document.createElement('td');
      td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return table.outerHTML;
};

export const formatReportData = (items: BaseItem[]): ExcelData[] => {
  return items.map(item => ({
    name: item.name,
    description: item.description,
    status: item.status,
    priority: item.priority,
    systems: item.systems.join(', '),
    startDate: formatDate(item.startDate),
    endDate: formatDate(item.endDate)
  }));
};

export const generatePDF = async (content: string): Promise<Blob> => {
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    throw new Error('PDF generation failed');
  }

  return response.blob();
};

export const generateExcel = async (data: ExcelData[]): Promise<Blob> => {
  const response = await fetch('/api/generate-excel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data })
  });

  if (!response.ok) {
    throw new Error('Excel generation failed');
  }

  return response.blob();
}; 