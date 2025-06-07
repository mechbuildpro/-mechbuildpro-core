import { BaseItem, SystemDependency, IntegrationTest, CommissioningPlan, SystemTransition } from './logic';
import { createNotification, createReminder, createCalendarEvent } from './notifications';
import { Notification } from './notifications';

// Onay durumları
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// Onay adımları
export interface ApprovalStep {
  id: string;
  name: string;
  approver: string;
  status: ApprovalStatus;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Trigger tipleri
export type TriggerType = 'status_change' | 'approval' | 'due_date' | 'manual';

// Trigger koşulları
export interface TriggerCondition {
  itemType: BaseItem['type'];
  status: BaseItem['status'];
  priority?: BaseItem['priority'];
  systems?: string[];
}

// İş akışı aksiyonları
export interface WorkflowAction {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: {
    type: TriggerType;
    conditions: TriggerCondition[];
  };
  actions: {
    type: 'notification' | 'reminder' | 'calendar_event';
    config: {
      type?: 'info' | 'warning' | 'error' | 'success';
      message?: string;
      description?: string;
      location?: string;
      attendees?: string[];
    };
  }[];
}

// Görev atama
export interface TaskAssignment {
  id: string;
  taskId: string;
  assignee: string;
  assignedBy: string;
  assignedAt: Date;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  comments?: string;
}

// Onay süreci oluşturma
export const createApprovalProcess = (
  name: string,
  approver: string
): ApprovalStep => ({
  id: `approval_${Date.now()}`,
  name,
  approver,
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Onay durumunu güncelleme
export const updateApprovalStatus = (
  approval: ApprovalStep,
  status: ApprovalStatus,
  comments?: string
): ApprovalStep => ({
  ...approval,
  status,
  comments,
  updatedAt: new Date()
});

// İş akışı aksiyonu oluşturma
export const createWorkflowAction = (
  name: string,
  description: string,
  trigger: WorkflowAction['trigger'],
  actions: WorkflowAction['actions']
): WorkflowAction => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    description,
    isActive: true,
    trigger,
    actions
  };
};

// Görev atama oluşturma
export const createTaskAssignment = (
  taskId: string,
  assignee: string,
  assignedBy: string,
  dueDate: Date
): TaskAssignment => ({
  id: `assignment_${Date.now()}`,
  taskId,
  assignee,
  assignedBy,
  assignedAt: new Date(),
  dueDate,
  status: 'pending'
});

// Durum değişikliğinde otomatik aksiyonları tetikleme
export const triggerStatusChangeActions = (
  item: BaseItem,
  oldStatus: string,
  workflowActions: WorkflowAction[]
) => {
  const matchingActions = workflowActions.filter(action => {
    if (!action.isActive) return false;
    if (action.trigger.type !== 'status_change') return false;

    return action.trigger.conditions.some(condition => {
      const typeMatch = condition.itemType === item.type;
      const statusMatch = condition.status === item.status;
      const priorityMatch = !condition.priority || condition.priority === item.priority;
      const systemsMatch = !condition.systems || 
        condition.systems.some(system => item.systems.includes(system));

      return typeMatch && statusMatch && priorityMatch && systemsMatch;
    });
  });

  matchingActions.forEach(action => {
    action.actions.forEach(actionType => {
      switch (actionType.type) {
        case 'notification':
          createNotification({
            type: actionType.config.type || 'info',
            message: actionType.config.message || '',
            description: actionType.config.description,
            itemId: item.id,
            itemType: item.type
          });
          break;
        case 'reminder':
          createReminder({
            message: actionType.config.message || '',
            itemId: item.id,
            itemType: item.type,
            dueDate: item.endDate
          });
          break;
        case 'calendar_event':
          createCalendarEvent({
            title: `${item.name} Durum Değişikliği`,
            description: actionType.config.description || '',
            location: actionType.config.location || '',
            startDate: new Date(),
            endDate: new Date(Date.now() + 3600000), // 1 saat sonra
            attendees: actionType.config.attendees || [],
            itemId: item.id,
            itemType: item.type
          });
          break;
      }
    });
  });
};

// Onay sürecini kontrol etme
export const checkApprovalProcess = (
  approvalSteps: ApprovalStep[]
): boolean => {
  // Tüm onaylar tamamlandı mı?
  const allApproved = approvalSteps.every(step => step.status === 'approved');
  // Herhangi bir red var mı?
  const hasRejection = approvalSteps.some(step => step.status === 'rejected');
  
  return allApproved && !hasRejection;
};

// Görev atama durumunu güncelleme
export const updateAssignmentStatus = (
  assignment: TaskAssignment,
  status: TaskAssignment['status'],
  comments?: string
): TaskAssignment => ({
  ...assignment,
  status,
  comments
});

// Örnek iş akışı aksiyonları
export const defaultWorkflowActions: WorkflowAction[] = [
  createWorkflowAction(
    'Kritik Görev Tamamlandı Bildirimi',
    'Kritik öncelikli bir görev tamamlandığında bildirim gönder',
    {
      type: 'status_change',
      conditions: [
        {
          itemType: 'coordination',
          status: 'completed',
          priority: 'critical'
        }
      ]
    },
    [
      {
        type: 'notification',
        config: {
          type: 'success',
          message: 'Kritik görev tamamlandı',
          description: 'Bir kritik görev başarıyla tamamlandı.'
        }
      }
    ]
  ),
  createWorkflowAction(
    'Gecikmiş Görev Hatırlatması',
    'Gecikmiş görevler için hatırlatma gönder',
    {
      type: 'status_change',
      conditions: [
        {
          itemType: 'coordination',
          status: 'delayed',
          systems: ['hvac', 'electrical']
        }
      ]
    },
    [
      {
        type: 'notification',
        config: {
          type: 'warning',
          message: 'Gecikmiş görev',
          description: 'Bir görev gecikmiş durumda.'
        }
      }
    ]
  ),
  createWorkflowAction(
    'Başarısız Test Toplantısı',
    'Test başarısız olduğunda toplantı oluştur',
    {
      type: 'status_change',
      conditions: [
        {
          itemType: 'testing',
          status: 'blocked',
          priority: 'high'
        }
      ]
    },
    [
      {
        type: 'calendar_event',
        config: {
          description: 'Başarısız test değerlendirme toplantısı',
          location: 'Toplantı Odası A',
          attendees: ['test@example.com', 'dev@example.com']
        }
      }
    ]
  )
]; 