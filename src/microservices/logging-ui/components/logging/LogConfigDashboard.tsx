/**
 * T053: Log Configuration Dashboard in frontend/src/components/logging/LogConfigDashboard.tsx
 *
 * Configuration management dashboard for logging settings, alert rules,
 * retention policies, and system-wide logging preferences.
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Database,
  Shield,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';
import { LogLevel, LogDomain } from '@cvplus/logging';

interface LoggingConfig {
  id: string;
  name: string;
  description: string;
  levels: {
    console: LogLevel;
    file: LogLevel;
    database: LogLevel;
    remote: LogLevel;
  };
  domains: {
    enabled: LogDomain[];
    disabled: LogDomain[];
  };
  features: {
    piiRedaction: boolean;
    correlationTracking: boolean;
    performanceMetrics: boolean;
    securityEvents: boolean;
    realTimeStreaming: boolean;
    logShipping: boolean;
  };
  retention: {
    console: number; // days
    file: number;
    database: number;
    remote: number;
  };
  alertRules: AlertRule[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  environment: 'development' | 'staging' | 'production';
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: {
    metric: 'error_rate' | 'log_volume' | 'response_time' | 'security_events';
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    timeWindow: number; // minutes
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[]; // email, sms, slack, webhook
  isEnabled: boolean;
  createdAt: string;
}

interface LogConfigDashboardProps {
  className?: string;
}

const LogConfigDashboard: React.FC<LogConfigDashboardProps> = ({ className = '' }) => {
  const [config, setConfig] = useState<LoggingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'general' | 'alerts' | 'retention' | 'security'>('general');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/logging/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-API-Key': process.env.REACT_APP_API_KEY || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load configuration');
      }

      const data = await response.json();
      setConfig(data.config);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!config) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/v1/logging/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-API-Key': process.env.REACT_APP_API_KEY || ''
        },
        body: JSON.stringify({ config })
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      setSuccessMessage('Configuration saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (updates: Partial<LoggingConfig>) => {
    if (!config) return;
    setConfig({ ...config, ...updates });
  };

  const addAlertRule = () => {
    if (!config) return;

    const newRule: AlertRule = {
      id: `rule_${Date.now()}`,
      name: 'New Alert Rule',
      description: '',
      condition: {
        metric: 'error_rate',
        operator: 'gt',
        threshold: 5,
        timeWindow: 15
      },
      severity: 'medium',
      channels: ['email'],
      isEnabled: true,
      createdAt: new Date().toISOString()
    };

    updateConfig({
      alertRules: [...config.alertRules, newRule]
    });
  };

  const updateAlertRule = (ruleId: string, updates: Partial<AlertRule>) => {
    if (!config) return;

    const updatedRules = config.alertRules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );

    updateConfig({ alertRules: updatedRules });
  };

  const deleteAlertRule = (ruleId: string) => {
    if (!config) return;

    const updatedRules = config.alertRules.filter(rule => rule.id !== ruleId);
    updateConfig({ alertRules: updatedRules });
  };

  const tabs = [
    { id: 'general' as const, label: 'General Settings', icon: Settings },
    { id: 'alerts' as const, label: 'Alert Rules', icon: Bell },
    { id: 'retention' as const, label: 'Data Retention', icon: Database },
    { id: 'security' as const, label: 'Security & Privacy', icon: Shield }
  ];

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuration Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadConfiguration}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              Logging Configuration
            </h2>
            <p className="text-gray-600 mt-1">
              Manage system-wide logging settings and preferences
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </button>

            <button
              onClick={saveConfiguration}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {selectedTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Log Levels */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Levels</h3>
                <div className="space-y-4">
                  {Object.entries(config.levels).map(([output, level]) => (
                    <div key={output} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {output}
                      </label>
                      <select
                        value={level}
                        onChange={(e) => updateConfig({
                          levels: { ...config.levels, [output]: e.target.value as LogLevel }
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.values(LogLevel).map(logLevel => (
                          <option key={logLevel} value={logLevel}>
                            {logLevel}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                <div className="space-y-3">
                  {Object.entries(config.features).map(([feature, enabled]) => (
                    <label key={feature} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => updateConfig({
                          features: { ...config.features, [feature]: e.target.checked }
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 mb-3">
                  <Info className="w-5 h-5" />
                  <h4 className="font-semibold">Advanced Settings</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Environment
                    </label>
                    <select
                      value={config.environment}
                      onChange={(e) => updateConfig({
                        environment: e.target.value as 'development' | 'staging' | 'production'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.isActive}
                        onChange={(e) => updateConfig({ isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Configuration Active
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Alert Rules</h3>
              <button
                onClick={addAlertRule}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            </div>

            <div className="space-y-3">
              {config.alertRules.map(rule => (
                <div key={rule.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={rule.isEnabled}
                        onChange={(e) => updateAlertRule(rule.id, { isEnabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => updateAlertRule(rule.id, { name: e.target.value })}
                        className="font-medium bg-transparent border-none focus:ring-0 focus:border-none p-0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        rule.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        rule.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rule.severity}
                      </span>
                      <button
                        onClick={() => deleteAlertRule(rule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="block text-gray-600 mb-1">Metric</label>
                      <select
                        value={rule.condition.metric}
                        onChange={(e) => updateAlertRule(rule.id, {
                          condition: { ...rule.condition, metric: e.target.value as any }
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="error_rate">Error Rate</option>
                        <option value="log_volume">Log Volume</option>
                        <option value="response_time">Response Time</option>
                        <option value="security_events">Security Events</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1">Threshold</label>
                      <div className="flex gap-1">
                        <select
                          value={rule.condition.operator}
                          onChange={(e) => updateAlertRule(rule.id, {
                            condition: { ...rule.condition, operator: e.target.value as any }
                          })}
                          className="px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="gt">&gt;</option>
                          <option value="gte">&gt;=</option>
                          <option value="lt">&lt;</option>
                          <option value="lte">&lt;=</option>
                          <option value="eq">=</option>
                        </select>
                        <input
                          type="number"
                          value={rule.condition.threshold}
                          onChange={(e) => updateAlertRule(rule.id, {
                            condition: { ...rule.condition, threshold: parseFloat(e.target.value) }
                          })}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1">Time Window (min)</label>
                      <input
                        type="number"
                        value={rule.condition.timeWindow}
                        onChange={(e) => updateAlertRule(rule.id, {
                          condition: { ...rule.condition, timeWindow: parseInt(e.target.value) }
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'retention' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Retention Periods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(config.retention).map(([output, days]) => (
                  <div key={output}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {output} (days)
                    </label>
                    <input
                      type="number"
                      value={days}
                      onChange={(e) => updateConfig({
                        retention: { ...config.retention, [output]: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="3650"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <Info className="w-5 h-5" />
                <h4 className="font-semibold">Retention Policy Information</h4>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Console logs are kept in memory and cleared on restart</li>
                <li>• File logs are automatically rotated and compressed</li>
                <li>• Database logs are archived before deletion</li>
                <li>• Remote logs may have additional provider-specific retention</li>
              </ul>
            </div>
          </div>
        )}

        {selectedTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Privacy Settings</h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.features.piiRedaction}
                    onChange={(e) => updateConfig({
                      features: { ...config.features, piiRedaction: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Automatic PII Redaction
                    </span>
                    <p className="text-xs text-gray-500">
                      Automatically detect and redact personally identifiable information
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.features.securityEvents}
                    onChange={(e) => updateConfig({
                      features: { ...config.features, securityEvents: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Security Event Monitoring
                    </span>
                    <p className="text-xs text-gray-500">
                      Monitor and alert on potential security threats
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.features.correlationTracking}
                    onChange={(e) => updateConfig({
                      features: { ...config.features, correlationTracking: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Request Correlation Tracking
                    </span>
                    <p className="text-xs text-gray-500">
                      Track requests across distributed services
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <Shield className="w-5 h-5" />
                <h4 className="font-semibold">Security Considerations</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Logs may contain sensitive information - review regularly</li>
                <li>• Enable PII redaction for production environments</li>
                <li>• Implement proper access controls for log data</li>
                <li>• Consider compliance requirements (GDPR, HIPAA, etc.)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogConfigDashboard;