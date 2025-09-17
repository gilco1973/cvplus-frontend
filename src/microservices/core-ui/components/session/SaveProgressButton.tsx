// SaveProgressButton - Manual save functionality component
import React, { useState, useEffect } from 'react';
import { Save, Check, AlertCircle, Clock } from 'lucide-react';

interface SaveProgressButtonProps {
  onSave: () => Promise<boolean>;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showAutoSaveStatus?: boolean;
  autoSaveEnabled?: boolean;
  lastSavedAt?: Date;
  className?: string;
  children?: React.ReactNode;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const SaveProgressButton: React.FC<SaveProgressButtonProps> = ({
  onSave,
  disabled = false,
  variant = 'secondary',
  size = 'md',
  showAutoSaveStatus = true,
  autoSaveEnabled = false,
  lastSavedAt,
  className = '',
  children
}) => {
  const [status, setStatus] = useState<SaveStatus>('idle');

  // Auto-reset saved status after 2 seconds
  useEffect(() => {
    if (status === 'saved' || status === 'error') {
      const timer = setTimeout(() => {
        setStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSave = async () => {
    if (disabled) return;

    setStatus('saving');
    try {
      const success = await onSave();
      setStatus(success ? 'saved' : 'error');
    } catch (error) {
      console.error('Save failed:', error);
      setStatus('error');
    }
  };

  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2'
    };

    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300',
      minimal: 'bg-transparent text-gray-600 hover:bg-gray-50 focus:ring-gray-500'
    };

    const statusStyles = {
      saving: 'opacity-75 cursor-not-allowed',
      saved: variant === 'primary' ? 'bg-green-600 hover:bg-green-600' : 'bg-green-100 text-green-700 border-green-300',
      error: variant === 'primary' ? 'bg-red-600 hover:bg-red-600' : 'bg-red-100 text-red-700 border-red-300',
      idle: ''
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${statusStyles[status]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  };

  const getIcon = () => {
    switch (status) {
      case 'saving':
        return <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;
      case 'saved':
        return <Check className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Save className="w-4 h-4" />;
    }
  };

  const getButtonText = () => {
    if (children) return children;
    
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved!';
      case 'error':
        return 'Save Failed';
      default:
        return 'Save Progress';
    }
  };

  const formatLastSaved = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={handleSave}
        disabled={disabled || status === 'saving'}
        className={getButtonStyles()}
        type="button"
      >
        {getIcon()}
        <span>{getButtonText()}</span>
      </button>

      {showAutoSaveStatus && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {autoSaveEnabled && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Auto-save on</span>
            </div>
          )}
          {lastSavedAt && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Last saved {formatLastSaved(lastSavedAt)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Alternative compact version for headers/toolbars
export const CompactSaveButton: React.FC<Pick<SaveProgressButtonProps, 'onSave' | 'disabled' | 'lastSavedAt'>> = ({
  onSave,
  disabled = false,
  lastSavedAt
}) => {
  const [status, setStatus] = useState<SaveStatus>('idle');

  const handleSave = async () => {
    if (disabled) return;

    setStatus('saving');
    try {
      const success = await onSave();
      setStatus(success ? 'saved' : 'error');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (error) {
      console.error('Save failed:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1500);
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'saving':
        return <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;
      case 'saved':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Save className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSave}
        disabled={disabled || status === 'saving'}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Save progress"
      >
        {getIcon()}
      </button>
      {lastSavedAt && status === 'idle' && (
        <span className="text-xs text-gray-500">
          {formatLastSaved(lastSavedAt)}
        </span>
      )}
    </div>
  );
};

// Utility function for consistent time formatting
const formatLastSaved = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};