/**
 * Filter bar component for the logs viewer
 * Handles search, time range, level filters, and advanced filtering options
 */

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { LogFilter, LogViewerConfig, TIME_RANGE_PRESETS } from './types';
import { LogLevel } from '../../backend/types/index';

interface LogsFilterBarProps {
  filters: LogFilter;
  config: LogViewerConfig;
  onFiltersChange: (filters: LogFilter) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export const LogsFilterBar: React.FC<LogsFilterBarProps> = ({
  filters,
  config,
  onFiltersChange,
  onApplyFilters,
  onResetFilters
}) => {
  const updateFilters = (updates: Partial<LogFilter>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const updateSearch = (searchUpdates: Partial<LogFilter['search']>) => {
    updateFilters({
      search: { ...filters.search, ...searchUpdates }
    });
  };

  const updateTimeRange = (timeRangeUpdates: Partial<LogFilter['timeRange']>) => {
    updateFilters({
      timeRange: { ...filters.timeRange, ...timeRangeUpdates }
    });
  };

  const updateAdvanced = (advancedUpdates: Partial<LogFilter['advanced']>) => {
    updateFilters({
      advanced: { ...filters.advanced, ...advancedUpdates }
    });
  };

  return (
    <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-3">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        {config.enableSearch && (
          <div className="flex-1 min-w-64 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.search.query}
                onChange={(e) => updateSearch({ query: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Time range selector */}
        <select
          value={filters.timeRange.preset || 'custom'}
          onChange={(e) => updateTimeRange({ preset: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          {TIME_RANGE_PRESETS.map(preset => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>

        {/* Level filter */}
        <select
          multiple
          value={filters.levels}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value as LogLevel);
            updateFilters({ levels: selected });
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          {Object.values(LogLevel).map(level => (
            <option key={level as string} value={level as string}>
              {(level as string).toUpperCase()}
            </option>
          ))}
        </select>

        {/* Service filter */}
        <input
          type="text"
          placeholder="Service name..."
          value={filters.services.join(',')}
          onChange={(e) => updateFilters({
            services: e.target.value ? e.target.value.split(',').map(s => s.trim()) : []
          })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />

        {/* Correlation ID filter */}
        <input
          type="text"
          placeholder="Correlation ID..."
          value={filters.advanced.correlationId}
          onChange={(e) => updateAdvanced({ correlationId: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />

        {/* Advanced options */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={filters.advanced.hasErrors}
              onChange={(e) => updateAdvanced({ hasErrors: e.target.checked })}
              className="rounded"
            />
            Errors only
          </label>

          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={filters.search.regex}
              onChange={(e) => updateSearch({ regex: e.target.checked })}
              className="rounded"
            />
            Regex
          </label>

          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={filters.search.caseSensitive}
              onChange={(e) => updateSearch({ caseSensitive: e.target.checked })}
              className="rounded"
            />
            Case sensitive
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onApplyFilters}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Filter className="w-4 h-4" />
            Apply
          </button>

          <button
            onClick={onResetFilters}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};