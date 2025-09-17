// @ts-ignore
/**
 * WebSocket Updates Hook (T067)
 *
 * Custom React hook for managing WebSocket connections to receive
 * real-time CV processing status updates and progress notifications.
 *
 * Features:
 * - Automatic connection management with reconnection
 * - Message parsing and type safety
 * - Connection state tracking
 * - Error handling and recovery
 * - Heartbeat/ping-pong for connection health
 *
 * @author Gil Klainert
 * @version 1.0.0 - Initial T067 Implementation
  */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { WebSocketUpdate } from '../components/CVProcessor.types';

interface UseWebSocketUpdatesProps {
  /** Enable WebSocket connection  */
  enabled: boolean;

  /** Job ID to subscribe to updates  */
  jobId: string | null;

  /** WebSocket endpoint URL  */
  wsEndpoint?: string;

  /** Callback for status updates  */
  onStatusUpdate?: (update: any) => void;

  /** Callback for connection state changes  */
  onConnectionChange?: (connected: boolean) => void;

  /** Callback for errors  */
  onError?: (error: Error) => void;

  /** Connection timeout in milliseconds  */
  connectionTimeout?: number;

  /** Reconnection attempts  */
  maxReconnectAttempts?: number;

  /** Reconnection delay in milliseconds  */
  reconnectDelay?: number;

  /** Heartbeat interval in milliseconds  */
  heartbeatInterval?: number;
}

interface WebSocketState {
  /** Connection status  */
  connected: boolean;

  /** Connection state  */
  readyState: number;

  /** Last error  */
  error: string | null;

  /** Reconnection attempt count  */
  reconnectAttempts: number;

  /** Last message received timestamp  */
  lastMessageAt: Date | null;

  /** Connection established timestamp  */
  connectedAt: Date | null;

  /** Total messages received  */
  messagesReceived: number;
}

