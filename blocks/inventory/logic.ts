import { InventoryItem, InventoryStats, StockMovement } from './types';
import { v4 as uuidv4 } from 'uuid';

// Kategori renkleri
export const CATEGORY_COLORS = {
  'hvac': 'blue',
  'fire-pump': 'red',
  'electrical': 'yellow',
  'plumbing': 'green',
  'other': 'gray'
};

// Birim sembolleri
export const UNIT_SYMBOLS = {
  'piece': 'adet',
  'meter': 'm',
  'kg': 'kg',
  'liter': 'L',
  'box': 'kutu'
};

// Malzeme oluşturma
export async function createItem(itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
  const item: InventoryItem = {
    ...itemData,
    id: `ITEM-${uuidv4()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // API'ye gönder
  const response = await fetch('/api/inventory/item', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });

  if (!response.ok) {
    throw new Error('Malzeme oluşturma hatası');
  }

  return item;
}

// Malzeme güncelleme
export async function updateItem(id: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> {
  const response = await fetch(`/api/inventory/item/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...itemData,
      updatedAt: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error('Malzeme güncelleme hatası');
  }

  return response.json();
}

// Malzeme silme
export async function deleteItem(id: string): Promise<void> {
  const response = await fetch(`/api/inventory/item/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Malzeme silme hatası');
  }
}

// Malzeme listesi alma
export async function getItems(filters?: {
  category?: InventoryItem['category'];
  location?: string;
  supplier?: string;
  lowStock?: boolean;
}): Promise<InventoryItem[]> {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
  }

  const response = await fetch(`/api/inventory/items?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Malzeme listesi alma hatası');
  }

  return response.json();
}

// Stok girişi
export async function addStock(id: string, quantity: number, notes?: string): Promise<InventoryItem> {
  const response = await fetch(`/api/inventory/item/${id}/stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quantity,
      notes,
      type: 'in',
      date: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error('Stok girişi hatası');
  }

  return response.json();
}

// Stok çıkışı
export async function removeStock(id: string, quantity: number, notes?: string): Promise<InventoryItem> {
  const response = await fetch(`/api/inventory/item/${id}/stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quantity,
      notes,
      type: 'out',
      date: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error('Stok çıkışı hatası');
  }

  return response.json();
}

// İstatistikleri hesaplama
export function calculateStats(items: InventoryItem[]): InventoryStats {
  const stats: InventoryStats = {
    totalItems: items.length,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    categoryStats: {}
  };

  // Kategori istatistiklerini başlat
  const categories = ['hvac', 'fire-pump', 'electrical', 'plumbing', 'other'];
  categories.forEach(category => {
    stats.categoryStats[category] = {
      count: 0,
      value: 0,
      lowStock: 0
    };
  });

  // Malzemeleri işle
  items.forEach(item => {
    // Toplam değeri hesapla
    const itemValue = item.quantity * item.unitPrice;
    stats.totalValue += itemValue;

    // Kategori istatistiklerini güncelle
    stats.categoryStats[item.category].count++;
    stats.categoryStats[item.category].value += itemValue;

    // Stok durumunu kontrol et
    if (item.quantity <= 0) {
      stats.outOfStockItems++;
    } else if (item.quantity <= item.minQuantity) {
      stats.lowStockItems++;
      stats.categoryStats[item.category].lowStock++;
    }
  });

  return stats;
}

// Stok hareketi geçmişi
export async function getStockHistory(itemId: string): Promise<StockMovement[]> {
  const response = await fetch(`/api/inventory/item/${itemId}/history`);
  
  if (!response.ok) {
    throw new Error('Stok geçmişi alma hatası');
  }

  return response.json();
}

// Stok uyarıları
export function checkStockAlerts(items: InventoryItem[]): {
  lowStock: InventoryItem[];
  outOfStock: InventoryItem[];
} {
  const alerts = {
    lowStock: [] as InventoryItem[],
    outOfStock: [] as InventoryItem[]
  };

  items.forEach(item => {
    if (item.quantity <= 0) {
      alerts.outOfStock.push(item);
    } else if (item.quantity <= item.minQuantity) {
      alerts.lowStock.push(item);
    }
  });

  return alerts;
}

export function createInventoryItem(data: Partial<InventoryItem>): InventoryItem {
  return {
    id: `ITEM-${uuidv4()}`,
    itemName: data.itemName || '',
    itemCode: data.itemCode || '',
    category: data.category || 'other',
    unit: data.unit || 'piece',
    quantity: data.quantity || 0,
    minQuantity: data.minQuantity || 0,
    location: data.location || '',
    supplier: data.supplier,
    unitPrice: data.unitPrice || 0,
    lastRestockDate: data.lastRestockDate,
    lastRestockQuantity: data.lastRestockQuantity,
    notes: data.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
} 