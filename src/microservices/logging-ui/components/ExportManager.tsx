/**
 * Export manager component
 * Handles log export functionality with support for various formats
 */

import React, { useCallback, forwardRef, useImperativeHandle } from 'react';
import { logger } from '../../backend/index';
import type { LogEntry } from '../../backend/models/LogEntry';

interface ExportManagerProps {
  buildSearchParams: (page: number) => string;
  totalCount: number;
  filteredLogs: LogEntry[];
  onExport?: (logs: LogEntry[]) => void;
  onProgress: (inProgress: boolean) => void;
  onError: (error: string | null) => void;
}

export interface ExportManagerRef {
  export: (format: 'json' | 'csv' | 'txt') => Promise<void>;
}

export const ExportManager = forwardRef<ExportManagerRef, ExportManagerProps>(
  ({ buildSearchParams, totalCount, filteredLogs, onExport, onProgress, onError }, ref) => {

    const exportLogs = useCallback(async (format: 'json' | 'csv' | 'txt' = 'json') => {
      onProgress(true);

      try {
        const searchParams = buildSearchParams(1);
        const response = await fetch('/api/v1/logs/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: Object.fromEntries(new URLSearchParams(searchParams)),
            format,
            async: totalCount > 1000
          })
        });

        if (!response.ok) {
          throw new Error(`Export failed: ${response.statusText}`);
        }

        if (totalCount > 1000) {
          // Async export for large datasets
          const result = await response.json();
          logger.info('logs_viewer.export_job_created', {
            jobId: result.data.jobId,
            format,
            totalCount
          });

          // Show notification that export job was created
          const message = `Export job created: ${result.data.jobId}. You'll be notified when complete.`;
          alert(message);

        } else {
          // Direct download for small exports
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cvplus-logs-${new Date().toISOString().slice(0, 19)}.${format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          logger.info('logs_viewer.export_completed', {
            format,
            size: blob.size,
            totalCount
          });
        }

        if (onExport) {
          onExport(filteredLogs);
        }

      } catch (error) {
        const errorMessage = `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        logger.error('logs_viewer.export_failed', { format, totalCount }, error instanceof Error ? error : undefined);
        onError(errorMessage);
      } finally {
        onProgress(false);
      }
    }, [buildSearchParams, totalCount, filteredLogs, onExport, onProgress, onError]);

    useImperativeHandle(ref, () => ({
      export: exportLogs
    }), [exportLogs]);

    return null; // This component doesn't render anything
  }
);