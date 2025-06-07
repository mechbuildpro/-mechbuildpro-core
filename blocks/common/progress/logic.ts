export interface ProgressItem {
  id: string;
  module: 'hvac' | 'fire-pump' | 'electrical' | 'plumbing' | 'other';
  phase: string;
  startDate: string;
  endDate: string;
  plannedProgress: number;
  actualProgress: number;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
  blockers?: string[];
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProgressStats {
  totalPhases: number;
  completedPhases: number;
  delayedPhases: number;
  atRiskPhases: number;
  overallProgress: number;
  moduleStats: {
    [key: string]: {
      totalPhases: number;
      completedPhases: number;
      averageProgress: number;
      delayedPhases: number;
    };
  };
}

// Durum renkleri
export const STATUS_COLORS = {
  'on-track': 'green',
  'at-risk': 'yellow',
  'delayed': 'red',
  'completed': 'blue'
};

// İlerleme güncelleme
export async function updateProgress(progressData: Omit<ProgressItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProgressItem> {
  const progress: ProgressItem = {
    ...progressData,
    id: `PROG-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const response = await fetch('/api/progress/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(progress)
  });

  if (!response.ok) {
    throw new Error('İlerleme güncelleme hatası');
  }

  return progress;
}

// İlerleme listesi alma
export async function getProgress(filters?: {
  module?: ProgressItem['module'];
  status?: ProgressItem['status'];
  startDate?: string;
  endDate?: string;
}): Promise<ProgressItem[]> {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
  }

  const response = await fetch(`/api/progress/list?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('İlerleme listesi alma hatası');
  }

  return response.json();
}

// İlerleme silme
export async function deleteProgress(id: string): Promise<void> {
  const response = await fetch(`/api/progress/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('İlerleme silme hatası');
  }
}

// İstatistikleri hesaplama
export function calculateStats(items: ProgressItem[]): ProgressStats {
  const stats: ProgressStats = {
    totalPhases: items.length,
    completedPhases: 0,
    delayedPhases: 0,
    atRiskPhases: 0,
    overallProgress: 0,
    moduleStats: {}
  };

  // Modül istatistiklerini başlat
  const modules = ['hvac', 'fire-pump', 'electrical', 'plumbing', 'other'];
  modules.forEach(module => {
    stats.moduleStats[module] = {
      totalPhases: 0,
      completedPhases: 0,
      averageProgress: 0,
      delayedPhases: 0
    };
  });

  // İlerlemeleri işle
  items.forEach(item => {
    // Genel istatistikleri güncelle
    if (item.status === 'completed') {
      stats.completedPhases++;
    } else if (item.status === 'delayed') {
      stats.delayedPhases++;
    } else if (item.status === 'at-risk') {
      stats.atRiskPhases++;
    }

    // Modül istatistiklerini güncelle
    const moduleStats = stats.moduleStats[item.module];
    moduleStats.totalPhases++;
    if (item.status === 'completed') {
      moduleStats.completedPhases++;
    } else if (item.status === 'delayed') {
      moduleStats.delayedPhases++;
    }
    moduleStats.averageProgress += item.actualProgress;
  });

  // Ortalama ilerlemeleri hesapla
  stats.overallProgress = items.reduce((sum, item) => sum + item.actualProgress, 0) / items.length;
  Object.values(stats.moduleStats).forEach(moduleStats => {
    if (moduleStats.totalPhases > 0) {
      moduleStats.averageProgress /= moduleStats.totalPhases;
    }
  });

  return stats;
}

// Gantt chart verisi hazırlama
export function prepareGanttData(items: ProgressItem[]) {
  return items.map(item => ({
    id: item.id,
    name: `${item.module} - ${item.phase}`,
    start: new Date(item.startDate),
    end: new Date(item.endDate),
    progress: item.actualProgress,
    status: item.status,
    dependencies: []
  }));
}

// İlerleme geçmişi
export interface ProgressHistory {
  id: string;
  progressId: string;
  actualProgress: number;
  status: ProgressItem['status'];
  date: string;
  notes?: string;
  updatedBy: string;
}

export async function getProgressHistory(progressId: string): Promise<ProgressHistory[]> {
  const response = await fetch(`/api/progress/${progressId}/history`);
  
  if (!response.ok) {
    throw new Error('İlerleme geçmişi alma hatası');
  }

  return response.json();
}

// İlerleme uyarıları
export function checkProgressAlerts(items: ProgressItem[]): {
  delayed: ProgressItem[];
  atRisk: ProgressItem[];
} {
  const alerts = {
    delayed: [] as ProgressItem[],
    atRisk: [] as ProgressItem[]
  };

  items.forEach(item => {
    if (item.status === 'delayed') {
      alerts.delayed.push(item);
    } else if (item.status === 'at-risk') {
      alerts.atRisk.push(item);
    }
  });

  return alerts;
} 