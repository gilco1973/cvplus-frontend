import React from 'react';
import {
  Layout,
  Settings,
  Copy,
  Share2,
  RefreshCw,
  ArrowUpRight,
  CheckCircle
} from 'lucide-react';

interface PortalSettingsPanelProps {
  isOpen: boolean;
  currentLayout: 'modern' | 'classic' | 'minimal';
  customization: any;
  portalUrl?: string;
  deploymentPolling: boolean;
  themeClasses: {
    background: string;
    text: string;
    secondary: string;
    border: string;
    card: string;
  };
  onLayoutChange: (layout: 'modern' | 'classic' | 'minimal') => void;
  onUpdate?: (data: any) => void;
  onCopyUrl: () => void;
  onShare: () => void;
  onManualDeploy: () => void;
}

const LAYOUT_OPTIONS = {
  modern: {
    name: 'Modern',
    description: 'Clean, contemporary design with bold typography',
    preview: '🎨'
  },
  classic: {
    name: 'Classic',
    description: 'Traditional, professional layout',
    preview: '📄'
  },
  minimal: {
    name: 'Minimal',
    description: 'Clean, distraction-free design',
    preview: '⚪'
  }
};

export const PortalSettingsPanel: React.FC<PortalSettingsPanelProps> = ({
  isOpen,
  currentLayout,
  customization,
  portalUrl,
  deploymentPolling,
  themeClasses,
  onLayoutChange,
  onUpdate,
  onCopyUrl,
  onShare,
  onManualDeploy
}) => {
  if (!isOpen) return null;
  
  return (
    <div className={`${themeClasses.card} ${themeClasses.border} border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Layout Options */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Layout className="w-5 h-5 mr-2" />
              Layout Style
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(LAYOUT_OPTIONS).map(([key, layout]) => (
                <button
                  key={key}
                  onClick={() => onLayoutChange(key as any)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    currentLayout === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : `${themeClasses.border} hover:border-gray-300`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{layout.preview}</span>
                        <span className="font-medium">{layout.name}</span>
                      </div>
                      <p className={`text-sm ${themeClasses.secondary}`}>{layout.description}</p>
                    </div>
                    {currentLayout === key && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Portal Actions */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Portal Actions
            </h3>
            <div className="space-y-3">
              {portalUrl && (
                <>
                  <button
                    onClick={onCopyUrl}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Portal URL</span>
                  </button>
                  
                  {navigator.share && (
                    <button
                      onClick={onShare}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Portal</span>
                    </button>
                  )}
                  
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Open Portal</span>
                  </a>
                </>
              )}
              
              <button
                onClick={onManualDeploy}
                disabled={deploymentPolling}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${deploymentPolling ? 'animate-spin' : ''}`} />
                <span>{deploymentPolling ? 'Deploying...' : 'Deploy Portal'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};