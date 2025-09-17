import React, { useState } from 'react';
import { Save, Globe, User, Briefcase, Phone, ExternalLink } from 'lucide-react';

interface QRCodeSettings {
  url: string;
  type: 'profile' | 'linkedin' | 'portfolio' | 'contact' | 'custom';
  customText: string;
}

interface QRCodeEditorProps {
  settings: QRCodeSettings;
  jobId: string;
  onSave: (settings: QRCodeSettings) => void;
  onCancel: () => void;
}

export const QRCodeEditor: React.FC<QRCodeEditorProps> = ({
  settings,
  jobId,
  onSave,
  onCancel
}) => {
  const [editingSettings, setEditingSettings] = useState<QRCodeSettings>({
    ...settings
  });

  const qrCodeTypes = [
    {
      id: 'profile' as const,
      name: 'Public CV Profile',
      icon: <User className="w-4 h-4" />,
      description: 'Links to your hosted CV profile',
      defaultUrl: `https://getmycv-ai.web.app/cv/${jobId}`,
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
    setEditingSettings(prev => ({
      ...prev,
      type,
      url: typeInfo?.defaultUrl || prev.url,
      customText: typeInfo?.defaultText || prev.customText
    }));
  };

  const handleSave = () => {
    // Validate URL
    if (!editingSettings.url || !editingSettings.url.trim()) {
      alert('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(editingSettings.url);
    } catch {
      // If it's not a valid URL, check if it's a mailto: or tel: link
      if (!editingSettings.url.startsWith('mailto:') && !editingSettings.url.startsWith('tel:')) {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
      }
    }

    onSave(editingSettings);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('mailto:') || url.startsWith('tel:');
    }
  };

  return (
    <div className="space-y-6">
      {/* QR Code Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">QR Code Type</label>
        <div className="space-y-2">
          {qrCodeTypes.map((type) => (
            <label
              key={type.id}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                editingSettings.type === type.id
                  ? 'bg-cyan-900/30 border-cyan-500/50'
                  : 'bg-gray-700/30 border-transparent hover:bg-gray-700/50'
              }`}
            >
              <input
                type="radio"
                name="qrType"
                value={type.id}
                checked={editingSettings.type === type.id}
                onChange={() => handleTypeChange(type.id)}
                className="mt-1 text-cyan-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {type.icon}
                  <span className="font-medium text-gray-200">{type.name}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{type.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Destination URL
        </label>
        <input
          type="url"
          value={editingSettings.url}
          onChange={(e) => setEditingSettings(prev => ({ ...prev, url: e.target.value }))}
          placeholder="https://example.com"
          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
            editingSettings.url && !isValidUrl(editingSettings.url)
              ? 'border-red-500'
              : 'border-gray-600'
          }`}
        />
        {editingSettings.url && !isValidUrl(editingSettings.url) && (
          <p className="text-red-400 text-xs mt-1">Please enter a valid URL</p>
        )}
      </div>

      {/* Custom Text */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Display Text
        </label>
        <input
          type="text"
          value={editingSettings.customText}
          onChange={(e) => setEditingSettings(prev => ({ ...prev, customText: e.target.value }))}
          placeholder="Text to display below QR code"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Preview */}
      <div className="bg-gray-900/50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Preview</h4>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-600 border-2 dashed border-gray-500 mx-auto mb-2 flex items-center justify-center rounded text-xs">
            📱 QR
          </div>
          <div className="text-xs text-gray-400">{editingSettings.customText}</div>
          <div className="text-xs text-gray-500 mt-1 break-all">{editingSettings.url}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!editingSettings.url || !isValidUrl(editingSettings.url)}
          className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save QR Settings
        </button>
      </div>
    </div>
  );
};