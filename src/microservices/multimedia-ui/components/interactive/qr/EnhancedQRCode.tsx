import React, { useState, useEffect } from 'react';
import { 
  QrCode, Plus, Download, Eye, BarChart3, 
  Settings, Copy, ExternalLink, Smartphone,
  User, Briefcase, Mail, Loader2,
  TrendingUp, Users, MapPin, Palette
} from 'lucide-react';
import { QRCodeConfig, QRCodeTemplate } from './types';

interface EnhancedQRCodeProps {
  jobId: string;
  qrCodes?: QRCodeConfig[];
  templates?: QRCodeTemplate[];
  onGenerateQRCode: (config: Partial<QRCodeConfig>) => Promise<QRCodeConfig>;
  onGetAnalytics: (qrCodeId?: string) => Promise<any>;
  onUpdateQRCode?: (qrCodeId: string, updates: Partial<QRCodeConfig>) => Promise<void>;
  onDeleteQRCode?: (qrCodeId: string) => Promise<void>;
  className?: string;
}

export const EnhancedQRCode: React.FC<EnhancedQRCodeProps> = ({
  jobId,
  qrCodes = [],
  templates = [],
  onGenerateQRCode,
  onGetAnalytics,
  onUpdateQRCode,
  onDeleteQRCode,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'qrcodes' | 'analytics' | 'templates'>('overview');
  const [selectedTemplate, setSelectedTemplate] = useState<QRCodeTemplate | null>(null);
  const [qrAnalytics, setQRAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qrTypeIcons = {
    profile: <User className="w-5 h-5" />,
    contact: <Mail className="w-5 h-5" />,
    portfolio: <Briefcase className="w-5 h-5" />,
    'resume-download': <Download className="w-5 h-5" />,
    linkedin: <ExternalLink className="w-5 h-5" />,
    custom: <Settings className="w-5 h-5" />,
    'portal-primary': <QrCode className="w-5 h-5" />,
    'portal-chat': <User className="w-5 h-5" />,
    'portal-contact': <Mail className="w-5 h-5" />,
    'portal-download': <Download className="w-5 h-5" />,
    'portal-menu': <Settings className="w-5 h-5" />
  };

  const qrTypeColors = {
    profile: 'from-blue-500 to-cyan-500',
    contact: 'from-green-500 to-emerald-500',
    portfolio: 'from-purple-500 to-pink-500',
    'resume-download': 'from-orange-500 to-yellow-500',
    linkedin: 'from-blue-600 to-blue-800',
    custom: 'from-gray-500 to-gray-700',
    'portal-primary': 'from-indigo-500 to-purple-500',
    'portal-chat': 'from-green-400 to-blue-500',
    'portal-contact': 'from-red-500 to-pink-500',
    'portal-download': 'from-orange-400 to-red-500',
    'portal-menu': 'from-purple-400 to-indigo-500'
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const analyticsData = await onGetAnalytics();
      setQRAnalytics(analyticsData);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics');
      console.error('Analytics loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQR = async (config: Partial<QRCodeConfig>) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      await onGenerateQRCode(config);
      setShowCreateModal(false);
      setSelectedTemplate(null);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyQRUrl = async (qrCode: QRCodeConfig) => {
    if (qrCode.qrImageUrl) {
      try {
        await navigator.clipboard.writeText(qrCode.qrImageUrl);
        // Success feedback could be added here
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const handleDownloadQR = (qrCode: QRCodeConfig) => {
    if (qrCode.qrImageUrl) {
      const link = document.createElement('a');
      link.href = qrCode.qrImageUrl;
      link.download = `qr-${qrCode.type}-${qrCode.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <QrCode className="w-8 h-8 text-cyan-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{qrCodes.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total QR Codes</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <Eye className="w-8 h-8 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {qrCodes.reduce((sum, qr) => sum + qr.analytics.totalScans, 0)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Scans</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <Users className="w-8 h-8 text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {qrCodes.reduce((sum, qr) => sum + qr.analytics.uniqueScans, 0)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Unique Scans</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {qrCodes.filter(qr => qr.metadata.isActive).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Active QR Codes</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex flex-col items-center gap-2"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Create QR Code</span>
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex flex-col items-center gap-2"
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-sm font-medium">View Analytics</span>
          </button>
          
          <button
            onClick={() => setActiveTab('templates')}
            className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex flex-col items-center gap-2"
          >
            <Palette className="w-6 h-6" />
            <span className="text-sm font-medium">Browse Templates</span>
          </button>
        </div>
      </div>

      {/* Recent QR Codes */}
      {qrCodes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent QR Codes</h3>
            <button
              onClick={() => setActiveTab('qrcodes')}
              className="text-cyan-600 hover:text-cyan-500 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qrCodes.slice(0, 4).map((qrCode) => (
              <div
                key={qrCode.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${qrTypeColors[qrCode.type]} text-white`}>
                  {qrTypeIcons[qrCode.type]}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{qrCode.metadata.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{qrCode.analytics.totalScans} scans</p>
                </div>
                
                <div className={`w-2 h-2 rounded-full ${qrCode.metadata.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderQRCodes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My QR Codes</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qrCode) => (
          <div 
            key={qrCode.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* QR Code Image */}
            <div className="aspect-square bg-gray-50 dark:bg-gray-700 p-4 flex items-center justify-center">
              {qrCode.qrImageUrl ? (
                <img 
                  src={qrCode.qrImageUrl} 
                  alt={qrCode.metadata.title}
                  className="w-full h-full object-contain max-w-[200px] max-h-[200px]"
                />
              ) : (
                <QrCode className="w-16 h-16 text-gray-400" />
              )}
            </div>

            {/* QR Code Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{qrCode.metadata.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{qrCode.type.replace('-', ' ')}</p>
                </div>
                <div className={`w-2 h-2 rounded-full mt-2 ${qrCode.metadata.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{qrCode.metadata.description}</p>

              {/* Analytics Preview */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{qrCode.analytics.totalScans}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{qrCode.analytics.uniqueScans}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyQRUrl(qrCode)}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
                
                <button
                  onClick={() => handleDownloadQR(qrCode)}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-3 h-3" />
                  Save
                </button>
                
                <button
                  onClick={() => {}}
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">QR Code Analytics</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      ) : qrAnalytics ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-cyan-500">{qrAnalytics.totalScans || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Scans</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-500">{qrAnalytics.uniqueScans || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Unique Scans</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-purple-500">{qrAnalytics.totalQRCodes || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total QR Codes</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-orange-500">{qrAnalytics.activeQRCodes || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Active QR Codes</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Scans by Device
              </h4>
              <div className="space-y-3">
                {Object.entries(qrAnalytics.scansByDevice || {}).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300 capitalize">{device}</span>
                    <span className="text-gray-500 dark:text-gray-400">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Scans by Location
              </h4>
              <div className="space-y-3">
                {Object.entries(qrAnalytics.scansByLocation || {}).slice(0, 5).map(([location, count]) => (
                  <div key={location} className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{location}</span>
                    <span className="text-gray-500 dark:text-gray-400">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No analytics data available</p>
        </div>
      )}
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">QR Code Templates</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div 
            key={template.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors"
            onClick={() => setSelectedTemplate(template)}
          >
            {/* Template Preview */}
            <div 
              className="h-32 flex items-center justify-center"
              style={{ backgroundColor: template.style.backgroundColor }}
            >
              <div 
                className="w-16 h-16 rounded"
                style={{ 
                  backgroundColor: template.style.foregroundColor,
                  borderRadius: template.style.borderRadius ? `${template.style.borderRadius}px` : '0'
                }}
              />
            </div>

            {/* Template Info */}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{template.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{template.description}</p>
              
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  {template.style.width}px
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  {template.style.errorCorrectionLevel} Quality
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (qrCodes.length === 0 && activeTab === 'overview') {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <QrCode className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No QR Codes Created
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
          Create professional QR codes with advanced analytics, custom designs, and tracking capabilities.
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
        >
          Create Your First QR Code
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
          { id: 'qrcodes', label: 'QR Codes', icon: <QrCode className="w-4 h-4" /> },
          { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'templates', label: 'Templates', icon: <Palette className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "templates" | "overview" | "analytics" | "qrcodes")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'qrcodes' && renderQRCodes()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'templates' && renderTemplates()}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Create QR Code Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create QR Code</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              const config = {
                type: formData.get('type') as QRCodeConfig['type'],
                data: formData.get('data') as string,
                template: selectedTemplate || templates[0],
                metadata: {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  tags: ['cv', 'professional'],
                  isActive: true,
                  trackingEnabled: true
                }
              };
              
              await handleGenerateQR(config);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">QR Code Type</label>
                    <select
                      name="type"
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="profile">Profile Page</option>
                      <option value="contact">Contact Info</option>
                      <option value="portfolio">Portfolio</option>
                      <option value="resume-download">Resume Download</option>
                      <option value="linkedin">LinkedIn Profile</option>
                      <option value="portal-primary">Portal - Main</option>
                      <option value="portal-chat">Portal - Chat</option>
                      <option value="portal-contact">Portal - Contact</option>
                      <option value="portal-download">Portal - Download</option>
                      <option value="portal-menu">Portal - Menu</option>
                      <option value="custom">Custom URL</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
                    <input
                      name="title"
                      type="text"
                      required
                      placeholder="e.g., My Professional Profile"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Brief description of this QR code..."
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 focus:border-cyan-500 focus:outline-none resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Custom URL (optional)</label>
                    <input
                      name="data"
                      type="url"
                      placeholder="https://example.com"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Template</label>
                  <div className="grid grid-cols-2 gap-3">
                    {templates.slice(0, 4).map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div 
                          className="w-full h-12 rounded mb-2"
                          style={{ backgroundColor: template.style.backgroundColor }}
                        >
                          <div 
                            className="w-6 h-6 mx-auto pt-3 rounded"
                            style={{ backgroundColor: template.style.foregroundColor }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{template.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="inline w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Create QR Code'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};