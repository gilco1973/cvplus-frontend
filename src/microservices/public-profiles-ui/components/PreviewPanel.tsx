import React, { useRef, useEffect, useState } from 'react';
import { usePreviewGenerator } from '../hooks/usePreviewGenerator';
import { TemplateConfiguration, BrandingSettings } from '../types/creator.types';
import { PublicProfileData } from '../../types/profile.types';

interface PreviewPanelProps {
  profileData: Partial<PublicProfileData>;
  template: TemplateConfiguration | null;
  branding: BrandingSettings;
  fullScreen?: boolean;
  className?: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  profileData,
  template,
  branding,
  fullScreen = false,
  className = '',
}) => {
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock template definition for preview generator
  const templateDefinition = template ? {
    id: template.id,
    name: template.name,
    category: template.type as any,
    theme: {
      colors: {
        primary: branding.primaryColor,
        secondary: branding.secondaryColor,
        accent: branding.accentColor,
        background: '#ffffff',
        text: '#333333',
        muted: '#666666',
      },
      typography: {
        headingFont: branding.fontFamily,
        bodyFont: branding.fontFamily,
        sizes: {
          h1: '2rem',
          h2: '1.5rem',
          h3: '1.25rem',
          body: '1rem',
          caption: '0.875rem',
        },
      },
      spacing: {
        section: '2rem',
        element: '1rem',
        compact: '0.5rem',
      },
    },
    layout: {
      type: 'single-column' as const,
      headerStyle: 'standard' as const,
      navigationStyle: 'top' as const,
      footerStyle: 'minimal' as const,
      sectionSpacing: 'normal' as const,
    },
    components: [],
    defaultSections: [],
    customizations: {
      allowColorChange: true,
      allowFontChange: true,
      allowLayoutChange: false,
      allowSectionReorder: true,
    },
    responsive: {
      breakpoints: {
        mobile: 640,
        tablet: 1024,
        desktop: 1280,
      },
      adaptiveLayout: true,
      mobileOptimized: true,
    },
    seo: {
      structured: true,
      socialCards: true,
      performanceOptimized: true,
    },
    isPremium: template.isPremium,
    features: template.features,
  } : null;

  const {
    previewConfig,
    previewHtml,
    previewCss,
    isGenerating,
    previewError,
    updateDevice,
    updateZoom,
    getDeviceDimensions,
  } = usePreviewGenerator({
    profileData,
    template: templateDefinition,
    branding,
    updateDelay: 300,
  });

  // Update iframe content when HTML or CSS changes
  useEffect(() => {
    if (previewRef.current && previewHtml) {
      const iframe = previewRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();

        // Add CSS
        if (previewCss) {
          const style = doc.createElement('style');
          style.textContent = previewCss;
          doc.head.appendChild(style);
        }

        setIsLoading(false);
      }
    }
  }, [previewHtml, previewCss]);

  const deviceDimensions = getDeviceDimensions();

  if (!template) {
    return (
      <div className={`preview-panel flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👀</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Template Selected</h3>
          <p className="text-gray-600">Select a template to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`preview-panel flex flex-col bg-gray-50 ${className}`}>
      {/* Preview Controls */}
      {fullScreen && (
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center space-x-4">
            <h3 className="font-medium text-gray-900">Preview</h3>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                <button
                  key={device}
                  onClick={() => updateDevice(device)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    previewConfig.device === device
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {device === 'desktop' ? '🖥️' : device === 'tablet' ? '📱' : '📱'}
                  <span className="ml-1 hidden sm:inline">
                    {device.charAt(0).toUpperCase() + device.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateZoom(previewConfig.zoom - 0.25)}
                disabled={previewConfig.zoom <= 0.25}
                className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                🔍-
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                {Math.round(previewConfig.zoom * 100)}%
              </span>
              <button
                onClick={() => updateZoom(previewConfig.zoom + 0.25)}
                disabled={previewConfig.zoom >= 2}
                className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                🔍+
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Refresh Preview"
            >
              🔄
            </button>
          </div>
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 p-4 overflow-auto">
        {isGenerating && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Generating preview...</p>
            </div>
          </div>
        )}

        {previewError && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Error</h3>
              <p className="text-gray-600">{previewError}</p>
            </div>
          </div>
        )}

        {!isGenerating && !previewError && (
          <div className="flex justify-center">
            <div
              className="preview-container bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
              style={{
                width: fullScreen ? deviceDimensions.width * previewConfig.zoom : '100%',
                height: fullScreen ? deviceDimensions.height * previewConfig.zoom : 'auto',
                minHeight: fullScreen ? 'auto' : '600px',
                maxWidth: fullScreen ? 'none' : '100%',
                transform: fullScreen ? `scale(${previewConfig.zoom})` : 'none',
                transformOrigin: 'top center',
              }}
            >
              <iframe
                ref={previewRef}
                className="w-full h-full border-0"
                title="Profile Preview"
                sandbox="allow-same-origin"
                onLoad={() => setIsLoading(false)}
                style={{
                  height: fullScreen ? deviceDimensions.height : '600px',
                }}
              />

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin text-2xl mb-2">⏳</div>
                    <p className="text-gray-600 text-sm">Loading preview...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preview Info */}
      {!fullScreen && (
        <div className="p-4 bg-white border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Template: {template.name}</span>
              <span>•</span>
              <span>Device: {previewConfig.device}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateDevice('desktop')}
                className={`p-1 rounded ${previewConfig.device === 'desktop' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Desktop Preview"
              >
                🖥️
              </button>
              <button
                onClick={() => updateDevice('tablet')}
                className={`p-1 rounded ${previewConfig.device === 'tablet' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Tablet Preview"
              >
                📱
              </button>
              <button
                onClick={() => updateDevice('mobile')}
                className={`p-1 rounded ${previewConfig.device === 'mobile' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Mobile Preview"
              >
                📱
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};