/**
 * T014: Frontend logger enhancement test in frontend/src/__tests__/frontend-logging.integration.test.ts
 * CRITICAL: This test MUST FAIL before implementation
 */

import { FrontendLogger } from '../utils/logging/FrontendLogger';
import { LogLevel, LogDomain } from '@cvplus/logging/backend';

// Mock fetch for shipping logs to backend
global.fetch = jest.fn();

describe('FrontendLogger Integration', () => {
  let frontendLogger: FrontendLogger;

  beforeEach(() => {
    frontendLogger = new FrontendLogger({
      service: 'frontend-test',
      environment: 'test',
      userId: 'user-frontend-test',
      enableShipping: true,
      batchSize: 5,
      flushInterval: 1000
    });

    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    frontendLogger.destroy();
    jest.clearAllMocks();
  });

  describe('User Interaction Logging', () => {
    it('should log user actions with context and timing', async () => {
      const mockUserAction = {
        action: 'cv_upload_started',
        component: 'CVUploadDialog',
        userId: 'user-frontend-test',
        sessionId: 'session-frontend-123',
        pageUrl: '/cv/upload',
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        metadata: {
          fileSize: 2048576, // 2MB
          fileType: 'application/pdf',
          fileName: 'john-doe-resume.pdf'
        }
      };

      const correlationId = frontendLogger.userAction(mockUserAction);

      expect(correlationId).toBeDefined();
      expect(correlationId).toMatch(/^[a-zA-Z0-9\-_]{21}$/);

      const logEntry = frontendLogger.getLastLogEntry();
      expect(logEntry).toMatchObject({
        level: LogLevel.INFO,
        domain: LogDomain.BUSINESS,
        message: 'User action performed',
        context: {
          event: 'USER_ACTION',
          action: 'cv_upload_started',
          component: 'CVUploadDialog',
          userId: 'user-frontend-test',
          pageUrl: '/cv/upload',
          fileSize: 2048576,
          fileType: 'application/pdf'
        },
        correlationId: expect.any(String),
        timestamp: expect.any(Number)
      });

      // Ensure sensitive data is redacted
      expect(logEntry.context).not.toHaveProperty('sessionId');
      expect(logEntry.context).not.toHaveProperty('fileName');
    });

    it('should log UI errors with stack traces and context', async () => {
      const mockError = new Error('Failed to render CV preview');
      mockError.stack = 'Error: Failed to render CV preview\n    at CVPreview.tsx:45:12';

      const mockUIError = {
        error: mockError,
        component: 'CVPreview',
        props: {
          cvId: 'cv-preview-123',
          userId: 'user-error-test'
        },
        state: {
          loading: false,
          data: null,
          error: true
        },
        userAgent: navigator.userAgent,
        url: '/cv/preview/cv-preview-123',
        timestamp: Date.now()
      };

      const correlationId = frontendLogger.uiError(mockUIError);

      expect(correlationId).toBeDefined();

      const logEntry = frontendLogger.getLastLogEntry();
      expect(logEntry).toMatchObject({
        level: LogLevel.ERROR,
        domain: LogDomain.SYSTEM,
        message: 'UI component error occurred',
        context: {
          event: 'UI_ERROR',
          component: 'CVPreview',
          url: '/cv/preview/cv-preview-123',
          propsKeys: ['cvId', 'userId'],
          stateKeys: ['loading', 'data', 'error']
        },
        error: {
          message: 'Failed to render CV preview',
          stack: expect.stringContaining('CVPreview.tsx:45:12'),
          name: 'Error'
        }
      });

      // Ensure sensitive props/state data is not logged in detail
      expect(logEntry.context).not.toHaveProperty('props');
      expect(logEntry.context).not.toHaveProperty('state');
    });

    it('should log performance metrics with timing data', async () => {
      const mockPerformanceMetric = {
        metric: 'page_load_time',
        value: 1250, // 1.25 seconds
        page: '/cv/analysis',
        userId: 'user-performance-test',
        additionalMetrics: {
          domContentLoaded: 800,
          firstPaint: 650,
          firstContentfulPaint: 750,
          largestContentfulPaint: 1100
        },
        userAgent: navigator.userAgent,
        connectionType: 'wifi',
        timestamp: Date.now()
      };

      const correlationId = frontendLogger.performanceMetric(mockPerformanceMetric);

      expect(correlationId).toBeDefined();

      const logEntry = frontendLogger.getLastLogEntry();
      expect(logEntry).toMatchObject({
        level: LogLevel.INFO,
        domain: LogDomain.PERFORMANCE,
        message: 'Performance metric recorded',
        context: {
          event: 'PERFORMANCE_METRIC',
          metric: 'page_load_time',
          page: '/cv/analysis',
          userId: 'user-performance-test',
          connectionType: 'wifi'
        },
        performance: {
          value: 1250,
          additionalMetrics: {
            domContentLoaded: 800,
            firstPaint: 650,
            firstContentfulPaint: 750,
            largestContentfulPaint: 1100
          }
        }
      });
    });
  });

  describe('API Integration Logging', () => {
    it('should log API calls with request/response metadata', async () => {
      const mockAPICall = {
        endpoint: '/api/cv/analyze',
        method: 'POST',
        requestId: 'req-api-123',
        userId: 'user-api-test',
        startTime: Date.now(),
        endTime: Date.now() + 2500, // 2.5 seconds
        statusCode: 200,
        responseSize: 15360, // 15KB
        requestHeaders: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer [TOKEN_REDACTED]'
        },
        responseTime: 2500
      };

      const correlationId = frontendLogger.apiCall(mockAPICall);

      expect(correlationId).toBeDefined();

      const logEntry = frontendLogger.getLastLogEntry();
      expect(logEntry).toMatchObject({
        level: LogLevel.INFO,
        domain: LogDomain.PERFORMANCE,
        message: 'API call completed',
        context: {
          event: 'API_CALL',
          endpoint: '/api/cv/analyze',
          method: 'POST',
          requestId: 'req-api-123',
          userId: 'user-api-test',
          statusCode: 200,
          responseSize: 15360
        },
        performance: {
          duration: 2500
        }
      });

      // Ensure authorization headers are redacted
      expect(logEntry.context).not.toHaveProperty('requestHeaders');
    });

    it('should log WebSocket connection events', async () => {
      const mockWebSocketEvent = {
        event: 'connection_established',
        url: 'wss://api.cvplus.app/ws/cv-processing',
        userId: 'user-websocket-test',
        sessionId: 'ws-session-456',
        protocols: ['json'],
        readyState: 1, // OPEN
        timestamp: Date.now(),
        reconnectAttempt: 0
      };

      const correlationId = frontendLogger.webSocketEvent(mockWebSocketEvent);

      expect(correlationId).toBeDefined();

      const logEntry = frontendLogger.getLastLogEntry();
      expect(logEntry).toMatchObject({
        level: LogLevel.INFO,
        domain: LogDomain.SYSTEM,
        message: 'WebSocket event occurred',
        context: {
          event: 'WEBSOCKET_EVENT',
          wsEvent: 'connection_established',
          url: 'wss://api.cvplus.app/ws/cv-processing',
          userId: 'user-websocket-test',
          readyState: 1,
          reconnectAttempt: 0
        }
      });

      // Ensure session IDs are not logged
      expect(logEntry.context).not.toHaveProperty('sessionId');
    });
  });

  describe('Log Shipping to Backend', () => {
    it('should batch and ship logs to backend endpoint', async () => {
      // Configure mock successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, logsReceived: 3 })
      });

      // Generate multiple log entries
      frontendLogger.userAction({ action: 'test_action_1', component: 'TestComponent1' });
      frontendLogger.userAction({ action: 'test_action_2', component: 'TestComponent2' });
      frontendLogger.userAction({ action: 'test_action_3', component: 'TestComponent3' });

      // Force flush logs
      await frontendLogger.flush();

      expect(fetch).toHaveBeenCalledWith('/api/logging/frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': expect.any(String)
        },
        body: expect.stringContaining('test_action_1')
      });

      // Parse the request body to verify structure
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody).toMatchObject({
        service: 'frontend-test',
        environment: 'test',
        userId: 'user-frontend-test',
        logs: expect.arrayContaining([
          expect.objectContaining({
            level: LogLevel.INFO,
            domain: LogDomain.BUSINESS,
            context: expect.objectContaining({
              action: 'test_action_1'
            })
          })
        ])
      });
    });

    it('should handle log shipping failures with retry mechanism', async () => {
      // Configure mock failed response
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, logsReceived: 1 })
        });

      frontendLogger.userAction({ action: 'failed_ship_test', component: 'TestComponent' });

      // First flush should fail
      await expect(frontendLogger.flush()).rejects.toThrow('Network error');

      // Second flush should succeed (retry mechanism)
      await expect(frontendLogger.flush()).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should respect batch size and automatic flushing', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      // Create logger with small batch size for testing
      const batchLogger = new FrontendLogger({
        service: 'batch-test',
        environment: 'test',
        userId: 'user-batch-test',
        enableShipping: true,
        batchSize: 2, // Small batch size
        flushInterval: 100 // Quick flush interval
      });

      // Generate logs that exceed batch size
      batchLogger.userAction({ action: 'batch_test_1', component: 'BatchTest' });
      batchLogger.userAction({ action: 'batch_test_2', component: 'BatchTest' });
      batchLogger.userAction({ action: 'batch_test_3', component: 'BatchTest' }); // Should trigger flush

      // Wait for automatic flush
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(fetch).toHaveBeenCalledTimes(2); // Two batches sent

      batchLogger.destroy();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should integrate with React Error Boundaries', async () => {
      const mockErrorBoundary = {
        error: new Error('Component render failed'),
        errorInfo: {
          componentStack: '\n    in CVGenerator (at App.tsx:45)\n    in App (at index.tsx:10)'
        },
        component: 'CVGenerator',
        userId: 'user-boundary-test',
        props: { cvId: 'cv-boundary-123' },
        timestamp: Date.now()
      };

      const correlationId = frontendLogger.errorBoundaryTriggered(mockErrorBoundary);

      expect(correlationId).toBeDefined();

      const logEntry = frontendLogger.getLastLogEntry();
      expect(logEntry).toMatchObject({
        level: LogLevel.ERROR,
        domain: LogDomain.SYSTEM,
        message: 'React Error Boundary triggered',
        context: {
          event: 'ERROR_BOUNDARY_TRIGGERED',
          component: 'CVGenerator',
          userId: 'user-boundary-test'
        },
        error: {
          message: 'Component render failed',
          stack: expect.stringContaining('CVGenerator'),
          componentStack: expect.stringContaining('CVGenerator (at App.tsx:45)')
        }
      });

      // Ensure props are not logged in detail
      expect(logEntry.context).not.toHaveProperty('props');
    });
  });

  describe('Context and Correlation Management', () => {
    it('should maintain user context across log entries', () => {
      frontendLogger.setUserContext({
        userId: 'user-context-updated',
        sessionId: 'session-updated-123',
        tier: 'premium',
        experimentGroups: ['cv_v2', 'ui_refresh']
      });

      frontendLogger.userAction({ action: 'context_test', component: 'ContextTest' });

      const logEntry = frontendLogger.getLastLogEntry();
      expect(logEntry.context.userId).toBe('user-context-updated');
      expect(logEntry.context.tier).toBe('premium');
      expect(logEntry.context.experimentGroups).toEqual(['cv_v2', 'ui_refresh']);

      // Ensure session ID is not included
      expect(logEntry.context).not.toHaveProperty('sessionId');
    });

    it('should support correlation ID chaining', () => {
      const parentCorrelationId = 'parent-correlation-123';

      const childCorrelationId = frontendLogger.withCorrelation(parentCorrelationId, () => {
        return frontendLogger.userAction({
          action: 'child_action',
          component: 'ChildComponent'
        });
      });

      expect(childCorrelationId).toBe(parentCorrelationId);

      const logEntry = frontendLogger.getLastLogEntry();
      expect(logEntry.correlationId).toBe(parentCorrelationId);
    });
  });
});