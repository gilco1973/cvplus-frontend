import React, { useState } from 'react';
import { Save, Globe, User, Briefcase, Phone, ExternalLink, AlertCircle } from 'lucide-react';
import { isValidUrl } from '../qr/utils';

interface QRCodeSettings {
  url: string;
  type: 'profile' | 'linkedin' | 'portfolio' | 'contact' | 'custom' | 'portal-primary' | 'portal-chat' | 'portal-contact' | 'portal-download' | 'portal-menu';
  customText: string;
}

interface QRCodeEditorProps {
  settings: QRCodeSettings;
  jobId: string;
  onSave: (settings: QRCodeSettings) => void;
  onCancel: () => void;
  className?: string;
}

export const QRCodeEditor: React.FC<QRCodeEditorProps> = ({
  settings,
  jobId,
  onSave,
  onCancel,
  className = ''
}) => {
  const [editingSettings, setEditingSettings] = useState<QRCodeSettings>({
    ...settings
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const qrCodeTypes = [
    {
      id: 'profile' as const,
      name: 'Public CV Profile',
      icon: <User className="w-4 h-4" />,
      description: 'Links to your hosted CV profile',
      defaultUrl: `https://cvplus.web.app/profile/${jobId}`,
      defaultText: 'View my Professional CV'
    },
    {
      id: 'linkedin' as const,
      name: 'LinkedIn Profile',
      icon: <Briefcase className="w-4 h-4" />,
      description: 'Links to your LinkedIn profile',
      defaultUrl: 'https://linkedin.com/in/your-profile',
      defaultText: 'Connect on LinkedIn'
    },
    {
      id: 'portfolio' as const,
      name: 'Portfolio Website',
      icon: <Globe className="w-4 h-4" />,
      description: 'Links to your personal website/portfolio',
      defaultUrl: 'https://your-portfolio.com',
      defaultText: 'View my Portfolio'
    },
    {
      id: 'contact' as const,
      name: 'Contact Information',
      icon: <Phone className="w-4 h-4" />,
      description: 'Links to contact form or email',
      defaultUrl: 'mailto:your-email@example.com',
      defaultText: 'Get in Touch'
    },
    {
      id: 'portal-primary' as const,
      name: 'Main Portal',
      icon: <Globe className="w-4 h-4" />,
      description: 'Links to your main portal page',
      defaultUrl: `https://cvplus.web.app/portal/${jobId}`,
      defaultText: 'Access My Portal'
    },
    {
      id: 'portal-chat' as const,
      name: 'Portal Chat',
      icon: <User className="w-4 h-4" />,
      description: 'Direct access to AI chat',
      defaultUrl: `https://cvplus.web.app/portal/${jobId}/chat`,
      defaultText: 'Chat with AI'
    },
    {
      id: 'portal-contact' as const,
      name: 'Portal Contact',
      icon: <Phone className="w-4 h-4" />,
      description: 'Direct access to contact form',
      defaultUrl: `https://cvplus.web.app/portal/${jobId}/contact`,
      defaultText: 'Contact Me'
    },
    {
      id: 'portal-download' as const,
      name: 'Portal Download',
      icon: <Briefcase className="w-4 h-4" />,
      description: 'Direct CV download access',
      defaultUrl: `https://cvplus.web.app/portal/${jobId}/download`,
      defaultText: 'Download CV'
    },
    {
      id: 'portal-menu' as const,
      name: 'Portal Menu',
      icon: <ExternalLink className="w-4 h-4" />,
      description: 'Landing page with all options',
      defaultUrl: `https://cvplus.web.app/portal/${jobId}/menu`,
      defaultText: 'Explore Options'
    },
    {
      id: 'custom' as const,
      name: 'Custom URL',
      icon: <ExternalLink className="w-4 h-4" />,
      description: 'Enter any custom URL',
      defaultUrl: 'https://example.com',
      defaultText: 'Visit Website'
    }
  ];

  const handleTypeChange = (type: QRCodeSettings['type']) => {
    const typeInfo = qrCodeTypes.find(t => t.id === type);
    const newSettings = {
      ...editingSettings,
      type,
      url: typeInfo?.defaultUrl || editingSettings.url,
      customText: typeInfo?.defaultText || editingSettings.customText
    };
    
    setEditingSettings(newSettings);
    
    // Clear URL error when type changes
    if (errors.url) {
      setErrors(prev => ({ ...prev, url: '' }));
    }
  };

  const validateSettings = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate URL
    if (!editingSettings.url || !editingSettings.url.trim()) {
      newErrors.url = 'Please enter a valid URL';
    } else if (!isValidUrl(editingSettings.url)) {
      newErrors.url = 'Please enter a valid URL (e.g., https://example.com)';
    }
    
    // Validate custom text
    if (!editingSettings.customText || !editingSettings.customText.trim()) {
      newErrors.customText = 'Please enter display text';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateSettings()) {
      onSave(editingSettings);
    }
  };

  const handleUrlChange = (url: string) => {
    setEditingSettings(prev => ({ ...prev, url }));
    
    // Clear error when user starts typing
    if (errors.url && url.trim()) {
      setErrors(prev => ({ ...prev, url: '' }));
    }
  };

  const handleTextChange = (customText: string) => {
    setEditingSettings(prev => ({ ...prev, customText }));
    
    // Clear error when user starts typing
    if (errors.customText && customText.trim()) {
      setErrors(prev => ({ ...prev, customText: '' }));
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* QR Code Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          QR Code Type
        </label>
        <div className="space-y-2">
          {qrCodeTypes.map((type) => (
            <label
              key={type.id}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                editingSettings.type === type.id
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 dark:border-cyan-400'
                  : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="radio"
                name="qrType"
                value={type.id}
                checked={editingSettings.type === type.id}
                onChange={() => handleTypeChange(type.id)}
                className="mt-1 text-cyan-500 focus:ring-cyan-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">{type.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{type.name}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Destination URL *
        </label>
        <input
          type="url"
          value={editingSettings.url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com"
          className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
            errors.url
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.url && (
          <div className="flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-red-500 text-xs">{errors.url}</p>
          </div>
        )}
      </div>

      {/* Custom Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Display Text *
        </label>
        <input
          type="text"
          value={editingSettings.customText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Text to display with QR code"
          className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
            errors.customText
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.customText && (
          <div className="flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-red-500 text-xs">{errors.customText}</p>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview</h4>
        <div className="text-center">
          <div className="w-20 h-20 bg-white border-2 border-dashed border-gray-300 dark:border-gray-600 mx-auto mb-3 flex items-center justify-center rounded-lg text-sm text-gray-500">
            📱 QR
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {editingSettings.customText || 'Display Text'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 break-all px-2">
            {editingSettings.url || 'URL will appear here'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!editingSettings.url || !editingSettings.customText || Object.keys(errors).length > 0}
          className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save QR Settings
        </button>
      </div>
    </div>
  );
};