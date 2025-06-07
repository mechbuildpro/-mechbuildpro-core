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