import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QrCode, Download, Copy, Share2, Eye, BarChart3, RefreshCw, Settings, AlertCircle } from 'lucide-react';
import QRCodeGenerator from 'qrcode';
import toast from 'react-hot-toast';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';
import { CVFeatureProps, QRCodeData } from '../../../types/cv-features';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorBoundary, FunctionalErrorBoundary } from '../Common/ErrorBoundary';
import { useFeatureData } from '../../../hooks/useFeatureData';

// Enhanced JSON data structure for QR Code
interface EnhancedQRCodeData {
  qrCode: {
    imageUrl: string;
    dataUrl: string;
    value: string;
  };
  contactData: {
    format: 'vcard' | 'url';
    data: Record<string, any>;
  };
  analytics?: {
    scanCount: number;
    uniqueScans: number;
    lastScanned?: Date;
  };
}

interface QRCodeProps extends CVFeatureProps {
  data?: {
    url: string;
    profileUrl?: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
  } | null;
  enhancedData?: EnhancedQRCodeData | null;
  customization?: {
    size?: number;
    style?: 'square' | 'rounded' | 'circular';
    logoUrl?: string;
    backgroundColor?: string;
    foregroundColor?: string;
  };
}

interface QRCodeAnalytics {
  totalScans: number;
  uniqueScans: number;
  scansByDate: Record<string, number>;
  scansByDevice: Record<string, number>;
  lastScanned?: Date;
}

