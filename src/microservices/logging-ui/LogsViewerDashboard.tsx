/**
 * T052: Comprehensive logs viewer dashboard component
 *
 * This file now serves as a re-export for the refactored component structure.
 * The actual implementation has been moved to components/LogsViewerDashboard.tsx
 * for better maintainability and adherence to the 200-line limit.
 */

export {
  LogsViewerDashboard as default,
  LogsViewerDashboard
} from './components/LogsViewerDashboard';

// Re-export types for backward compatibility
export type {
  LogViewerConfig,
  LogFilter,
  LogsViewerState,
  LogStats,
  StreamingStats
} from './components/types';