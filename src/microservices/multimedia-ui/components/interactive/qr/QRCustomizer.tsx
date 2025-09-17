import React, { useState, useEffect } from 'react';
import { Palette, Download, RefreshCw, Settings, Eye, EyeOff } from 'lucide-react';
import { QRCodeTemplate, QRCodeCustomization } from './types';
import { DynamicQRCode } from './DynamicQRCode';

interface QRCustomizerProps {
  jobId: string;
  profileId?: string;
  initialUrl?: string;
  templates?: QRCodeTemplate[];
  onSave?: (customization: QRCodeCustomization, qrImageUrl: string) => void;
  onCancel?: () => void;
  className?: string;
}

const defaultTemplates: QRCodeTemplate[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, business-ready design',
    style: {
      foregroundColor: '#1f2937',
      backgroundColor: '#ffffff',
      margin: 2,
      errorCorrectionLevel: 'M',
      width: 256,
      borderRadius: 8,
      gradientType: 'none'
    }
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with gradients',
    style: {
      foregroundColor: '#0f172a',
      backgroundColor: '#ffffff',
      margin: 3,
      errorCorrectionLevel: 'M',
      width: 300,
      borderRadius: 12,
      gradientType: 'linear',
      gradientColors: ['#06b6d4', '#3b82f6']
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and clean',
    style: {
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      margin: 1,
      errorCorrectionLevel: 'L',
      width: 200,
      gradientType: 'none'
    }
  }
];

export const QRCustomizer: React.FC<QRCustomizerProps> = ({
  jobId,
  profileId,
  initialUrl = '',
  templates = defaultTemplates,
  onSave,
  onCancel,
  className = ''
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<QRCodeTemplate>(templates[0]);
  const [customization, setCustomization] = useState<QRCodeCustomization>({
    size: 256,
    style: 'square',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000'
  });
  const [url, setUrl] = useState(initialUrl);
  const [generatedQR, setGeneratedQR] = useState<string>('');
  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState<'template' | 'customize' | 'advanced'>('template');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Initialize customization from selected template
  useEffect(() => {
    if (selectedTemplate) {
      setCustomization(prev => ({
        ...prev,
        size: selectedTemplate.style.width,
        backgroundColor: selectedTemplate.style.backgroundColor,
        foregroundColor: selectedTemplate.style.foregroundColor,
        style: selectedTemplate.style.borderRadius ? 'rounded' : 'square'
      }));
    }
  }, [selectedTemplate]);

  // Handle logo file upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setCustomization(prev => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setCustomization(prev => ({ ...prev, logoUrl: undefined }));
  };

  // Handle save
  const handleSave = () => {
    if (onSave && generatedQR) {
      onSave(customization, generatedQR);
    }
  };

  // Update customization helper
  const updateCustomization = (updates: Partial<QRCodeCustomization>) => {
    setCustomization(prev => ({ ...prev, ...updates }));
  };

  const renderTemplateTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Choose Template</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedTemplate.id === template.id
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {/* Template Preview */}
            <div 
              className="w-full h-16 rounded mb-3 flex items-center justify-center"
              style={{ backgroundColor: template.style.backgroundColor }}
            >
              <div 
                className="w-8 h-8"
                style={{ 
                  backgroundColor: template.style.foregroundColor,
                  borderRadius: template.style.borderRadius ? '4px' : '0'
                }}
              />
            </div>
            
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{template.description}</p>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {template.style.width}px
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {template.style.errorCorrectionLevel}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderCustomizeTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customize Design</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Size Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Size: {customization.size}px
          </label>
          <input
            type="range"
            min="128"
            max="512"
            step="32"
            value={customization.size}
            onChange={(e) => updateCustomization({ size: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>128px</span>
            <span>512px</span>
          </div>
        </div>
        
        {/* Style Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Style
          </label>
          <select
            value={customization.style}
            onChange={(e) => updateCustomization({ style: e.target.value as 'square' | 'rounded' | 'circular' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="square">Square</option>
            <option value="rounded">Rounded Corners</option>
            <option value="circular">Circular</option>
          </select>
        </div>
        
        {/* Foreground Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Foreground Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customization.foregroundColor}
              onChange={(e) => updateCustomization({ foregroundColor: e.target.value })}
              className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={customization.foregroundColor}
              onChange={(e) => updateCustomization({ foregroundColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="#000000"
            />
          </div>
        </div>
        
        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Background Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customization.backgroundColor}
              onChange={(e) => updateCustomization({ backgroundColor: e.target.value })}
              className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={customization.backgroundColor}
              onChange={(e) => updateCustomization({ backgroundColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advanced Options</h3>
      
      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Logo (Optional)
        </label>
        
        {logoPreview ? (
          <div className="flex items-center gap-4">
            <img 
              src={logoPreview} 
              alt="Logo preview" 
              className="w-16 h-16 object-contain border border-gray-300 dark:border-gray-600 rounded-lg bg-white"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Logo will be centered in the QR code
              </p>
              <button
                onClick={removeLogo}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove Logo
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-cyan-50 file:text-cyan-700
                hover:file:bg-cyan-100
                dark:file:bg-cyan-900/20 dark:file:text-cyan-400
                dark:hover:file:bg-cyan-900/30"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Recommended: Square PNG/JPG, max 500KB
            </p>
          </div>
        )}
      </div>
      
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          QR Code URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">QR Code Customizer</h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-8`}>
        {/* Customization Panel */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'template', label: 'Templates', icon: <Palette className="w-4 h-4" /> },
              { id: 'customize', label: 'Customize', icon: <Settings className="w-4 h-4" /> },
              { id: 'advanced', label: 'Advanced', icon: <RefreshCw className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            {activeTab === 'template' && renderTemplateTab()}
            {activeTab === 'customize' && renderCustomizeTab()}
            {activeTab === 'advanced' && renderAdvancedTab()}
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Live Preview</h3>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <DynamicQRCode
                jobId={jobId}
                profileId={profileId}
                isEnabled={true}
                data={{ url }}
                customization={customization}
                onGenerate={setGeneratedQR}
                className=""
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
        
        {onSave && (
          <button
            onClick={handleSave}
            disabled={!generatedQR || !url}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Save QR Code
          </button>
        )}
      </div>
    </div>
  );
};