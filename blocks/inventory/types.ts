export interface InventoryItem {
  id: string;
  itemName: string;
  itemCode: string;
  category: 'hvac' | 'fire-pump' | 'electrical' | 'plumbing' | 'other';
  unit: 'piece' | 'meter' | 'kg' | 'liter' | 'box';
  quantity: number;
  minQuantity: number;
  location: string;
  supplier?: string;
  unitPrice: number;
  lastRestockDate?: string;
  lastRestockQuantity?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categoryStats: {
    [key: string]: {
      count: number;
      value: number;
      lowStock: number;
    };
  };
}

export const CATEGORY_COLORS = {
  'hvac': 'blue',
  'fire-pump': 'red',
  'electrical': 'yellow',
  'plumbing': 'green',
  'other': 'gray'
};

export const UNIT_SYMBOLS = {
  'piece': 'adet',
  'meter': 'm',
  'kg': 'kg',
  'liter': 'L',
  'box': 'kutu'
};

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  notes?: string;
  performedBy: string;
}

export type InventoryCategory = InventoryItem['category'];
export type InventoryUnit = InventoryItem['unit']; 