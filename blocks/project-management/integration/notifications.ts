import { BaseItem } from './logic';

export interface Notification {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  description?: string;
  timestamp: Date;
  isRead: boolean;
  itemId?: string;
  itemType?: string;
  groupId?: string;
  actionRequired?: boolean;
  actionDeadline?: Date;
  actionType?: 'approval' | 'review' | 'update';
  metadata?: {
    source?: string;
    category?: string;
    tags?: string[];
    relatedItems?: string[];
  };
}

export interface NotificationGroup {
  id: string;
  title: string;
  type: Notification['type'];
  priority: Notification['priority'];
  notifications: Notification[];
  count: number;
  unreadCount: number;
  hasActionRequired: boolean;
  latestTimestamp: Date;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  relatedItemId?: string;
  relatedItemType?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: 'meeting' | 'deadline' | 'milestone' | 'other';
  attendees?: string[];
  location?: string;
  relatedItemId?: string;
  relatedItemType?: string;
}

export const createNotification = ({
  type,
  priority,
  message,
  description,
  itemId,
  itemType,
  groupId,
  actionRequired,
  actionDeadline,
  actionType,
  metadata
}: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): Notification => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    priority,
    message,
    description,
    timestamp: new Date(),
    isRead: false,
    itemId,
    itemType,
    groupId,
    actionRequired,
    actionDeadline,
    actionType,
    metadata
  };
};

export const createNotificationGroup = (
  notifications: Notification[],
  groupId: string,
  title: string
): NotificationGroup => {
  const groupNotifications = notifications.filter(n => n.groupId === groupId);
  const unreadCount = groupNotifications.filter(n => !n.isRead).length;
  const hasActionRequired = groupNotifications.some(n => n.actionRequired);
  const latestTimestamp = new Date(
    Math.max(...groupNotifications.map(n => new Date(n.timestamp).getTime()))
  );

  return {
    id: groupId,
    title,
    type: getHighestPriorityType(groupNotifications),
    priority: getHighestPriority(groupNotifications),
    notifications: groupNotifications,
    count: groupNotifications.length,
    unreadCount,
    hasActionRequired,
    latestTimestamp
  };
};

export const groupNotifications = (notifications: Notification[]): NotificationGroup[] => {
  const groups: { [key: string]: Notification[] } = {};

  // Group by groupId or itemId
  notifications.forEach(notification => {
    const groupKey = notification.groupId || notification.itemId || 'other';
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });

  // Convert groups to NotificationGroup objects
  return Object.entries(groups).map(([groupId, groupNotifications]) => {
    const title = getGroupTitle(groupNotifications);
    return createNotificationGroup(groupNotifications, groupId, title);
  }).sort((a, b) => {
    // Sort by priority and latest timestamp
    const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
    if (priorityDiff !== 0) return priorityDiff;
    return b.latestTimestamp.getTime() - a.latestTimestamp.getTime();
  });
};

const getGroupTitle = (notifications: Notification[]): string => {
  if (notifications.length === 0) return 'Diğer';
  
  const firstNotification = notifications[0];
  if (firstNotification.itemType) {
    return `${firstNotification.itemType.charAt(0).toUpperCase() + firstNotification.itemType.slice(1)} Bildirimleri`;
  }
  
  return firstNotification.message;
};

const getHighestPriorityType = (notifications: Notification[]): Notification['type'] => {
  const typePriority: { [key in Notification['type']]: number } = {
    error: 3,
    warning: 2,
    success: 1,
    info: 0
  };

  return notifications.reduce((highest, current) => {
    return typePriority[current.type] > typePriority[highest.type] ? current : highest;
  }).type;
};

const getHighestPriority = (notifications: Notification[]): Notification['priority'] => {
  return notifications.reduce((highest, current) => {
    return getPriorityWeight(current.priority) > getPriorityWeight(highest.priority) ? current : highest;
  }).priority;
};

const getPriorityWeight = (priority: Notification['priority']): number => {
  switch (priority) {
    case 'urgent': return 3;
    case 'high': return 2;
    case 'medium': return 1;
    case 'low': return 0;
    default: return 0;
  }
};

export const checkUpcomingTasks = (tasks: any[]): Notification[] => {
  const now = new Date();
  const notifications: Notification[] = [];

  tasks.forEach(task => {
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      // Overdue task
      notifications.push(createNotification({
        type: 'error',
        priority: 'high',
        message: 'Gecikmiş Görev',
        description: `${task.name} görevi gecikti.`,
        itemId: task.id,
        itemType: 'task',
        actionRequired: true,
        actionType: 'update'
      }));
    } else if (daysUntilDue === 0) {
      // Due today
      notifications.push(createNotification({
        type: 'warning',
        priority: 'high',
        message: 'Bugün Biten Görev',
        description: `${task.name} görevi bugün bitiyor.`,
        itemId: task.id,
        itemType: 'task',
        actionRequired: true,
        actionType: 'update'
      }));
    } else if (daysUntilDue <= 3) {
      // Due within 3 days
      notifications.push(createNotification({
        type: 'info',
        priority: 'medium',
        message: 'Yaklaşan Görev',
        description: `${task.name} görevi ${daysUntilDue} gün içinde bitiyor.`,
        itemId: task.id,
        itemType: 'task'
      }));
    } else if (task.priority === 'high' && daysUntilDue <= 7) {
      // High priority task due within a week
      notifications.push(createNotification({
        type: 'warning',
        priority: 'medium',
        message: 'Yüksek Öncelikli Görev',
        description: `${task.name} görevi ${daysUntilDue} gün içinde bitiyor.`,
        itemId: task.id,
        itemType: 'task'
      }));
    }
  });

  return notifications;
};

export const sendEmailNotification = async (params: {
  to: string;
  subject: string;
  body: string;
}): Promise<void> => {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });
  } catch (error) {
    console.error('Email notification error:', error);
    throw error;
  }
};

export const syncWithCalendar = async (params: {
  event: CalendarEvent;
}): Promise<void> => {
  try {
    await fetch('/api/sync-calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    throw error;
  }
}; 