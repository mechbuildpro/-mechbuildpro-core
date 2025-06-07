type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  category?: 'criticalErrors' | 'issueUpdates' | 'statusChanges' | 'mlAlerts';
}

type Listener = (notification: Notification) => void;

class NotificationService {
  private listeners: Listener[] = [];
  private notifications: Notification[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(type: NotificationType, message: string, category?: Notification['category']) {
    // Check user preferences
    const preferences = this.getUserPreferences();
    if (category && !preferences[category]) {
      return; // Skip if this category is disabled
    }

    const notification: Notification = {
      id: Math.random().toString(36).slice(2),
      type,
      message,
      timestamp: Date.now(),
      category,
    };
    this.notifications.push(notification);
    this.listeners.forEach(listener => listener(notification));
    setTimeout(() => this.remove(notification.id), 5000);
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getNotifications() {
    return this.notifications;
  }

  private getUserPreferences() {
    const defaultPreferences = {
      criticalErrors: true,
      issueUpdates: true,
      statusChanges: true,
      mlAlerts: true,
    };

    try {
      const savedPreferences = localStorage.getItem('notificationPreferences');
      return savedPreferences ? JSON.parse(savedPreferences) : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  }
}

export const notificationService = new NotificationService(); 