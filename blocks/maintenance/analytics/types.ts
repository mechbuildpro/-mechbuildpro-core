import { MaintenanceTask } from '../types';

export interface TaskAnalytics {
  totalTasks: number;
  tasksByStatus: {
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  averageCompletionTime: number; // in days
  equipmentUtilization: Array<{ equipmentId: string; equipmentName: string; taskCount: number; lastMaintenance: Date | null }>;
  monthlyTrends: Array<{ month: string; completedTasks: number; averageCompletionTime: number }>;
  minCompletionTime: number; // in days
  maxCompletionTime: number; // in days
}

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  equipmentId?: string;
  priority?: MaintenanceTask['priority'];
} 