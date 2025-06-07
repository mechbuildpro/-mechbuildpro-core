'use client';

// UI Component for Maintenance Management

import React, { useState, useEffect } from 'react';
import { useMaintenanceManagement } from './logic';
import { MaintenanceTask, Equipment, MaintenanceHistoryEntry } from './types'; // Import Equipment type and MaintenanceHistoryEntry
import { AnalyticsComponent } from './analytics/Component'; // Import AnalyticsComponent

export const MaintenanceComponent: React.FC = () => {
  const { tasks, equipment, isLoading, error, addTask, updateTask, deleteTask, getEquipmentById } = useMaintenanceManagement();
  const [newTaskName, setNewTaskName] = useState(''); // State for the new task name input
  const [newTaskDescription, setNewTaskDescription] = useState(''); // State for the new task description input
  const [newTaskDueDate, setNewTaskDueDate] = useState(''); // State for the new task due date input
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState(''); // State for the new task assigned to input
  const [newTaskEquipmentId, setNewTaskEquipmentId] = useState(''); // State for the new task equipment ID input
  const [filterStatus, setFilterStatus] = useState<'all' | MaintenanceTask['status'] | ''>('all'); // State for filtering tasks by status
  const [filterEquipment, setFilterEquipment] = useState<string>('all'); // State for filtering tasks by equipment
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'name'>('dueDate'); // State for sorting tasks
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // State for sort direction
  const [showAnalytics, setShowAnalytics] = useState(false); // State to toggle analytics view

  // Add loading states for individual operations
  const [isAddingTask, setIsAddingTask] = useState(false); // Loading state for adding a task
  const [isUpdatingTask, setIsUpdatingTask] = useState<string | null>(null); // Loading state for updating a task (holds task ID)
  const [isDeletingTask, setIsDeletingTask] = useState<string | null>(null); // Loading state for deleting a task (holds task ID)
  const [operationError, setOperationError] = useState<string | null>(null); // State to hold operation-specific errors

  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    // Update every minute instead of every second
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000); // 60000ms = 1 minute

    // Initial update
    setNow(Date.now());

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Enhanced filtering and sorting
  // Filters and sorts the tasks based on the current state of filterStatus, filterEquipment, sortBy, and sortDirection.
  const filteredTasks = tasks
    .filter(task => {
      const statusMatch = filterStatus === 'all' || task.status === filterStatus;
      const equipmentMatch = filterEquipment === 'all' || task.equipmentId === filterEquipment;
      return statusMatch && equipmentMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate?.getTime() || Infinity;
        const dateB = b.dueDate?.getTime() || Infinity;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      // name sorting
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

  // Move date comparison to client-side effect
  const [urgentTasks, setUrgentTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    const urgent = new Set<string>();
    
    tasks.forEach(task => {
      if (task.dueDate && 
          new Date(task.dueDate).getTime() < now + weekInMs && 
          task.status !== 'completed' && 
          task.status !== 'cancelled') {
        urgent.add(task.id);
      }
    });
    
    setUrgentTasks(urgent);
  }, [tasks, now]);

  const handleAddTask = async () => {
    if (newTaskName.trim()) {
      try {
        setIsAddingTask(true);
        setOperationError(null);
        await addTask({
          name: newTaskName,
          description: newTaskDescription.trim() || undefined,
          status: 'scheduled', // Default status for new tasks
          priority: 'medium',
          dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
          assignedTo: newTaskAssignedTo.trim() || undefined,
          equipmentId: newTaskEquipmentId || undefined,
        });
        setNewTaskName('');
        setNewTaskDescription('');
        setNewTaskDueDate('');
        setNewTaskAssignedTo('');
        setNewTaskEquipmentId('');
      } catch (err: any) {
        setOperationError(err.message || 'Görev eklenirken bir hata oluştu');
      } finally {
        setIsAddingTask(false);
      }
    }
  };

  const handleUpdateStatus = async (taskId: string, status: MaintenanceTask['status']) => {
    // Handle updating the status of a specific task
    try {
      setIsUpdatingTask(taskId);
      setOperationError(null);
      await updateTask(taskId, { status });
    } catch (err: any) {
      setOperationError(err.message || 'Görev güncellenirken bir hata oluştu');
    } finally {
      setIsUpdatingTask(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Confirm with the user before deleting
    if (window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      try {
        setIsDeletingTask(taskId);
        setOperationError(null);
        await deleteTask(taskId);
      } catch (err: any) {
        setOperationError(err.message || 'Görev silinirken bir hata oluştu');
      } finally {
        setIsDeletingTask(null);
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Bakım Yönetimi</h2>
      <div className="space-y-4">
        {/* Bakım içeriği buraya gelecek */}
        <p>Bakım yönetimi modülü içeriği</p>
      </div>
    </div>
  );
}; 