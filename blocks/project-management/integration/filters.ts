'use client';

import { useEffect, useState } from 'react';
import { BaseItem, SystemDependency, IntegrationTest, CommissioningPlan, SystemTransition } from './logic';

// Filtre tipleri
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface FilterOptions {
  searchText: string;
  dateRange: DateRange;
  status: string[];
  priority: string[];
  systems: string[];
  assignedTo: string[];
  type: string[];
}

// Hızlı filtreler
export const quickFilters = {
  last7Days: {
    label: 'Son 7 Gün',
    getDateRange: () => ({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    })
  },
  last30Days: {
    label: 'Son 30 Gün',
    getDateRange: () => ({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    })
  },
  thisMonth: {
    label: 'Bu Ay',
    getDateRange: () => {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      };
    }
  },
  next30Days: {
    label: 'Gelecek 30 Gün',
    getDateRange: () => ({
      start: new Date(),
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })
  }
};

// Filtreleme fonksiyonları
export const filterItems = (
  items: BaseItem[],
  filters: FilterOptions
): BaseItem[] => {
  return items.filter(item => {
    // Metin araması
    if (filters.searchText) {
      const searchFields = [
        item.name,
        item.description,
        'systems' in item && item.systems ? item.systems.join(' ') : '',
        'assignedTo' in item && item.assignments ? item.assignments.map(a => a.assignee).join(' ') : ''
      ].filter((field): field is string => typeof field === 'string');

      if (!searchFields.some(field => 
        field.toLowerCase().includes(filters.searchText.toLowerCase())
      )) {
        return false;
      }
    }

    // Tarih aralığı
    if (filters.dateRange.start || filters.dateRange.end) {
      const itemDate = 'startDate' in item && item.startDate ? new Date(item.startDate) : null;
      if (itemDate) {
        if (filters.dateRange.start && itemDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && itemDate > filters.dateRange.end) {
          return false;
        }
      }
    }

    // Durum
    if (filters.status.length > 0 && !filters.status.includes(item.status)) {
      return false;
    }

    // Öncelik
    if ('priority' in item && filters.priority.length > 0 && !filters.priority.includes(item.priority)) {
      return false;
    }

    // Sistemler
    if ('systems' in item && item.systems && filters.systems.length > 0) {
      if (!item.systems.some(system => filters.systems.includes(system))) {
        return false;
      }
    }

    // Atanan kişi
    if ('assignments' in item && item.assignments && filters.assignedTo.length > 0) {
      if (!item.assignments.some(assignment => filters.assignedTo.includes(assignment.assignee))) {
        return false;
      }
    }

    // Tip
    if (filters.type.length > 0 && !filters.type.includes(item.type)) {
      return false;
    }

    return true;
  });
};

// Filtre kaydetme ve yükleme
export const saveFilter = (name: string, filters: FilterOptions) => {
  const savedFilters = JSON.parse(localStorage.getItem('integrationFilters') || '{}');
  savedFilters[name] = filters;
  localStorage.setItem('integrationFilters', JSON.stringify(savedFilters));
};

export const loadFilter = (name: string): FilterOptions | null => {
  const savedFilters = JSON.parse(localStorage.getItem('integrationFilters') || '{}');
  return savedFilters[name] || null;
};

export const getSavedFilterNames = (): string[] => {
  const savedFilters = JSON.parse(localStorage.getItem('integrationFilters') || '{}');
  return Object.keys(savedFilters);
};

export const deleteFilter = (name: string) => {
  const savedFilters = JSON.parse(localStorage.getItem('integrationFilters') || '{}');
  delete savedFilters[name];
  localStorage.setItem('integrationFilters', JSON.stringify(savedFilters));
};

export function useDateFilters() {
  const [filters, setFilters] = useState(() => ({
    last7Days: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    last30Days: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    next30Days: {
      start: new Date(),
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  }));

  useEffect(() => {
    const updateDates = () => {
      const now = Date.now();
      setFilters(prev => ({
        last7Days: {
          start: new Date(now - 7 * 24 * 60 * 60 * 1000),
          end: new Date(now)
        },
        last30Days: {
          start: new Date(now - 30 * 24 * 60 * 60 * 1000),
          end: new Date(now)
        },
        next30Days: {
          start: new Date(now),
          end: new Date(now + 30 * 24 * 60 * 60 * 1000)
        }
      }));
    };

    // Update every 5 minutes instead of every minute
    const timer = setInterval(updateDates, 300000); // 300000ms = 5 minutes

    return () => {
      clearInterval(timer);
    };
  }, []);

  return filters;
} 