export const useWebSocketUpdates = ({
  enabled,
  jobId,
  wsEndpoint = process.env.REACT_APP_WS_ENDPOINT || 'ws://localhost:8080/ws',
  onStatusUpdate,
  onConnectionChange,
  onError,
  connectionTimeout = 10000,
  maxReconnectAttempts = 5,
  reconnectDelay = 1000,
  heartbeatInterval = 30000
}: UseWebSocketUpdatesProps) => {

  const [state, setState] = useState<WebSocketState>({
    connected: false,
    readyState: WebSocket.CLOSED,
    error: null,
    reconnectAttempts: 0,
    lastMessageAt: null,
    connectedAt: null,
    messagesReceived: 0
  });

  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Send heartbeat ping
    */
  const sendHeartbeat = useCallback(() => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      try {
        websocketRef.current.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now()
        }));

        // Schedule next heartbeat
        heartbeatTimeoutRef.current = setTimeout(sendHeartbeat, heartbeatInterval);
      } catch (error) {
        console.warn('[WebSocket] Heartbeat send failed:', error);
      }
    }
  }, [heartbeatInterval]);

  /**
   * Handle WebSocket message
    */
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);

      setState(prev => ({
        ...prev,
        lastMessageAt: new Date(),
        messagesReceived: prev.messagesReceived + 1,
        error: null
      }));

      // Handle different message types
      switch (message.type) {
        case 'pong':
          // Heartbeat response - connection is healthy
          break;

        case 'status_update':
          if (message.jobId === jobId && onStatusUpdate) {
            const update: WebSocketUpdate = {
              jobId: message.jobId,
              type: 'status',
              data: message.data,
              timestamp: new Date(message.timestamp || Date.now())
            };
            onStatusUpdate(update.data);
          }
          break;

        case 'progress_update':
          if (message.jobId === jobId && onStatusUpdate) {
            const update: WebSocketUpdate = {
              jobId: message.jobId,
              type: 'progress',
              data: message.data,
              timestamp: new Date(message.timestamp || Date.now())
            };
            onStatusUpdate(update.data);
          }
          break;

        case 'stage_update':
          if (message.jobId === jobId && onStatusUpdate) {
            const update: WebSocketUpdate = {
              jobId: message.jobId,
              type: 'stage',
              data: message.data,
              timestamp: new Date(message.timestamp || Date.now())
            };
            onStatusUpdate(update.data);
          }
          break;

        case 'error':
          if (message.jobId === jobId) {
            const error = new Error(message.error || 'WebSocket error');
            setState(prev => ({ ...prev, error: error.message }));
            onError?.(error);
          }
          break;

        case 'complete':
          if (message.jobId === jobId && onStatusUpdate) {
            const update: WebSocketUpdate = {
              jobId: message.jobId,
              type: 'complete',
              data: message.data,
              timestamp: new Date(message.timestamp || Date.now())
            };
            onStatusUpdate(update.data);
          }
          break;

        default:
          console.warn('[WebSocket] Unknown message type:', message.type);
      }

    } catch (error) {
      console.error('[WebSocket] Message parsing error:', error);
      setState(prev => ({ ...prev, error: 'Message parsing error' }));
    }
  }, [jobId, onStatusUpdate, onError]);

  /**
   * Connect to WebSocket
    */
  const connect = useCallback(() => {
    if (!enabled || !jobId) {
      return;
    }

    // Clear existing connection
    if (websocketRef.current) {
      websocketRef.current.close();
    }

    try {
      // Build WebSocket URL with job subscription
      const url = new URL(wsEndpoint);
      url.searchParams.set('jobId', jobId);

      const websocket = new WebSocket(url.toString());
      websocketRef.current = websocket;

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (websocket.readyState !== WebSocket.OPEN) {
          websocket.close();
          setState(prev => ({ ...prev, error: 'Connection timeout' }));
        }
      }, connectionTimeout);

      websocket.onopen = () => {
        console.log('[WebSocket] Connected to', url.toString());

        // Clear connection timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        setState(prev => ({
          ...prev,
          connected: true,
          readyState: websocket.readyState,
          error: null,
          reconnectAttempts: 0,
          connectedAt: new Date()
        }));

        onConnectionChange?.(true);

        // Start heartbeat
        sendHeartbeat();

        // Subscribe to job updates
        websocket.send(JSON.stringify({
          type: 'subscribe',
          jobId,
          timestamp: Date.now()
        }));
      };

      websocket.onmessage = handleMessage;

      websocket.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);

        // Clear timeouts
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
          heartbeatTimeoutRef.current = null;
        }

        setState(prev => ({
          ...prev,
          connected: false,
          readyState: websocket.readyState,
          connectedAt: null
        }));

        onConnectionChange?.(false);

        // Attempt reconnection if not manually closed
        if (enabled && event.code !== 1000 && state.reconnectAttempts < maxReconnectAttempts) {
          setState(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }));

          const delay = reconnectDelay * Math.pow(2, state.reconnectAttempts);
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${state.reconnectAttempts + 1}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      websocket.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        const errorObj = new Error('WebSocket connection error');
        setState(prev => ({ ...prev, error: errorObj.message }));
        onError?.(errorObj);
      };

    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      const errorObj = error instanceof Error ? error : new Error('Connection failed');
      setState(prev => ({ ...prev, error: errorObj.message }));
      onError?.(errorObj);
    }
  }, [
    enabled,
    jobId,
    wsEndpoint,
    connectionTimeout,
    maxReconnectAttempts,
    reconnectDelay,
    state.reconnectAttempts,
    onConnectionChange,
    onError,
    sendHeartbeat,
    handleMessage
  ]);

  /**
   * Disconnect from WebSocket
    */
  const disconnect = useCallback(() => {
    // Clear all timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }

    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    // Close WebSocket connection
    if (websocketRef.current) {
      websocketRef.current.close(1000, 'Manual disconnect');
      websocketRef.current = null;
    }

    setState(prev => ({
      ...prev,
      connected: false,
      readyState: WebSocket.CLOSED,
      reconnectAttempts: 0,
      connectedAt: null
    }));

    onConnectionChange?.(false);
  }, [onConnectionChange]);

  /**
   * Send message to WebSocket
    */
  const sendMessage = useCallback((message: any) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      try {
        websocketRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('[WebSocket] Send message error:', error);
        return false;
      }
    }
    return false;
  }, []);

  /**
   * Subscribe to specific job updates
    */
  const subscribeToJob = useCallback((newJobId: string) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      sendMessage({
        type: 'subscribe',
        jobId: newJobId,
        timestamp: Date.now()
      });
    }
  }, [sendMessage]);

  /**
   * Unsubscribe from job updates
    */
  const unsubscribeFromJob = useCallback((oldJobId: string) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      sendMessage({
        type: 'unsubscribe',
        jobId: oldJobId,
        timestamp: Date.now()
      });
    }
  }, [sendMessage]);

  // Connect/disconnect based on enabled state and jobId
  useEffect(() => {
    if (enabled && jobId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, jobId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    ...state,

    // Actions
    connect,
    disconnect,
    sendMessage,
    subscribeToJob,
    unsubscribeFromJob,

    // WebSocket reference (for advanced usage)
    websocket: websocketRef.current
  };
};