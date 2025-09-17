import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QrCode, Download, Copy, Share2, Eye, BarChart3, RefreshCw, Settings, AlertCircle, Loader2 } from 'lucide-react';
import QRCodeGenerator from 'qrcode';
import { QRCodeProps, QRCodeAnalytics, QRCodeOptions, EnhancedQRCodeData } from './types';
import { 
  generateQROptions, 
  applyStyleModifications, 
  addLogoToCanvas, 
  copyCanvasToClipboard, 
  downloadCanvas, 
  shareCanvas,
  parseDeviceInfo
} from './utils';

interface DynamicQRCodeProps extends QRCodeProps {
  onGenerate?: (qrCode: string) => void;
  onScanTracked?: (scanData: any) => void;
}

export const DynamicQRCode: React.FC<DynamicQRCodeProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  enhancedData,
  customization = {},
  onUpdate,
  onError,
  onGenerate,
  onScanTracked,
  className = '',
  mode = 'private'
}) => {
  const {
    size = 256,
    style = 'square',
    logoUrl,
    backgroundColor = '#FFFFFF',
    foregroundColor = '#000000'
  } = customization;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analytics, setAnalytics] = useState<QRCodeAnalytics | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize selected URL
  useEffect(() => {
    const initialUrl = enhancedData?.qrCode?.value || data?.url || '';
    if (initialUrl) {
      setSelectedUrl(initialUrl);
    }
  }, [enhancedData, data]);

  // Generate QR code options
  const getQRCodeOptions = useCallback((): QRCodeOptions => {
    return {
      width: size,
      margin: 2,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      },
      errorCorrectionLevel: 'M'
    };
  }, [size, foregroundColor, backgroundColor]);

  // Generate QR code
  const generateQRCode = useCallback(async (url: string) => {
    if (!url || !canvasRef.current) return;

    try {
      setIsGenerating(true);
      setError(null);

      const options = getQRCodeOptions();
      
      // Generate QR code to canvas
      await QRCodeGenerator.toCanvas(canvasRef.current, url, options);
      
      // Apply style modifications
      if (style !== 'square') {
        applyStyleModifications(canvasRef.current, style);
      }

      // Add logo if provided
      if (logoUrl) {
        await addLogoToCanvas(canvasRef.current, logoUrl, backgroundColor);
      }

      // Get data URL
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setQrDataUrl(dataUrl);

      // Track generation
      await trackQRGeneration(url);
      
      onUpdate?.({ qrCode: dataUrl, generatedAt: new Date() });
      onGenerate?.(dataUrl);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate QR code');
      setError(error);
      onError?.(error);
    } finally {
      setIsGenerating(false);
    }
  }, [getQRCodeOptions, style, logoUrl, backgroundColor, onUpdate, onError, onGenerate]);

  // Track QR code generation
  const trackQRGeneration = useCallback(async (url: string) => {
    try {
      // Call multimedia backend service for QR tracking
      const response = await fetch('/api/qr/track-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          profileId,
          url,
          event: 'generated',
          timestamp: new Date().toISOString(),
          device: parseDeviceInfo(navigator.userAgent)
        })
      });
      
      if (response.ok) {
        const trackingData = await response.json();
        onScanTracked?.(trackingData);
      }
    } catch (err) {
      console.warn('Failed to track QR generation:', err);
    }
  }, [jobId, profileId, onScanTracked]);

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    if (!jobId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/qr/analytics/${jobId}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.warn('Failed to load QR analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  // Handle URL selection
  const handleUrlChange = useCallback((url: string) => {
    setSelectedUrl(url);
    generateQRCode(url);
  }, [generateQRCode]);

  // Download QR code
  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    downloadCanvas(canvasRef.current, `qr-code-${profileId || jobId}.png`);
  }, [profileId, jobId]);

  // Copy QR code
  const handleCopy = useCallback(async () => {
    if (!canvasRef.current) return;
    
    try {
      await copyCanvasToClipboard(canvasRef.current);
      // Show success message (could integrate with toast)
    } catch (err) {
      console.error('Failed to copy QR code:', err);
    }
  }, []);

  // Share QR code
  const handleShare = useCallback(async () => {
    if (!canvasRef.current) return;
    
    try {
      await shareCanvas(
        canvasRef.current,
        'My QR Code',
        'Check out my professional profile QR code'
      );
    } catch (err) {
      console.error('Failed to share QR code:', err);
    }
  }, []);

  // Refresh QR code
  const handleRefresh = useCallback(() => {
    if (selectedUrl) {
      generateQRCode(selectedUrl);
    }
    loadAnalytics();
  }, [generateQRCode, selectedUrl, loadAnalytics]);

  // Initialize component
  useEffect(() => {
    if (isEnabled && selectedUrl) {
      if (enhancedData?.qrCode?.imageUrl) {
        setQrDataUrl(enhancedData.qrCode.dataUrl || enhancedData.qrCode.imageUrl);
      } else {
        generateQRCode(selectedUrl);
      }
      loadAnalytics();
    }
  }, [isEnabled, selectedUrl, enhancedData, generateQRCode, loadAnalytics]);

  // Re-generate when customization changes
  useEffect(() => {
    if (selectedUrl && isEnabled) {
      generateQRCode(selectedUrl);
    }
  }, [size, backgroundColor, foregroundColor, style, logoUrl, generateQRCode, selectedUrl, isEnabled]);

  if (!isEnabled) {
    return null;
  }

  // Build URL options
  const buildUrlOptions = () => {
    const options = [];
    
    if (enhancedData?.qrCode?.value) {
      options.push({ label: 'Generated URL', value: enhancedData.qrCode.value, icon: '🔗' });
    }
    
    if (data?.url) {
      options.push({ label: 'Profile URL', value: data.url, icon: '👤' });
    }
    
    if (data?.profileUrl) {
      options.push({ label: 'Public Profile', value: data.profileUrl, icon: '🌐' });
    }
    
    if (data?.portfolioUrl) {
      options.push({ label: 'Portfolio', value: data.portfolioUrl, icon: '💼' });
    }
    
    if (data?.linkedinUrl) {
      options.push({ label: 'LinkedIn', value: data.linkedinUrl, icon: '💼' });
    }
    
    return options;
  };
  
  const urlOptions = buildUrlOptions();

  if (error) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code Error</h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => {
            setError(null);
            if (selectedUrl) generateQRCode(selectedUrl);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* URL Selection */}
      {urlOptions.length > 1 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select URL to encode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {urlOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleUrlChange(option.value)}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  selectedUrl === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {isGenerating ? (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className={`border border-gray-200 dark:border-gray-700 shadow-lg ${
                style === 'rounded' ? 'rounded-lg' : style === 'circular' ? 'rounded-full' : ''
              }`}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          )}
        </div>

        {/* Action Buttons */}
        {qrDataUrl && !isGenerating && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            
            {navigator.share && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">QR Code Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Size: {size}px
              </label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => onUpdate?.({ customization: { ...customization, size: parseInt(e.target.value) } })}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Style
              </label>
              <select
                value={style}
                onChange={(e) => onUpdate?.({ customization: { ...customization, style: e.target.value as 'square' | 'rounded' | 'circular' } })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
                <option value="circular">Circular</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Foreground Color
              </label>
              <input
                type="color"
                value={foregroundColor}
                onChange={(e) => onUpdate?.({ customization: { ...customization, foregroundColor: e.target.value } })}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => onUpdate?.({ customization: { ...customization, backgroundColor: e.target.value } })}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      {(analytics || enhancedData?.analytics) && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">QR Code Analytics</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(analytics || enhancedData?.analytics)?.totalScans || (enhancedData?.analytics?.scanCount) || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Scans</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(analytics || enhancedData?.analytics)?.uniqueScans || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Unique Scans</div>
            </div>
            
            {((analytics?.lastScanned || enhancedData?.analytics?.lastScanned)) && (
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(
                    analytics?.lastScanned || enhancedData?.analytics?.lastScanned || new Date()
                  ).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Last Scan</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current URL Display */}
      {selectedUrl && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Current URL:</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 break-all">{selectedUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};