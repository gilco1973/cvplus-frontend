/**
 * EventBus Cross-Microservice Communication Test
 * Tests the event-driven communication system between microservices
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventBus, EventTypes, type MicroserviceEvent } from '../shared';

describe('EventBus Cross-Microservice Communication', () => {
  beforeEach(() => {
    // Clear all listeners before each test
    EventBus.clear();
  });

  afterEach(() => {
    // Clean up after each test
    EventBus.clear();
  });

  describe('Basic Event Communication', () => {
    it('should allow microservices to communicate via events', () => {
      const receivedEvents: MicroserviceEvent[] = [];

      // Set up listener (simulating auth-ui microservice listening)
      const unsubscribe = EventBus.on(EventTypes.USER_LOGGED_IN, (event) => {
        receivedEvents.push(event);
      });

      // Emit event (simulating premium-ui microservice emitting)
      EventBus.emit({
        type: EventTypes.USER_LOGGED_IN,
        source: 'auth-ui',
        target: 'premium-ui',
        payload: {
          userId: 'user-123',
          email: 'test@example.com',
          premiumTier: 'professional'
        }
      });

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0]).toMatchObject({
        type: EventTypes.USER_LOGGED_IN,
        source: 'auth-ui',
        target: 'premium-ui',
        payload: {
          userId: 'user-123',
          email: 'test@example.com',
          premiumTier: 'professional'
        },
        timestamp: expect.any(Date)
      });

      unsubscribe();
    });

    it('should support multiple microservices listening to the same event', () => {
      const authUIEvents: MicroserviceEvent[] = [];
      const premiumUIEvents: MicroserviceEvent[] = [];
      const analyticsUIEvents: MicroserviceEvent[] = [];

      // Multiple microservices listening to subscription changes
      const unsubscribe1 = EventBus.on(EventTypes.SUBSCRIPTION_CHANGED, (event) => {
        authUIEvents.push(event);
      });

      const unsubscribe2 = EventBus.on(EventTypes.SUBSCRIPTION_CHANGED, (event) => {
        premiumUIEvents.push(event);
      });

      const unsubscribe3 = EventBus.on(EventTypes.SUBSCRIPTION_CHANGED, (event) => {
        analyticsUIEvents.push(event);
      });

      // Emit subscription change event
      EventBus.emit({
        type: EventTypes.SUBSCRIPTION_CHANGED,
        source: 'premium-ui',
        target: 'all',
        payload: {
          userId: 'user-456',
          oldTier: 'free',
          newTier: 'professional',
          effectiveDate: new Date().toISOString()
        }
      });

      // All microservices should receive the event
      expect(authUIEvents).toHaveLength(1);
      expect(premiumUIEvents).toHaveLength(1);
      expect(analyticsUIEvents).toHaveLength(1);

      // Cleanup
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    });

    it('should handle CV processing workflow events', () => {
      const workflowEvents: MicroserviceEvent[] = [];

      // Listen for CV processing events
      const unsubscribe1 = EventBus.on(EventTypes.CV_GENERATED, (event) => {
        workflowEvents.push(event);
      });

      const unsubscribe2 = EventBus.on(EventTypes.CV_ANALYSIS_COMPLETED, (event) => {
        workflowEvents.push(event);
      });

      // Simulate CV processing workflow
      EventBus.emit({
        type: EventTypes.CV_ANALYSIS_COMPLETED,
        source: 'processing-ui',
        target: 'analytics-ui',
        payload: {
          cvId: 'cv-789',
          userId: 'user-789',
          analysisScore: 85,
          recommendations: ['improve-skills-section', 'add-achievements']
        }
      });

      EventBus.emit({
        type: EventTypes.CV_GENERATED,
        source: 'processing-ui',
        target: 'workflow-ui',
        payload: {
          cvId: 'cv-789',
          userId: 'user-789',
          templateId: 'professional-modern',
          status: 'generated'
        }
      });

      expect(workflowEvents).toHaveLength(2);
      expect(workflowEvents[0].type).toBe(EventTypes.CV_ANALYSIS_COMPLETED);
      expect(workflowEvents[1].type).toBe(EventTypes.CV_GENERATED);

      unsubscribe1();
      unsubscribe2();
    });
  });

  describe('Global Event Monitoring', () => {
    it('should support global event monitoring across all microservices', () => {
      const allEvents: MicroserviceEvent[] = [];

      // Global listener (simulating logging-ui microservice)
      const unsubscribe = EventBus.onAll((event) => {
        allEvents.push(event);
      });

      // Emit various events from different microservices
      EventBus.emit({
        type: EventTypes.THEME_CHANGED,
        source: 'core-ui',
        target: 'all',
        payload: { theme: 'dark' }
      });

      EventBus.emit({
        type: EventTypes.LANGUAGE_CHANGED,
        source: 'i18n-ui',
        target: 'all',
        payload: { language: 'es', region: 'ES' }
      });

      EventBus.emit({
        type: EventTypes.ERROR_OCCURRED,
        source: 'multimedia-ui',
        target: 'logging-ui',
        payload: {
          error: 'Failed to process video',
          component: 'VideoProcessor',
          severity: 'high'
        }
      });

      expect(allEvents).toHaveLength(3);
      expect(allEvents.map(e => e.type)).toEqual([
        EventTypes.THEME_CHANGED,
        EventTypes.LANGUAGE_CHANGED,
        EventTypes.ERROR_OCCURRED
      ]);

      unsubscribe();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in event handlers gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const successfulEvents: MicroserviceEvent[] = [];

      // Handler that throws an error
      const unsubscribe1 = EventBus.on(EventTypes.NOTIFICATION_SENT, () => {
        throw new Error('Handler error');
      });

      // Handler that works correctly
      const unsubscribe2 = EventBus.on(EventTypes.NOTIFICATION_SENT, (event) => {
        successfulEvents.push(event);
      });

      EventBus.emit({
        type: EventTypes.NOTIFICATION_SENT,
        source: 'admin-ui',
        target: 'all',
        payload: { message: 'Test notification' }
      });

      // Error should be logged but not prevent other handlers from executing
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in event handler'),
        expect.any(Error)
      );
      expect(successfulEvents).toHaveLength(1);

      unsubscribe1();
      unsubscribe2();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should properly clean up event listeners', () => {
      const events: MicroserviceEvent[] = [];

      const unsubscribe = EventBus.on(EventTypes.MODAL_OPENED, (event) => {
        events.push(event);
      });

      // Verify listener is registered
      expect(EventBus.getListenerCount(EventTypes.MODAL_OPENED)).toBe(1);

      // Emit event
      EventBus.emit({
        type: EventTypes.MODAL_OPENED,
        source: 'core-ui',
        target: 'analytics-ui',
        payload: { modalId: 'settings-modal' }
      });

      expect(events).toHaveLength(1);

      // Unsubscribe
      unsubscribe();

      // Verify listener is removed
      expect(EventBus.getListenerCount(EventTypes.MODAL_OPENED)).toBe(0);

      // Emit another event - should not be received
      EventBus.emit({
        type: EventTypes.MODAL_OPENED,
        source: 'core-ui',
        target: 'analytics-ui',
        payload: { modalId: 'help-modal' }
      });

      expect(events).toHaveLength(1); // Still only 1 event
    });

    it('should track listener counts correctly', () => {
      expect(EventBus.getListenerCount()).toBe(0);

      const unsubscribe1 = EventBus.on(EventTypes.USER_LOGGED_IN, () => {});
      const unsubscribe2 = EventBus.on(EventTypes.USER_LOGGED_IN, () => {});
      const unsubscribe3 = EventBus.on(EventTypes.USER_LOGGED_OUT, () => {});

      expect(EventBus.getListenerCount(EventTypes.USER_LOGGED_IN)).toBe(2);
      expect(EventBus.getListenerCount(EventTypes.USER_LOGGED_OUT)).toBe(1);
      expect(EventBus.getListenerCount()).toBe(3);

      unsubscribe1();
      expect(EventBus.getListenerCount(EventTypes.USER_LOGGED_IN)).toBe(1);
      expect(EventBus.getListenerCount()).toBe(2);

      unsubscribe2();
      unsubscribe3();
      expect(EventBus.getListenerCount()).toBe(0);
    });
  });

  describe('Microservice Integration Scenarios', () => {
    it('should support premium feature unlock workflow', () => {
      const workflowEvents: { microservice: string; event: MicroserviceEvent }[] = [];

      // Auth UI listens for feature unlocks
      const authUnsubscribe = EventBus.on(EventTypes.FEATURE_UNLOCKED, (event) => {
        workflowEvents.push({ microservice: 'auth-ui', event });
      });

      // Processing UI listens for feature unlocks
      const cvUnsubscribe = EventBus.on(EventTypes.FEATURE_UNLOCKED, (event) => {
        workflowEvents.push({ microservice: 'processing-ui', event });
      });

      // Analytics UI listens for feature unlocks
      const analyticsUnsubscribe = EventBus.on(EventTypes.FEATURE_UNLOCKED, (event) => {
        workflowEvents.push({ microservice: 'analytics-ui', event });
      });

      // Premium UI emits feature unlock event
      EventBus.emit({
        type: EventTypes.FEATURE_UNLOCKED,
        source: 'premium-ui',
        target: 'all',
        payload: {
          userId: 'user-premium-123',
          feature: 'advanced-cv-templates',
          tier: 'professional',
          unlockDate: new Date().toISOString()
        }
      });

      expect(workflowEvents).toHaveLength(3);
      expect(workflowEvents.map(we => we.microservice)).toEqual([
        'auth-ui',
        'processing-ui',
        'analytics-ui'
      ]);

      authUnsubscribe();
      cvUnsubscribe();
      analyticsUnsubscribe();
    });

    it('should support error propagation across microservices', () => {
      const errorEvents: MicroserviceEvent[] = [];

      // Logging UI listens for all errors
      const loggingUnsubscribe = EventBus.on(EventTypes.ERROR_OCCURRED, (event) => {
        errorEvents.push(event);
      });

      // Admin UI listens for errors to show in monitoring dashboard
      const adminUnsubscribe = EventBus.on(EventTypes.ERROR_OCCURRED, (event) => {
        errorEvents.push(event);
      });

      // Simulate error in multimedia processing
      EventBus.emit({
        type: EventTypes.ERROR_OCCURRED,
        source: 'multimedia-ui',
        target: 'all',
        payload: {
          error: 'Video upload failed',
          errorCode: 'UPLOAD_001',
          userId: 'user-error-test',
          timestamp: new Date().toISOString(),
          severity: 'medium'
        }
      });

      expect(errorEvents).toHaveLength(2);
      expect(errorEvents[0].payload.error).toBe('Video upload failed');

      loggingUnsubscribe();
      adminUnsubscribe();
    });
  });
});