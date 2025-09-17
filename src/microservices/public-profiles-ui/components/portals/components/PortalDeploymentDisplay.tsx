import React from 'react';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  RefreshCw,
  ExternalLink,
  Copy
} from 'lucide-react';
import { DeploymentStatus } from '../../../../types/portal-types';

interface PortalDeploymentDisplayProps {
  deploymentStatus: DeploymentStatus;
  portalUrl?: string;
  onCopyUrl: () => void;
}

export const PortalDeploymentDisplay: React.FC<PortalDeploymentDisplayProps> = ({
  deploymentStatus,
  portalUrl,
  onCopyUrl
}) => {
  const statusConfig = {
    initializing: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50' },
    validating: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
    preparing: { icon: Settings, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    uploading: { icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-50' },
    building: { icon: Settings, color: 'text-orange-500', bg: 'bg-orange-50' },
    deploying: { icon: RefreshCw, color: 'text-green-500', bg: 'bg-green-50' },
    testing: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    failed: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' }
  };
  
  const config = statusConfig[deploymentStatus.phase];
  const StatusIcon = config.icon;
  
  return (
    <div className={`${config.bg} border border-gray-200 rounded-lg p-4 mb-6`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-5 h-5 ${config.color} ${
            deploymentStatus.phase === 'deploying' || deploymentStatus.phase === 'uploading' ? 'animate-spin' : ''
          }`} />
          <span className="font-medium text-gray-900 capitalize">
            {deploymentStatus.phase === 'completed' ? 'Deployment Complete' : 
             deploymentStatus.phase === 'failed' ? 'Deployment Failed' :
             deploymentStatus.currentOperation}
          </span>
        </div>
        {deploymentStatus.phase !== 'completed' && deploymentStatus.phase !== 'failed' && (
          <span className="text-sm text-gray-500">{deploymentStatus.progress}%</span>
        )}
      </div>
      
      {/* Progress bar */}
      {deploymentStatus.phase !== 'completed' && deploymentStatus.phase !== 'failed' && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${deploymentStatus.progress}%` }}
          />
        </div>
      )}
      
      {/* Portal URL when deployed */}
      {deploymentStatus.phase === 'completed' && portalUrl && (
        <div className="flex items-center space-x-2 p-3 bg-white rounded border">
          <ExternalLink className="w-4 h-4 text-green-600" />
          <a 
            href={portalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-green-600 hover:text-green-700 font-medium truncate flex-1"
          >
            {portalUrl}
          </a>
          <button
            onClick={onCopyUrl}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Error message */}
      {deploymentStatus.phase === 'failed' && deploymentStatus.error && (
        <div className="text-sm text-red-600 bg-white p-3 rounded border">
          {deploymentStatus.error.message}
        </div>
      )}
    </div>
  );
};