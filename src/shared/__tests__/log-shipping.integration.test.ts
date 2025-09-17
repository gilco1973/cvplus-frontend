/**
 * T015: Log shipping to backend test in frontend/src/__tests__/log-shipping.integration.test.ts
 * CRITICAL: This test MUST FAIL before implementation
 */

import { LogShipper } from '../utils/logging/LogShipper';
import { FrontendLogger } from '../utils/logging/FrontendLogger';
import { LogLevel, LogDomain } from '@cvplus/logging/backend';

// Mock fetch for HTTP requests
global.fetch = jest.fn();

describe('LogShipper Integration', () => {
  let logShipper: LogShipper;
  let mockLogs: any[];

  beforeEach(() => {
    logShipper = new LogShipper({
      endpoint: '/api/logging/frontend',
      batchSize: 10,
      maxRetries: 3,
      retryDelay: 1000,
      compressionEnabled: true,
      authToken: 'test-auth-token'
    });

    mockLogs = [
      {
        id: 'log-1',
        level: LogLevel.INFO,
        domain: LogDomain.BUSINESS,
        message: 'User action performed',
        context: {
          event: 'USER_ACTION',
          action: 'cv_upload_started',
          userId: 'user-ship-test-1'
        },
        timestamp: Date.now(),
        correlationId: 'correlation-123'
      },
      {
        id: 'log-2',
        level: LogLevel.ERROR,
        domain: LogDomain.SYSTEM,
        message: 'API call failed',
        context: {
          event: 'API_ERROR',
          endpoint: '/api/cv/analyze',
          statusCode: 500,
          userId: 'user-ship-test-1'
        },
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        timestamp: Date.now(),
        correlationId: 'correlation-456'
      }
    ];

    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    logShipper.destroy();
  });

  describe('Basic Log Shipping', () => {
    it('should successfully ship logs to backend endpoint', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          logsReceived: 2,
          processedAt: '2023-11-15T18:00:00Z'
        })
      });

      const result = await logShipper.ship(mockLogs);

      expect(result).toMatchObject({
        success: true,
        logsReceived: 2,
        processedAt: '2023-11-15T18:00:00Z'
      });

      expect(fetch).toHaveBeenCalledWith('/api/logging/frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-auth-token',
          'X-Log-Count': '2',
          'X-Client-Version': expect.any(String),
          'Content-Encoding': 'gzip'
        },
        body: expect.any(String) // Compressed data
      });
    });

    it('should handle batch size limits correctly', async () => {
      const largeBatch = Array.from({ length: 25 }, (_, i) => ({
        ...mockLogs[0],
        id: `log-batch-${i}`,
        context: { ...mockLogs[0].context, batchIndex: i }
      }));

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, logsReceived: 10 })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, logsReceived: 10 })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, logsReceived: 5 })
        });

      const result = await logShipper.ship(largeBatch);

      expect(result).toMatchObject({
        success: true,
        batches: 3,
        totalLogsShipped: 25
      });

      expect(fetch).toHaveBeenCalledTimes(3); // Three batches of 10, 10, 5
    });

    it('should compress logs when compression is enabled', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      await logShipper.ship(mockLogs);

      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1].headers;
      const body = fetchCall[1].body;

      expect(headers['Content-Encoding']).toBe('gzip');
      expect(typeof body).toBe('string');
      expect(body.length).toBeLessThan(JSON.stringify(mockLogs).length); // Should be compressed
    });
  });

  describe('Error Handling and Retries', () => {
    it('should retry failed requests with exponential backoff', async () => {
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Timeout error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, logsReceived: 2 })
        });

      const result = await logShipper.ship(mockLogs);

      expect(result).toMatchObject({
        success: true,
        logsReceived: 2,
        retryCount: 2
      });

      expect(fetch).toHaveBeenCalledTimes(3); // Initial attempt + 2 retries
    });

    it('should handle HTTP error responses appropriately', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 429, // Rate limited
          statusText: 'Too Many Requests',
          json: async () => ({ error: 'Rate limit exceeded', retryAfter: 60 })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, logsReceived: 2 })
        });

      const result = await logShipper.ship(mockLogs);

      expect(result).toMatchObject({
        success: true,
        logsReceived: 2,
        retryCount: 1
      });

      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should fail after maximum retry attempts', async () => {
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockRejectedValueOnce(new Error('Network error 2'))
        .mockRejectedValueOnce(new Error('Network error 3'))
        .mockRejectedValueOnce(new Error('Network error 4'));

      await expect(logShipper.ship(mockLogs)).rejects.toThrow('Failed to ship logs after 3 retries');

      expect(fetch).toHaveBeenCalledTimes(4); // Initial attempt + 3 retries
    });
  });

  describe('Queue Management', () => {
    it('should queue logs when offline and ship when online', async () => {
      const queueShipper = new LogShipper({
        endpoint: '/api/logging/frontend',
        batchSize: 10,
        maxRetries: 3,
        queueEnabled: true,
        maxQueueSize: 100
      });

      // Simulate offline state
      (fetch as jest.Mock).mockRejectedValue(new Error('Network unavailable'));

      // Queue logs while offline
      await queueShipper.queueLogs(mockLogs);
      await queueShipper.queueLogs([{ ...mockLogs[0], id: 'log-3' }]);

      expect(queueShipper.getQueueSize()).toBe(3);

      // Simulate coming back online
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, logsReceived: 3 })
      });

      const result = await queueShipper.flushQueue();

      expect(result).toMatchObject({
        success: true,
        logsReceived: 3
      });

      expect(queueShipper.getQueueSize()).toBe(0);

      queueShipper.destroy();
    });

    it('should respect maximum queue size limits', async () => {
      const queueShipper = new LogShipper({
        endpoint: '/api/logging/frontend',
        queueEnabled: true,
        maxQueueSize: 5
      });

      const largeBatch = Array.from({ length: 10 }, (_, i) => ({
        ...mockLogs[0],
        id: `queue-log-${i}`
      }));

      await queueShipper.queueLogs(largeBatch);

      // Should only keep the most recent 5 logs
      expect(queueShipper.getQueueSize()).toBe(5);

      const queuedLogs = queueShipper.getQueuedLogs();
      expect(queuedLogs[0].id).toBe('queue-log-5'); // Oldest kept log
      expect(queuedLogs[4].id).toBe('queue-log-9'); // Most recent log

      queueShipper.destroy();
    });
  });

  describe('Integration with FrontendLogger', () => {
    it('should integrate seamlessly with FrontendLogger automatic shipping', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, logsReceived: 1 })
      });

      const frontendLogger = new FrontendLogger({
        service: 'integration-test',
        environment: 'test',
        userId: 'user-integration-test',
        enableShipping: true,
        batchSize: 2,
        flushInterval: 100,
        shipperConfig: {
          endpoint: '/api/logging/frontend',
          compressionEnabled: true,
          authToken: 'integration-auth-token'
        }
      });

      // Generate logs that will trigger automatic shipping
      frontendLogger.userAction({ action: 'integration_test_1', component: 'IntegrationTest' });
      frontendLogger.userAction({ action: 'integration_test_2', component: 'IntegrationTest' });

      // Wait for automatic flush and shipping
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(fetch).toHaveBeenCalledWith('/api/logging/frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer integration-auth-token',
          'X-Log-Count': '2',
          'X-Client-Version': expect.any(String),
          'Content-Encoding': 'gzip'
        },
        body: expect.any(String)
      });

      frontendLogger.destroy();
    });

    it('should handle partial shipping failures gracefully', async () => {
      const frontendLogger = new FrontendLogger({
        service: 'partial-failure-test',
        enableShipping: true,
        batchSize: 3,
        shipperConfig: {
          endpoint: '/api/logging/frontend',
          maxRetries: 1
        }
      });

      // First batch succeeds, second batch fails
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, logsReceived: 3 })
        })
        .mockRejectedValueOnce(new Error('Server error'))
        .mockRejectedValueOnce(new Error('Server error again'));

      // Generate enough logs for multiple batches
      for (let i = 0; i < 6; i++) {
        frontendLogger.userAction({
          action: `partial_failure_test_${i}`,
          component: 'PartialFailureTest'
        });
      }

      // Force flush
      try {
        await frontendLogger.flush();
      } catch (error) {
        // Expected to fail for some batches
      }

      // First batch should have succeeded
      expect(fetch).toHaveBeenCalledTimes(4); // 1 success + 2 retries for second batch

      frontendLogger.destroy();
    });
  });

  describe('Performance and Monitoring', () => {
    it('should track shipping performance metrics', async () => {
      (fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            status: 200,
            json: async () => ({ success: true, logsReceived: 2 })
          }), 150) // 150ms delay
        )
      );

      const startTime = Date.now();
      const result = await logShipper.ship(mockLogs);
      const endTime = Date.now();

      expect(result).toMatchObject({
        success: true,
        logsReceived: 2,
        shippingDuration: expect.any(Number)
      });

      expect(result.shippingDuration).toBeGreaterThan(140);
      expect(result.shippingDuration).toBeLessThan(200);
    });

    it('should provide detailed shipping statistics', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, logsReceived: 2 })
      });

      await logShipper.ship(mockLogs);
      await logShipper.ship([mockLogs[0]]); // Second shipment

      const stats = logShipper.getShippingStats();

      expect(stats).toMatchObject({
        totalShipments: 2,
        totalLogsShipped: 3,
        successfulShipments: 2,
        failedShipments: 0,
        averageShippingTime: expect.any(Number),
        lastShipmentAt: expect.any(Number)
      });
    });
  });
});