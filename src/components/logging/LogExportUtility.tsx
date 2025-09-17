import React, { useState, useCallback, useMemo } from 'react';
import {
  Download,
  FileText,
  Database,
  Calendar,
  Filter,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader
} from 'lucide-react';

// Types for Export Functionality
interface ExportConfig {
  format: 'json' | 'csv' | 'txt' | 'xlsx';
  timeRange: {
    start: Date;
    end: Date;
  };
  filters: {
    levels?: string[];
    services?: string[];
    users?: string[];
    correlationIds?: string[];
    search?: string;
  };
  options: {
    includeMetadata: boolean;
    includePII: boolean;
    compressOutput: boolean;
    splitByService: boolean;
    maxRecords?: number;
  };
}

interface ExportJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  config: ExportConfig;
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
  estimatedRecords: number;
  actualRecords?: number;
  fileSizeBytes?: number;
}

interface LogExportUtilityProps {
  className?: string;
  onExportStart?: (config: ExportConfig) => Promise<string>; // Returns job ID
  onExportCancel?: (jobId: string) => Promise<void>;
  onExportDownload?: (jobId: string) => Promise<void>;
}

export const LogExportUtility: React.FC<LogExportUtilityProps> = ({
  className = '',
  onExportStart,
  onExportCancel,
  onExportDownload
}) => {
  const [activeTab, setActiveTab] = useState<'configure' | 'jobs'>('configure');
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'json',
    timeRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      end: new Date()
    },
    filters: {},
    options: {
      includeMetadata: true,
      includePII: false,
      compressOutput: true,
      splitByService: false,
      maxRecords: 10000
    }
  });

  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      name: 'Error Logs Export - Last 24h',
      status: 'completed',
      progress: 100,
      config: exportConfig,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      downloadUrl: '/exports/error-logs-20240120.json.gz',
      estimatedRecords: 1547,
      actualRecords: 1547,
      fileSizeBytes: 256000
    },
    {
      id: '2',
      name: 'Full System Export',
      status: 'processing',
      progress: 65,
      config: exportConfig,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      estimatedRecords: 50000
    }
  ]);

  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [estimatedSize, setEstimatedSize] = useState<string>('');
  const [isEstimating, setIsEstimating] = useState(false);

  // Available log levels and services (in real app, these would come from API)
  const availableLevels = ['error', 'warn', 'info', 'debug', 'trace'];
  const availableServices = ['auth', 'cv-processing', 'multimedia', 'premium', 'analytics'];

  // Estimate export size based on current config
  const estimateExportSize = useCallback(async () => {
    setIsEstimating(true);

    // Simulate API call to estimate export size
    await new Promise(resolve => setTimeout(resolve, 1000));

    const baseRecords = 10000;
    const timeRangeDays = Math.max(1, Math.ceil((exportConfig.timeRange.end.getTime() - exportConfig.timeRange.start.getTime()) / (1000 * 60 * 60 * 24)));
    const levelMultiplier = selectedLevels.length === 0 ? 1 : selectedLevels.length / availableLevels.length;
    const serviceMultiplier = selectedServices.length === 0 ? 1 : selectedServices.length / availableServices.length;

    const estimatedRecords = Math.floor(baseRecords * timeRangeDays * levelMultiplier * serviceMultiplier);
    const bytesPerRecord = exportConfig.format === 'json' ? 200 : 150;
    const estimatedBytes = estimatedRecords * bytesPerRecord;

    if (exportConfig.options.compressOutput) {
      setEstimatedSize(`~${(estimatedBytes * 0.3 / 1024 / 1024).toFixed(1)}MB (compressed) | ${estimatedRecords.toLocaleString()} records`);
    } else {
      setEstimatedSize(`~${(estimatedBytes / 1024 / 1024).toFixed(1)}MB | ${estimatedRecords.toLocaleString()} records`);
    }

    setIsEstimating(false);
  }, [exportConfig, selectedLevels, selectedServices]);

  // Update estimate when config changes
  React.useEffect(() => {
    estimateExportSize();
  }, [estimateExportSize]);

  const handleStartExport = async () => {
    if (!onExportStart) return;

    const finalConfig: ExportConfig = {
      ...exportConfig,
      filters: {
        ...exportConfig.filters,
        levels: selectedLevels.length > 0 ? selectedLevels : undefined,
        services: selectedServices.length > 0 ? selectedServices : undefined
      }
    };

    try {
      const jobId = await onExportStart(finalConfig);

      // Add job to local state (in real app, this would come from polling/websocket)
      const newJob: ExportJob = {
        id: jobId,
        name: `Export - ${new Date().toLocaleString()}`,
        status: 'pending',
        progress: 0,
        config: finalConfig,
        createdAt: new Date(),
        estimatedRecords: parseInt(estimatedSize.split('|')[1]?.replace(/[^\d]/g, '') || '0')
      };

      setExportJobs(prev => [newJob, ...prev]);
      setActiveTab('jobs');
    } catch (error) {
      console.error('Failed to start export:', error);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    if (!onExportCancel) return;
    await onExportCancel(jobId);
    setExportJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: 'cancelled' as const } : job
    ));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getJobStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getJobStatusColor = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Log Export Utility
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Export logs for analysis, archiving, or external processing
          </p>
        </div>

        <nav className="flex px-6">
          <button
            onClick={() => setActiveTab('configure')}
            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'configure'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Configure Export
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Export Jobs ({exportJobs.filter(j => j.status !== 'completed' && j.status !== 'failed').length})
          </button>
        </nav>
      </div>

      {/* Configure Export Tab */}
      {activeTab === 'configure' && (
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-4 gap-3">
              {(['json', 'csv', 'txt', 'xlsx'] as const).map(format => (
                <button
                  key={format}
                  onClick={() => setExportConfig(prev => ({ ...prev, format }))}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    exportConfig.format === format
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <FileText className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">{format.toUpperCase()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={exportConfig.timeRange.start.toISOString().slice(0, 16)}
                onChange={(e) => setExportConfig(prev => ({
                  ...prev,
                  timeRange: { ...prev.timeRange, start: new Date(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="datetime-local"
                value={exportConfig.timeRange.end.toISOString().slice(0, 16)}
                onChange={(e) => setExportConfig(prev => ({
                  ...prev,
                  timeRange: { ...prev.timeRange, end: new Date(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Levels
              </label>
              <div className="flex flex-wrap gap-2">
                {availableLevels.map(level => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(level)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLevels(prev => [...prev, level]);
                        } else {
                          setSelectedLevels(prev => prev.filter(l => l !== level));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Services
              </label>
              <div className="flex flex-wrap gap-2">
                {availableServices.map(service => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServices(prev => [...prev, service]);
                        } else {
                          setSelectedServices(prev => prev.filter(s => s !== service));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Options
            </label>
            <div className="space-y-3">
              {[
                { key: 'includeMetadata', label: 'Include Metadata', description: 'Include additional context and metadata' },
                { key: 'includePII', label: 'Include PII', description: 'Include personally identifiable information (admin only)' },
                { key: 'compressOutput', label: 'Compress Output', description: 'Compress the exported file (reduces size by ~70%)' },
                { key: 'splitByService', label: 'Split by Service', description: 'Create separate files for each service' }
              ].map(option => (
                <label key={option.key} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={exportConfig.options[option.key as keyof typeof exportConfig.options] as boolean}
                    onChange={(e) => setExportConfig(prev => ({
                      ...prev,
                      options: { ...prev.options, [option.key]: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                  />
                  <div className="ml-3">
                    <div className="text-sm text-gray-700">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Size Estimation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Estimated Export Size</h4>
                <p className="text-xs text-gray-500">Based on current filters and options</p>
              </div>
              <div className="text-right">
                {isEstimating ? (
                  <div className="flex items-center text-gray-500">
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm">Calculating...</span>
                  </div>
                ) : (
                  <div className="text-sm font-medium text-gray-900">{estimatedSize}</div>
                )}
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <button
              onClick={handleStartExport}
              disabled={isEstimating}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Start Export
            </button>
          </div>
        </div>
      )}

      {/* Export Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="divide-y divide-gray-200">
          {exportJobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No export jobs</p>
              <p className="text-sm">Configure and start your first export</p>
            </div>
          ) : (
            exportJobs.map(job => (
              <div key={job.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {getJobStatusIcon(job.status)}
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{job.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>Format: {job.config.format.toUpperCase()}</span>
                        <span>Created: {job.createdAt.toLocaleString()}</span>
                        {job.actualRecords && (
                          <span>{job.actualRecords.toLocaleString()} records</span>
                        )}
                        {job.fileSizeBytes && (
                          <span>{formatFileSize(job.fileSizeBytes)}</span>
                        )}
                      </div>

                      {job.status === 'processing' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{job.progress}% complete</div>
                        </div>
                      )}

                      {job.error && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          Error: {job.error}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>

                    {job.status === 'processing' && (
                      <button
                        onClick={() => handleCancelJob(job.id)}
                        className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    {job.status === 'completed' && job.downloadUrl && (
                      <button
                        onClick={() => onExportDownload && onExportDownload(job.id)}
                        className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LogExportUtility;