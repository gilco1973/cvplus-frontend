// EventBus service for cross-microservice communication
import type { MicroserviceEvent, EventHandler } from '../types/common';

class EventBusService {
  private listeners: Map<string, EventHandler[]> = new Map();
  private globalListeners: EventHandler[] = [];

  // Subscribe to specific event types
  on(eventType: string, handler: EventHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => this.off(eventType, handler);
  }

  // Subscribe to all events
  onAll(handler: EventHandler): () => void {
    this.globalListeners.push(handler);

    return () => {
      const index = this.globalListeners.indexOf(handler);
      if (index > -1) {
        this.globalListeners.splice(index, 1);
      }
    };
  }

  // Unsubscribe from specific event type
  off(eventType: string, handler: EventHandler): void {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Emit an event to subscribers
  emit(event: Omit<MicroserviceEvent, 'timestamp'>): void {
    const fullEvent: MicroserviceEvent = {
      ...event,
      timestamp: new Date()
    };

    // Call global listeners
    this.globalListeners.forEach(handler => {
      try {
        handler(fullEvent);
      } catch (error) {
        console.error('Error in global event handler:', error);
      }
    });

    // Call specific event type listeners
    const handlers = this.listeners.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(fullEvent);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });
    }
  }

  // Clear all listeners (useful for cleanup)
  clear(): void {
    this.listeners.clear();
    this.globalListeners = [];
  }

  // Get event history for debugging
  getListenerCount(eventType?: string): number {
    if (eventType) {
      return this.listeners.get(eventType)?.length || 0;
    }

    let total = this.globalListeners.length;
    this.listeners.forEach(handlers => {
      total += handlers.length;
    });

    return total;
  }
}

// Export singleton instance
export const EventBus = new EventBusService();

// Common event types used across microservices
export const EventTypes = {
  // Authentication events
  USER_LOGGED_IN: 'user-logged-in',
  USER_LOGGED_OUT: 'user-logged-out',
  PERMISSIONS_CHANGED: 'permissions-changed',

  // CV processing events
  CV_GENERATED: 'cv-generated',
  CV_ANALYSIS_COMPLETED: 'cv-analysis-completed',
  CV_TEMPLATE_SELECTED: 'cv-template-selected',

  // Premium events
  SUBSCRIPTION_CHANGED: 'subscription-changed',
  FEATURE_UNLOCKED: 'feature-unlocked',
  BILLING_UPDATED: 'billing-updated',

  // UI events
  THEME_CHANGED: 'theme-changed',
  LANGUAGE_CHANGED: 'language-changed',
  NAVIGATION_CHANGED: 'navigation-changed',

  // System events
  ERROR_OCCURRED: 'error-occurred',
  NOTIFICATION_SENT: 'notification-sent',
  MODAL_OPENED: 'modal-opened',
  MODAL_CLOSED: 'modal-closed'
} as const;