interface QRCodeOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export const DynamicQRCode: React.FC<QRCodeProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  enhancedData,
  customization = {},
  onUpdate,
  onError,
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
  
  // Enhanced data fetching using hooks
  const {
    data: fetchedQRData,
    loading: dataLoading,
    error: dataError,
    refresh: refreshData
  } = useFeatureData<EnhancedQRCodeData>({
    jobId,
    featureName: 'qr-code',
    initialData: enhancedData,
    params: { profileId }
  });

  // Use enhanced data if available, fall back to basic data
  const qrData = enhancedData || fetchedQRData;
  const basicData = data;
  
  // Initialize selectedUrl after qrData is defined
  const [selectedUrl, setSelectedUrl] = useState<string>(
    qrData?.qrCode?.value || basicData?.url || ''
  );
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Firebase analytics function
  const trackQRScan = httpsCallable(functions, 'trackQRCodeScan');
  const getQRAnalytics = httpsCallable(functions, 'getQRCodeAnalytics');

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
      
      // Get data URL for download/copy functionality
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setQrDataUrl(dataUrl);

      // Apply style-specific modifications
      if (style !== 'square') {
        applyStyleModifications();
      }

      // Add logo if provided
      if (logoUrl) {
        await addLogoToQRCode();
      }

      // Track generation event
      await trackQRCodeGeneration(url);
      
      onUpdate?.({ qrCode: dataUrl, generatedAt: new Date() });
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate QR code');
      setError(error);
      onError?.(error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  }, [getQRCodeOptions, style, logoUrl, onUpdate, onError]);

  // Apply style modifications (rounded/circular)
  const applyStyleModifications = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create a new canvas for the styled version
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Apply clipping mask based on style
    tempCtx.save();
    tempCtx.beginPath();
    
    if (style === 'circular') {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 10;
      tempCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    } else if (style === 'rounded') {
      const borderRadius = 20;
      const x = 10;
      const y = 10;
      const width = canvas.width - 20;
      const height = canvas.height - 20;
      
      tempCtx.moveTo(x + borderRadius, y);
      tempCtx.lineTo(x + width - borderRadius, y);
      tempCtx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
      tempCtx.lineTo(x + width, y + height - borderRadius);
      tempCtx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
      tempCtx.lineTo(x + borderRadius, y + height);
      tempCtx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
      tempCtx.lineTo(x, y + borderRadius);
      tempCtx.quadraticCurveTo(x, y, x + borderRadius, y);
    }
    
    tempCtx.clip();
    tempCtx.putImageData(imageData, 0, 0);
    tempCtx.restore();

    // Copy the styled version back to the main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    
    // Update data URL
    setQrDataUrl(canvas.toDataURL('image/png'));
  }, [style]);

  // Add logo to QR code
  const addLogoToQRCode = useCallback(async () => {
    if (!logoUrl || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        logo.onload = resolve;
        logo.onerror = reject;
        logo.src = logoUrl;
      });

      // Calculate logo size (20% of QR code size)
      const logoSize = canvas.width * 0.2;
      const x = (canvas.width - logoSize) / 2;
      const y = (canvas.height - logoSize) / 2;

      // Draw white background for logo
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
      
      // Draw logo
      ctx.drawImage(logo, x, y, logoSize, logoSize);
      
      // Update data URL
      setQrDataUrl(canvas.toDataURL('image/png'));
      
    } catch (err) {
      console.warn('Failed to add logo to QR code:', err);
    }
  }, [logoUrl, backgroundColor]);

  // Track QR code generation
  const trackQRCodeGeneration = useCallback(async (url: string) => {
    try {
      await trackQRScan({
        jobId,
        profileId,
        url,
        event: 'generated',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Failed to track QR generation:', err);
    }
  }, [jobId, profileId]);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      const result = await getQRAnalytics({ jobId, profileId });
      setAnalytics(result.data as QRCodeAnalytics);
    } catch (err) {
      console.warn('Failed to load QR analytics:', err);
    }
  }, [jobId, profileId]);

  // Handle URL selection change
  const handleUrlChange = useCallback((url: string) => {
    setSelectedUrl(url);
    generateQRCode(url);
  }, [generateQRCode]);

  // Download QR code
  const handleDownload = useCallback(() => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `qr-code-${profileId}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR code downloaded successfully!');
  }, [qrDataUrl, profileId]);

  // Copy QR code to clipboard
  const handleCopy = useCallback(async () => {
    if (!qrDataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      toast.success('QR code copied to clipboard!');
    } catch (err) {
      // Fallback: copy the data URL
      try {
        await navigator.clipboard.writeText(qrDataUrl);
        toast.success('QR code data URL copied to clipboard!');
      } catch {
        toast.error('Failed to copy QR code');
      }
    }
  }, [qrDataUrl]);

  // Share QR code
  const handleShare = useCallback(async () => {
    if (!qrDataUrl || !navigator.share) {
      toast.error('Sharing not supported on this device');
      return;
    }

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `qr-code-${profileId}.png`, { type: 'image/png' });
      
      await navigator.share({
        title: 'My QR Code',
        text: 'Check out my professional profile QR code',
        files: [file]
      });
      
    } catch (err) {
      toast.error('Failed to share QR code');
    }
  }, [qrDataUrl, profileId]);

  // Refresh QR code
  const handleRefresh = useCallback(() => {
    generateQRCode(selectedUrl);
    loadAnalytics();
  }, [generateQRCode, selectedUrl]);

  // Initialize component
  useEffect(() => {
    const urlToUse = qrData?.qrCode?.value || basicData?.url;
    if (isEnabled && urlToUse) {
      if (qrData?.qrCode?.imageUrl) {
        // Use pre-generated QR code if available
        setQrDataUrl(qrData.qrCode.dataUrl || qrData.qrCode.imageUrl);
        setAnalytics(qrData.analytics || null);
      } else {
        // Generate QR code locally
        generateQRCode(selectedUrl);
      }
      loadAnalytics();
    }
  }, [isEnabled, qrData, basicData, selectedUrl, generateQRCode]);

  // Re-generate when customization changes
  useEffect(() => {
    if (selectedUrl) {
      generateQRCode(selectedUrl);
    }
  }, [size, backgroundColor, foregroundColor, style, logoUrl, generateQRCode]);

  if (!isEnabled) {
    return null;
  }

  // Build URL options from available data sources
  const buildUrlOptions = () => {
    const options = [];
    
    if (qrData?.qrCode?.value) {
      options.push({ label: 'Generated URL', value: qrData.qrCode.value, icon: '🔗' });
    }
    
    if (basicData?.url) {
      options.push({ label: 'Profile URL', value: basicData.url, icon: '👤' });
    }
    
    if (basicData?.profileUrl) {
      options.push({ label: 'Public Profile', value: basicData.profileUrl, icon: '🌐' });
    }
    
    if (basicData?.portfolioUrl) {
      options.push({ label: 'Portfolio', value: basicData.portfolioUrl, icon: '💼' });
    }
    
    if (basicData?.linkedinUrl) {
      options.push({ label: 'LinkedIn', value: basicData.linkedinUrl, icon: '💼' });
    }
    
    return options;
  };
  
  const urlOptions = buildUrlOptions();

  // Loading state handling
  if (dataLoading && !qrData) {
    return (
      <ErrorBoundary onError={onError}>
        <FeatureWrapper
          className={className}
          mode={mode}
          title="Dynamic QR Code"
          description="Loading QR code data..."
          isLoading={true}
        >
          <LoadingSpinner size="large" message="Loading QR code data..." />
        </FeatureWrapper>
      </ErrorBoundary>
    );
  }

  // Error state handling
  if ((dataError || error) && !qrData && !basicData) {
    return (
      <ErrorBoundary onError={onError}>
        <FeatureWrapper
          className={className}
          mode={mode}
          title="Dynamic QR Code"
          error={dataError || error}
          onRetry={refreshData}
        >
          <div />
        </FeatureWrapper>
      </ErrorBoundary>
    );
  }

  // No data state
  if (!qrData && !basicData) {
    return (
      <ErrorBoundary onError={onError}>
        <FeatureWrapper
          className={className}
          mode={mode}
          title="Dynamic QR Code"
          description="No QR code data available"
        >
          <div className="text-center py-8">
            <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No QR code data available</p>
            <button
              onClick={refreshData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Retry
            </button>
          </div>
        </FeatureWrapper>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Dynamic QR Code"
        description="Customizable QR code with analytics tracking"
        isLoading={isGenerating || dataLoading}
        error={error}
        onRetry={() => {
          refreshData();
          if (selectedUrl) generateQRCode(selectedUrl);
        }}
      >
        <div className="space-y-6">
          {/* URL Selection */}
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

          {/* QR Code Display */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {isGenerating ? (
                <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                  <LoadingSpinner size="large" message="Generating QR code..." />
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

              {/* Error Display */}
              <FunctionalErrorBoundary 
                error={error} 
                onRetry={() => generateQRCode(selectedUrl)}
                title="QR Generation Error"
              />
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
          {(analytics || qrData?.analytics) && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">QR Code Analytics</h4>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(analytics || qrData?.analytics)?.scanCount || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Scans</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(analytics || qrData?.analytics)?.uniqueScans || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unique Scans</div>
                </div>
                
                {(analytics?.lastScanned || qrData?.analytics?.lastScanned) && (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(
                        analytics?.lastScanned || qrData?.analytics?.lastScanned || new Date()
                      ).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Last Scan</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current URL Display */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Current URL:</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 break-all">{selectedUrl}</p>
              </div>
            </div>
          </div>
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};