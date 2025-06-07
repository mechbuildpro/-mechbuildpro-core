// Basic hook for Maintenance Management logic

import { useState, useEffect } from 'react';
import { MaintenanceTask, Equipment } from './types';

// Placeholder API functions (replace with actual API calls)
const fetchMaintenanceTasks = async (): Promise<MaintenanceTask[]> => {
  console.log('Fetching maintenance tasks...');
  // TODO: Implement actual API call to fetch tasks
  // Mock data for demonstration:
  return [
    {
      id: 'task-1',
      name: 'HVAC Filtre Değişimi',
      description: 'Binadaki tüm HVAC filtrelerinin periyodik değişimi.',
      status: 'scheduled',
      priority: 'medium',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Due in 7 days
      assignedTo: 'Teknisyen A',
      equipmentId: 'equip-hvac-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'task-2',
      name: 'Pompa Motoru Kontrolü',
      description: 'Kazan dairesi pompa motorlarının aylık kontrolü.',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 2)), // Overdue by 2 days
      assignedTo: 'Teknisyen B',
      equipmentId: 'equip-pump-002',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
     {
      id: 'task-3',
      name: 'Jeneratör Yıllık Bakımı',
      description: 'Yıllık kapsamlı jeneratör bakım prosedürleri.',
      status: 'completed',
      priority: 'low',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Completed last month
      assignedTo: 'Teknisyen C',
      equipmentId: 'equip-gen-003',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};

const fetchEquipment = async (): Promise<Equipment[]> => {
  console.log('Fetching equipment list...');
  // TODO: Implement actual API call to fetch equipment
   // Mock data for demonstration:
  return [
    {
      id: 'equip-hvac-001',
      name: 'Ana HVAC Ünitesi',
      type: 'HVAC',
      location: 'Çatı Katı',
      serialNumber: 'SN789012',
      installationDate: new Date('2020-05-15'),
      maintenanceHistory: [], // Simplified for mock
    },
    {
      id: 'equip-pump-002',
      name: 'Kazan Dairesi Sirkülasyon Pompası',
      type: 'Pump',
      location: 'Kazan Dairesi',
      serialNumber: 'SN123456',
      installationDate: new Date('2018-11-20'),
      maintenanceHistory: [],
    },
     {
      id: 'equip-gen-003',
      name: 'Yedek Güç Jeneratörü',
      type: 'Generator',
      location: 'Bina Dış Alanı',
      serialNumber: 'SNOPQRS',
      installationDate: new Date('2021-08-10'),
      maintenanceHistory: [],
    },
  ];
};

const createMaintenanceTask = async (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceTask> => {
  console.log('Creating maintenance task:', task);
  // TODO: Implement actual API call to create a task
  const newTask = {
    id: Math.random().toString(36).substr(2, 9),
    ...task,
    createdAt: new Date(),
    updatedAt: new Date(),
    history: [{
      taskId: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      notes: 'Task created',
      statusChange: { from: 'scheduled' as MaintenanceTask['status'], to: task.status }
    }]
  };
  return newTask;
};

const updateMaintenanceTask = async (
  taskId: string, 
  updates: Partial<MaintenanceTask>,
  currentTasks: MaintenanceTask[]
): Promise<MaintenanceTask> => {
  console.log(`Updating maintenance task ${taskId}:`, updates);
  // TODO: Implement actual API call to update a task
  const currentTask = currentTasks.find((t: MaintenanceTask) => t.id === taskId);
  if (!currentTask) {
    throw new Error('Task not found');
  }

  const historyEntry = {
    taskId,
    timestamp: new Date(),
    notes: updates.description ? 'Description updated' : undefined,
    performedBy: updates.assignedTo,
    statusChange: updates.status ? {
      from: currentTask.status,
      to: updates.status
    } : undefined
  };

  const updatedTask = {
    ...currentTask,
    ...updates,
    updatedAt: new Date(),
    history: [...(currentTask.history || []), historyEntry]
  };

  return updatedTask;
};

const deleteMaintenanceTask = async (taskId: string): Promise<void> => {
  console.log(`Deleting maintenance task ${taskId}...`);
  // TODO: Implement actual API call to delete a task
};

// Hook to manage maintenance tasks and equipment
export const useMaintenanceManagement = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]); // Add equipment state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => { // Renamed to loadData
      try {
        setIsLoading(true);
        const fetchedTasks = await fetchMaintenanceTasks();
        const fetchedEquipment = await fetchEquipment(); // Fetch equipment
        setTasks(fetchedTasks);
        setEquipment(fetchedEquipment); // Set equipment state
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data'); // Updated error message
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addTask = async (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await createMaintenanceTask(task);
      setTasks(prev => [...prev, newTask]);
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<MaintenanceTask>) => {
    try {
      const updatedTask = await updateMaintenanceTask(taskId, updates, tasks);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

   const deleteTask = async (taskId: string) => {
      try {
        await deleteMaintenanceTask(taskId);
        setTasks(prev => prev.filter(task => task.id !== taskId));
      } catch (err: any) {
        setError(err.message || 'Failed to delete task');
      }
   };

   // Helper to find equipment by ID
   const getEquipmentById = (equipmentId: string | undefined) => {
       if (!equipmentId) return undefined;
       return equipment.find(equip => equip.id === equipmentId);
   };

  return {
    tasks,
    equipment, // Expose equipment
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    getEquipmentById // Expose helper
  };
}; 