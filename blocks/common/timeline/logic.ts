export interface Task {
  id: string;
  taskName: string;
  description?: string;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  assignedTo?: string;
  dependencies?: string[];
  estimatedHours: number;
  actualHours?: number;
  module: 'hvac' | 'fire-pump' | 'zoning' | 'boq' | 'sozlesme';
  milestone: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineStats {
  totalTasks: number;
  completedTasks: number;
  delayedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  completionRate: number;
  moduleStats: {
    [key: string]: {
      total: number;
      completed: number;
      inProgress: number;
      delayed: number;
    };
  };
}

// Görev durumu renkleri
export const STATUS_COLORS = {
  not_started: 'gray',
  in_progress: 'blue',
  completed: 'green',
  delayed: 'red'
};

// Öncelik seviyeleri
export const PRIORITY_LEVELS = {
  low: 1,
  medium: 2,
  high: 3
};

// Görev oluşturma
export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const task: Task = {
    ...taskData,
    id: `TASK-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // API'ye gönder
  const response = await fetch('/api/timeline/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });

  if (!response.ok) {
    throw new Error('Görev oluşturma hatası');
  }

  return task;
}

// Görev güncelleme
export async function updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
  const response = await fetch(`/api/timeline/task/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...taskData,
      updatedAt: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error('Görev güncelleme hatası');
  }

  return response.json();
}

// Görev silme
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/timeline/task/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Görev silme hatası');
  }
}

// Görev listesi alma
export async function getTasks(filters?: {
  status?: Task['status'];
  priority?: Task['priority'];
  module?: Task['module'];
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Task[]> {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
  }

  const response = await fetch(`/api/timeline/tasks?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Görev listesi alma hatası');
  }

  return response.json();
}

// İstatistikleri hesaplama
export function calculateStats(tasks: Task[]): TimelineStats {
  const stats: TimelineStats = {
    totalTasks: tasks.length,
    completedTasks: 0,
    delayedTasks: 0,
    inProgressTasks: 0,
    notStartedTasks: 0,
    totalEstimatedHours: 0,
    totalActualHours: 0,
    completionRate: 0,
    moduleStats: {}
  };

  // Modül istatistiklerini başlat
  const modules = ['hvac', 'fire-pump', 'zoning', 'boq', 'sozlesme'];
  modules.forEach(module => {
    stats.moduleStats[module] = {
      total: 0,
      completed: 0,
      inProgress: 0,
      delayed: 0
    };
  });

  // Görevleri işle
  tasks.forEach(task => {
    // Durum sayılarını güncelle
    switch (task.status) {
      case 'completed':
        stats.completedTasks++;
        stats.moduleStats[task.module].completed++;
        break;
      case 'delayed':
        stats.delayedTasks++;
        stats.moduleStats[task.module].delayed++;
        break;
      case 'in_progress':
        stats.inProgressTasks++;
        stats.moduleStats[task.module].inProgress++;
        break;
      case 'not_started':
        stats.notStartedTasks++;
        break;
    }

    // Modül toplam sayısını güncelle
    stats.moduleStats[task.module].total++;

    // Süreleri topla
    stats.totalEstimatedHours += task.estimatedHours;
    if (task.actualHours) {
      stats.totalActualHours += task.actualHours;
    }
  });

  // Tamamlanma oranını hesapla
  stats.completionRate = (stats.completedTasks / stats.totalTasks) * 100;

  return stats;
}

// Gantt şeması için veri hazırlama
export function prepareGanttData(tasks: Task[]) {
  return tasks.map(task => ({
    id: task.id,
    name: task.taskName,
    start: new Date(task.startDate),
    end: new Date(task.endDate),
    progress: task.status === 'completed' ? 100 :
             task.status === 'in_progress' ? 50 : 0,
    type: task.milestone ? 'milestone' : 'task',
    dependencies: task.dependencies || [],
    custom_class: `priority-${task.priority} status-${task.status}`
  }));
}

// Görev bağımlılıklarını kontrol etme
export function validateDependencies(tasks: Task[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const taskIds = new Set(tasks.map(task => task.id));

  tasks.forEach(task => {
    if (task.dependencies) {
      task.dependencies.forEach(depId => {
        if (!taskIds.has(depId)) {
          errors.push(`Görev ${task.id}: Bağımlılık ${depId} bulunamadı`);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
} 