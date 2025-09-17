import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Bell,
  BellOff,
  Filter,
  Search,
  Plus,
  Edit3,
  Trash2,
  RotateCcw
} from 'lucide-react';

// Types for Alert Management
interface Alert {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'paused' | 'triggered' | 'resolved';
  conditions: AlertCondition[];
  actions: AlertAction[];
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
  metadata: Record<string, any>;
}

interface AlertCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'regex';
  value: string | number;
  timeWindow?: string; // e.g., '5m', '1h', '1d'
}

interface AlertAction {
  type: 'email' | 'webhook' | 'slack' | 'pagerduty' | 'function';
  configuration: Record<string, any>;
  enabled: boolean;
}

interface AlertsManagerPanelProps {
  className?: string;
  onAlertCreate?: (alert: Partial<Alert>) => Promise<void>;
  onAlertUpdate?: (id: string, alert: Partial<Alert>) => Promise<void>;
  onAlertDelete?: (id: string) => Promise<void>;
  onAlertTest?: (id: string) => Promise<void>;
}

export const AlertsManagerPanel: React.FC<AlertsManagerPanelProps> = ({
  className = '',
  onAlertCreate,
  onAlertUpdate,
  onAlertDelete,
  onAlertTest
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  // Load alerts on component mount
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true);
        // In real implementation, this would fetch from API
        const mockAlerts: Alert[] = [
          {
            id: '1',
            name: 'High Error Rate',
            description: 'Triggered when error rate exceeds 5% in 5 minutes',
            severity: 'high',
            status: 'active',
            conditions: [
              { field: 'level', operator: 'eq', value: 'error', timeWindow: '5m' },
              { field: 'count', operator: 'gt', value: 50 }
            ],
            actions: [
              { type: 'email', configuration: { recipients: ['admin@example.com'] }, enabled: true },
              { type: 'slack', configuration: { channel: '#alerts' }, enabled: true }
            ],
            createdAt: new Date('2024-01-15T10:00:00Z'),
            updatedAt: new Date('2024-01-20T14:30:00Z'),
            lastTriggered: new Date('2024-01-20T14:25:00Z'),
            triggerCount: 12,
            metadata: { createdBy: 'admin', tags: ['production', 'critical'] }
          },
          {
            id: '2',
            name: 'Performance Degradation',
            description: 'Slow response times detected',
            severity: 'medium',
            status: 'active',
            conditions: [
              { field: 'responseTime', operator: 'gt', value: 2000, timeWindow: '10m' }
            ],
            actions: [
              { type: 'webhook', configuration: { url: 'https://api.example.com/alerts' }, enabled: true }
            ],
            createdAt: new Date('2024-01-10T08:00:00Z'),
            updatedAt: new Date('2024-01-18T16:15:00Z'),
            triggerCount: 3,
            metadata: { createdBy: 'devops', tags: ['performance'] }
          }
        ];
        setAlerts(mockAlerts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  // Filter and search alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [alerts, searchTerm, statusFilter, severityFilter]);

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Alert['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'triggered': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'resolved': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleCreateAlert = async () => {
    if (onAlertCreate) {
      const newAlert: Partial<Alert> = {
        name: 'New Alert',
        description: 'Alert description',
        severity: 'medium',
        status: 'active',
        conditions: [],
        actions: [],
        triggerCount: 0,
        metadata: {}
      };
      await onAlertCreate(newAlert);
      setShowCreateForm(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (onAlertDelete && window.confirm('Are you sure you want to delete this alert?')) {
      await onAlertDelete(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }
  };

  const handleTestAlert = async (alertId: string) => {
    if (onAlertTest) {
      await onAlertTest(alertId);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-red-200 p-6 ${className}`}>
        <div className="flex items-center text-red-600">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>Error loading alerts: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Alerts Manager
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure and manage system alerts and notifications
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="triggered">Triggered</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-gray-200">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No alerts found</p>
            <p className="text-sm">Create your first alert to get started</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(alert.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{alert.name}</h3>
                    <p className="text-xs text-gray-500">{alert.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                      <span>Triggered: {alert.triggerCount} times</span>
                      {alert.lastTriggered && (
                        <span>Last: {alert.lastTriggered.toLocaleDateString()}</span>
                      )}
                      <span>{alert.conditions.length} conditions</span>
                      <span>{alert.actions.filter(a => a.enabled).length} actions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestAlert(alert.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Test Alert"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingAlert(alert)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Edit Alert"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {alerts.filter(a => a.status === 'active').length}
            </div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600">
              {alerts.filter(a => a.status === 'triggered').length}
            </div>
            <div className="text-xs text-gray-500">Triggered</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600">
              {alerts.filter(a => a.severity === 'critical').length}
            </div>
            <div className="text-xs text-gray-500">Critical</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {alerts.reduce((sum, a) => sum + a.triggerCount, 0)}
            </div>
            <div className="text-xs text-gray-500">Total Triggers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsManagerPanel;