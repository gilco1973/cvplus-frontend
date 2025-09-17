/**
 * T052: useLogStream hook in frontend/src/hooks/useLogStream.ts
 *
 * Custom React hook for managing real-time log streaming using Server-Sent Events.
 * Provides live log tailing, connection management, and automatic reconnection.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { LogLevel, LogDomain, LogEntry } from '@cvplus/logging';

export interface LogStreamConfig {
  level?: LogLevel[];
  domain?: LogDomain[];
  component?: string[];
  userId?: string[];
  includePattern?: string;
  excludePattern?: string;
  onlyErrors?: boolean;
  onlyNewLogs?: boolean;
  maxEventsPerSecond?: number;
  heartbeatInterval?: number;
  timeout?: number;
  includeContext?: boolean;
  includeStack?: boolean;
  bufferSize?: number; // Max number of logs to keep in memory
}

export interface StreamStats {
  activeSubscriptions: number;
  totalEvents: number;
  bufferSize: number;
  uptime: number;
}

export interface LogStreamEvent {
  id: string;
  type: 'log' | 'heartbeat' | 'error' | 'stats' | 'disconnect';
  timestamp: string;
  data?: any;
  metadata?: {
    streamId: string;
    sequenceNumber: number;
    bufferSize?: number;
  };
}

interface UseLogStreamReturn {
  logs: LogEntry[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  stats: StreamStats | null;
  connect: () => void;
  disconnect: () => void;
  clearLogs: () => void;
  lastEvent: LogStreamEvent | null;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/v1';
const DEFAULT_BUFFER_SIZE = 1000;

export const useLogStream = (config: LogStreamConfig = {}): UseLogStreamReturn => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StreamStats | null>(null);
  const [lastEvent, setLastEvent] = useState<LogStreamEvent | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000); // Start with 1 second

  const bufferSize = config.bufferSize || DEFAULT_BUFFER_SIZE;

  // Build query parameters for the stream
  const buildStreamUrl = useCallback((config: LogStreamConfig): string => {
    const params = new URLSearchParams();

    // Configure stream parameters
    if (config.level?.length) {
      config.level.forEach(level => params.append('level', level));
    }
    if (config.domain?.length) {
      config.domain.forEach(domain => params.append('domain', domain));
    }
    if (config.component?.length) {
      config.component.forEach(component => params.append('component', component));
    }
    if (config.userId?.length) {
      config.userId.forEach(userId => params.append('userId', userId));
    }
    if (config.includePattern) {
      params.set('includePattern', config.includePattern);
    }
    if (config.excludePattern) {
      params.set('excludePattern', config.excludePattern);
    }
    if (config.onlyErrors) {
      params.set('onlyErrors', 'true');
    }
    if (config.onlyNewLogs !== undefined) {
      params.set('onlyNewLogs', config.onlyNewLogs.toString());
    }
    if (config.maxEventsPerSecond) {
      params.set('maxEventsPerSecond', config.maxEventsPerSecond.toString());
    }
    if (config.heartbeatInterval) {
      params.set('heartbeatInterval', config.heartbeatInterval.toString());
    }
    if (config.timeout) {
      params.set('timeout', config.timeout.toString());
    }
    if (config.includeContext) {
      params.set('includeContext', 'true');
    }
    if (config.includeStack) {
      params.set('includeStack', 'true');
    }

    return `${API_BASE_URL}/logs/stream?${params.toString()}`;
  }, []);

  // Add new log to the buffer with size management
  const addLogToBuffer = useCallback((log: LogEntry) => {
    setLogs(prevLogs => {
      const newLogs = [...prevLogs, log];

      // Maintain buffer size limit
      if (newLogs.length > bufferSize) {
        return newLogs.slice(newLogs.length - bufferSize);
      }

      return newLogs;
    });
  }, [bufferSize]);

  // Handle incoming stream events
  const handleStreamEvent = useCallback((event: LogStreamEvent) => {
    setLastEvent(event);

    switch (event.type) {
      case 'log':
        if (event.data) {
          addLogToBuffer(event.data);
        }
        break;

      case 'heartbeat':
        // Update connection status and stats
        if (event.data) {
          setStats(prevStats => ({
            ...prevStats,
            ...event.data
          }));
        }
        break;

      case 'stats':
        if (event.data) {
          setStats(event.data);
        }
        break;

      case 'error':
        console.error('Stream error:', event.data);
        setError(event.data?.message || 'Stream error occurred');
        break;

      case 'disconnect':
        console.log('Stream disconnected:', event.data?.reason);
        break;

      default:
        console.log('Unknown stream event:', event);
    }
  }, [addLogToBuffer]);

  // Connect to the log stream
  const connect = useCallback(() => {
    if (isConnected || isConnecting) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const url = buildStreamUrl(config);
      console.log('Connecting to log stream:', url);

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('Log stream connected');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000; // Reset delay
      };

      eventSource.onmessage = (event) => {
        try {
          const streamEvent: LogStreamEvent = JSON.parse(event.data);
          handleStreamEvent(streamEvent);
        } catch (error) {
          console.error('Error parsing stream event:', error, event.data);
        }
      };

      eventSource.onerror = (event) => {
        console.error('Stream connection error:', event);
        setIsConnected(false);
        setIsConnecting(false);

        // Handle reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          setError(`Connection lost, attempting to reconnect... (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            reconnectDelay.current = Math.min(reconnectDelay.current * 2, 10000); // Exponential backoff, max 10s

            // Close current connection
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }

            // Attempt reconnection
            connect();
          }, reconnectDelay.current);
        } else {
          setError('Failed to connect to log stream after multiple attempts');
        }
      };

      // Handle specific event types
      eventSource.addEventListener('log', (event: any) => {
        try {
          const streamEvent: LogStreamEvent = JSON.parse(event.data);
          handleStreamEvent(streamEvent);
        } catch (error) {
          console.error('Error parsing log event:', error);
        }
      });

      eventSource.addEventListener('heartbeat', (event: any) => {
        try {
          const streamEvent: LogStreamEvent = JSON.parse(event.data);
          handleStreamEvent(streamEvent);
        } catch (error) {
          console.error('Error parsing heartbeat event:', error);
        }
      });

      eventSource.addEventListener('stats', (event: any) => {
        try {
          const streamEvent: LogStreamEvent = JSON.parse(event.data);
          handleStreamEvent(streamEvent);
        } catch (error) {
          console.error('Error parsing stats event:', error);
        }
      });

    } catch (error: any) {
      console.error('Error creating EventSource:', error);
      setError(error.message || 'Failed to create stream connection');
      setIsConnecting(false);
    }
  }, [config, buildStreamUrl, handleStreamEvent, isConnected, isConnecting]);

  // Disconnect from the stream
  const disconnect = useCallback(() => {
    console.log('Disconnecting from log stream');

    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }

    // Close EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    reconnectAttempts.current = 0;
  }, []);

  // Clear log buffer
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Auto-reconnect when configuration changes
  useEffect(() => {
    if (isConnected) {
      disconnect();
      // Small delay before reconnecting with new config
      setTimeout(connect, 100);
    }
  }, [
    JSON.stringify(config.level),
    JSON.stringify(config.domain),
    JSON.stringify(config.component),
    config.includePattern,
    config.excludePattern,
    config.onlyErrors,
    config.onlyNewLogs
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Monitor connection health
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    // Check for connection health every 30 seconds
    const healthCheckInterval = setInterval(() => {
      // If we haven't received any events recently, the connection might be stale
      if (lastEvent && Date.now() - new Date(lastEvent.timestamp).getTime() > 60000) {
        console.warn('No events received in 60 seconds, reconnecting...');
        disconnect();
        setTimeout(connect, 1000);
      }
    }, 30000);

    return () => {
      clearInterval(healthCheckInterval);
    };
  }, [isConnected, lastEvent, disconnect, connect]);

  return {
    logs,
    isConnected,
    isConnecting,
    error,
    stats,
    connect,
    disconnect,
    clearLogs,
    lastEvent
  };
};

export default useLogStream;