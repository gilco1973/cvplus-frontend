// Notification service for displaying user notifications across microservices
import { EventBus, EventTypes } from './EventBus';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // in milliseconds, 0 for persistent
  actions?: NotificationAction[];
  microservice: string;
  timestamp: Date;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'destructive';
}

class NotificationServiceClass {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  // Subscribe to notification changes
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get all current notifications
  getAll(): Notification[] {
    return [...this.notifications];
  }

  // Show a notification
  show(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date()
    };

    this.notifications.push(fullNotification);
    this.notifyListeners();

    // Auto-dismiss after duration (default 5 seconds for non-persistent)
    if (notification.duration !== 0) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    // Emit notification event for other microservices
    EventBus.emit({
      type: EventTypes.NOTIFICATION_SENT,
      source: notification.microservice,
      target: 'all',
      payload: fullNotification
    });

    return id;
  }

  // Convenience methods for different notification types
  success(message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'timestamp'>>): string {
    return this.show({
      type: 'success',
      title: 'Success',
      message,
      microservice: 'core-ui',
      ...options
    });
  }

  error(message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'timestamp'>>): string {
    return this.show({
      type: 'error',
      title: 'Error',
      message,
      duration: 0, // Errors are persistent by default
      microservice: 'core-ui',
      ...options
    });
  }

  warning(message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'timestamp'>>): string {
    return this.show({
      type: 'warning',
      title: 'Warning',
      message,
      duration: 7000, // Longer duration for warnings
      microservice: 'core-ui',
      ...options
    });
  }

  info(message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'timestamp'>>): string {
    return this.show({
      type: 'info',
      title: 'Info',
      message,
      microservice: 'core-ui',
      ...options
    });
  }

  // Dismiss a specific notification
  dismiss(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
    }
  }

  // Dismiss all notifications
  dismissAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Dismiss all notifications from a specific microservice
  dismissByMicroservice(microservice: string): void {
    this.notifications = this.notifications.filter(n => n.microservice !== microservice);
    this.notifyListeners();
  }

  // Dismiss all notifications of a specific type
  dismissByType(type: Notification['type']): void {
    this.notifications = this.notifications.filter(n => n.type !== type);
    this.notifyListeners();
  }

  // Update a notification
  update(id: string, updates: Partial<Omit<Notification, 'id' | 'timestamp'>>): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications[index] = {
        ...this.notifications[index],
        ...updates
      };
      this.notifyListeners();
    }
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications]);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }
}

// Export singleton instance
export const NotificationService = new NotificationServiceClass();