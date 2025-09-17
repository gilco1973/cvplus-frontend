/**
 * Streaming manager component
 * Handles WebSocket connections for real-time log streaming
 */

import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { LogFilter } from './types';
import { logger } from '../../backend/index';

interface StreamingManagerProps {
  filters: LogFilter;
  maxVisibleLogs: number;
  onUpdate: (data: any) => void;
}

export interface StreamingManagerRef {
  start: () => void;
  stop: () => void;
  updateFilters: (filters: LogFilter) => void;
  cleanup: () => void;
}

export const StreamingManager = forwardRef<StreamingManagerRef, StreamingManagerProps>(
  ({ filters, maxVisibleLogs, onUpdate }, ref) => {
    const wsRef = useRef<WebSocket | null>(null);

    const convertFiltersForStream = useCallback((filters: LogFilter) => {
      return {
        level: filters.levels,
        domain: filters.domains,
        serviceName: filters.services,
        userId: filters.users,
        keywords: filters.search.query ? [filters.search.query] : undefined,
        correlationId: filters.advanced.correlationId || undefined
      };
    }, []);

    const handleStreamMessage = useCallback((message: any) => {
      if (message.type === 'log' && message.data?.logs) {
        const newLogs = message.data.logs;

        onUpdate((prev: any) => {
          const updatedLogs = [...newLogs, ...prev.logs].slice(0, maxVisibleLogs);

          return {
            logs: updatedLogs,
            filteredLogs: updatedLogs,
            streamingStats: {
              ...prev.streamingStats,
              messagesReceived: prev.streamingStats.messagesReceived + 1,
              bytesReceived: prev.streamingStats.bytesReceived + JSON.stringify(newLogs).length,
              lastMessage: new Date()
            }
          };
        });

        logger.info('logs_viewer.stream_message_processed', {
          messageCount: newLogs.length,
          totalBytes: JSON.stringify(newLogs).length
        });
      }
    }, [maxVisibleLogs, onUpdate]);

    const start = useCallback(() => {
      if (wsRef.current) {
        wsRef.current.close();
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/v1/logs/stream`);

      ws.onopen = () => {
        logger.info('logs_viewer.stream_connected');

        onUpdate((prev: any) => ({
          ...prev,
          streaming: true,
          streamingStats: {
            ...prev.streamingStats,
            connected: true,
            connectionTime: new Date()
          }
        }));

        // Subscribe to log stream with current filters
        const subscribeMessage = {
          action: 'subscribe',
          filters: convertFiltersForStream(filters),
          options: {
            includeContext: true,
            format: 'json'
          }
        };

        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleStreamMessage(message);
        } catch (error) {
          logger.error('logs_viewer.stream_message_parse_error', {}, error instanceof Error ? error : undefined);
        }
      };

      ws.onclose = (event) => {
        logger.info('logs_viewer.stream_disconnected', {
          code: event.code,
          reason: event.reason
        });

        onUpdate((prev: any) => ({
          ...prev,
          streaming: false,
          streamingStats: {
            ...prev.streamingStats,
            connected: false
          }
        }));
      };

      ws.onerror = (error) => {
        logger.error('logs_viewer.stream_error', {}, error instanceof Error ? error : undefined);
        onUpdate((prev: any) => ({
          ...prev,
          error: 'WebSocket connection error'
        }));
      };

      wsRef.current = ws;
    }, [filters, convertFiltersForStream, handleStreamMessage, onUpdate]);

    const stop = useCallback(() => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      onUpdate((prev: any) => ({
        ...prev,
        streaming: false,
        streamingStats: {
          ...prev.streamingStats,
          connected: false
        }
      }));

      logger.info('logs_viewer.stream_stopped');
    }, [onUpdate]);

    const updateFilters = useCallback((newFilters: LogFilter) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const updateMessage = {
          action: 'subscribe',
          filters: convertFiltersForStream(newFilters)
        };
        wsRef.current.send(JSON.stringify(updateMessage));
      }
    }, [convertFiltersForStream]);

    const cleanup = useCallback(() => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      start,
      stop,
      updateFilters,
      cleanup
    }), [start, stop, updateFilters, cleanup]);

    return null; // This component doesn't render anything
  }
);