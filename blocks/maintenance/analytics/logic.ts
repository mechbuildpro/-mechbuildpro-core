import { TaskAnalytics, AnalyticsFilters } from './types';
import { MaintenanceTask, Equipment } from '../types';

// Define TypeScript interfaces for Maintenance Management module

export interface MaintenanceTask {
  id: string;
  name: string;
  description?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedTo?: string;
  equipmentId?: string; // Link to equipment
  createdAt: Date;
  updatedAt: Date;
  history?: MaintenanceHistoryEntry[]; // Add history field
}

export interface Equipment {
  id: string;
  name: string;
  type: string; // e.g., HVAC, Pump, etc.
  location?: string;
  serialNumber?: string;
  installationDate?: Date;
  maintenanceHistory?: MaintenanceTask[]; // Link to tasks
}

export interface MaintenanceHistoryEntry {
  taskId: string;
  timestamp: Date;
  notes?: string;
  performedBy?: string;
  statusChange?: { from: MaintenanceTask['status'], to: MaintenanceTask['status'] };
}

export interface TaskAnalytics {
  totalTasks: number;
  tasksByStatus: { scheduled: number; in_progress: number; completed: number; cancelled: number };
  tasksByPriority: { low: number; medium: number; high: number };
  averageCompletionTime: number; // in days
  equipmentUtilization: Array<{ equipmentId: string; equipmentName: string; taskCount: number; lastMaintenance: Date | null }>;
  monthlyTrends: Array<{ month: string; completedTasks: number; averageCompletionTime: number }>;
  minCompletionTime: number; // Add minimum completion time in days
  maxCompletionTime: number; // Add maximum completion time in days
}

// Define analytics filters interface
export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  equipmentId?: string;
  priority?: MaintenanceTask['priority'];
}

// Function to calculate maintenance task analytics based on tasks, equipment, and optional filters
export const calculateTaskAnalytics = (
  tasks: MaintenanceTask[],
  equipment: Equipment[],
  filters?: AnalyticsFilters
): TaskAnalytics => {
  // Apply filters to the tasks list
  const filteredTasks = tasks.filter(task => {
    // Filter by start date
    if (filters?.startDate && task.createdAt < filters.startDate) return false;
    // Filter by end date
    if (filters?.endDate && task.createdAt > filters.endDate) return false;
    // Filter by equipment ID
    if (filters?.equipmentId && task.equipmentId !== filters.equipmentId) return false;
    // Filter by priority
    if (filters?.priority && task.priority !== filters.priority) return false;
    return true;
  });

  // Calculate the count of tasks by their status
  const tasksByStatus = {
    scheduled: filteredTasks.filter(t => t.status === 'scheduled').length,
    in_progress: filteredTasks.filter(t => t.status === 'in_progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    cancelled: filteredTasks.filter(t => t.status === 'cancelled').length,
  };

  // Calculate the count of tasks by their priority
  const tasksByPriority = {
    high: filteredTasks.filter(t => t.priority === 'high').length,
    medium: filteredTasks.filter(t => t.priority === 'medium').length,
    low: filteredTasks.filter(t => t.priority === 'low').length,
  };

  // Calculate average, min, and max completion time for completed tasks
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  
  let minCompletionTime = Infinity;
  let maxCompletionTime = 0;

  const totalCompletionTime = completedTasks.reduce((sum, task) => {
    const completionTime = task.updatedAt.getTime() - task.createdAt.getTime();
    if (completionTime < minCompletionTime) minCompletionTime = completionTime;
    if (completionTime > maxCompletionTime) maxCompletionTime = completionTime;
    return sum + completionTime;
  }, 0);

  const averageCompletionTime = completedTasks.length > 0
    ? totalCompletionTime / completedTasks.length / (1000 * 60 * 60 * 24) // Convert milliseconds to days
    : 0;
    
  const minCompletionTimeDays = minCompletionTime === Infinity ? 0 : minCompletionTime / (1000 * 60 * 60 * 24);
  const maxCompletionTimeDays = maxCompletionTime / (1000 * 60 * 60 * 24);

  // Calculate equipment utilization statistics
  const equipmentUtilization = equipment.map(equip => {
    // Filter tasks for the current equipment
    const equipmentTasks = filteredTasks.filter(t => t.equipmentId === equip.id);
    // Find the date of the last maintenance task for this equipment
    const lastMaintenance = equipmentTasks.length > 0
      ? new Date(Math.max(...equipmentTasks.map(t => t.updatedAt.getTime())))
      : null;

    return {
      equipmentId: equip.id,
      equipmentName: equip.name,
      taskCount: equipmentTasks.length,
      lastMaintenance,
    };
  });

  // Calculate monthly trends for completed tasks and average completion time
  const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().slice(0, 7); // Get YYYY-MM format for the month

    // Filter tasks created in the current month
    const monthTasks = filteredTasks.filter(t => {
      const taskDate = new Date(t.createdAt);
      return taskDate.toISOString().slice(0, 7) === monthStr;
    });

    // Filter completed tasks within the current month
    const completedMonthTasks = monthTasks.filter(t => t.status === 'completed');
    // Calculate average completion time for tasks completed in this month
    const monthCompletionTime = completedMonthTasks.length > 0
      ? completedMonthTasks.reduce((sum, task) => {
          const completionTime = task.updatedAt.getTime() - task.createdAt.getTime();
          return sum + completionTime;
        }, 0) / completedMonthTasks.length / (1000 * 60 * 60 * 24) // Convert milliseconds to days
      : 0;

    return {
      month: monthStr,
      completedTasks: completedMonthTasks.length,
      averageCompletionTime: monthCompletionTime,
    };
  }).reverse(); // Reverse to show recent months first

  // Return the calculated analytics data
  return {
    totalTasks: filteredTasks.length,
    tasksByStatus,
    tasksByPriority,
    averageCompletionTime,
    equipmentUtilization,
    monthlyTrends,
    minCompletionTime: minCompletionTimeDays,
    maxCompletionTime: maxCompletionTimeDays,
  };
}; 