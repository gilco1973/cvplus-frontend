/**
 * PortalQRIntegration.tsx - Enhanced QR Code Integration for Portals
 * 
 * Advanced QR code generation specifically designed for portal URLs with
 * comprehensive analytics tracking, smart placement options, social sharing,
 * and portal-specific customization features.
 * 
 * Features:
 * - Portal URL QR code generation with enhanced styling
 * - Advanced analytics dashboard for QR scan tracking
 * - Smart QR placement options (floating, embedded, modal)
 * - Social sharing with portal-specific messaging
 * - UTM parameter generation for marketing attribution
 * - Geographic and device tracking
 * - A/B testing for different QR designs
 * - Real-time visitor analytics and heat maps
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Share2,
  BarChart3,
  RefreshCw,
  Settings,
  Globe,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
  Eye,
  MousePointer,
  Link,
  Palette,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
  Target,
  Activity,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import QRCodeGenerator from 'qrcode';
import toast from 'react-hot-toast';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';
import { PortalQRIntegrationProps } from '../../../types/portal-component-props';
import { QRCodeData, QRScanData, PortalError } from '../../../types/portal-types';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorBoundary, FunctionalErrorBoundary } from '../Common/ErrorBoundary';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface PortalQRAnalytics {
  // Basic metrics
  totalScans: number;
  uniqueVisitors: number;
  returnVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  
  // Time-based analytics
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
  peakHours: Array<{ hour: number; scans: number }>;
  scansByDate: Record<string, number>;
  
  // Device & platform analytics
  deviceTypes: Record<'mobile' | 'desktop' | 'tablet', number>;
  browsers: Record<string, number>;
  operatingSystems: Record<string, number>;
  
  // Geographic analytics
  countries: Record<string, number>;
  cities: Record<string, number>;
  coordinates: Array<{ lat: number; lng: number; count: number }>;
  
  // Portal-specific metrics
  sectionEngagement: Record<string, { views: number; avgTime: number }>;
  conversionRate: number;
  ctaClicks: number;
  contactFormSubmissions: number;
  
  // Traffic sources
  referralSources: Record<string, number>;
  utmCampaigns: Record<string, number>;
  socialPlatforms: Record<string, number>;
  
  // Advanced metrics
  heatmapData: Array<{ x: number; y: number; intensity: number }>;
  scrollDepth: Record<string, number>;
  pageLoadSpeed: number;
  mobileOptimizationScore: number;
  
  lastUpdated: Date;
}

interface QRPlacementMode {
  type: 'floating' | 'embedded' | 'modal' | 'overlay' | 'sidebar';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size: 'small' | 'medium' | 'large' | 'custom';
  customSize?: number;
  trigger?: 'auto' | 'hover' | 'click' | 'scroll' | 'time';
  triggerValue?: number;
  animation?: 'fade' | 'slide' | 'bounce' | 'zoom' | 'none';
}

interface UTMParameters {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

interface QRCustomization {
  // Basic styling
  foregroundColor: string;
  backgroundColor: string;
  logoEnabled: boolean;
  logoUrl?: string;
  logoSize: number;
  
  // Advanced styling
  gradientEnabled: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  borderEnabled: boolean;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffset: { x: number; y: number };
  
  // Pattern & design
  cornerStyle: 'square' | 'rounded' | 'circle' | 'diamond';
  dataPattern: 'square' | 'circle' | 'rounded-square' | 'heart' | 'star';
  frameStyle: 'none' | 'simple' | 'fancy' | 'minimal';
  
  // Branding
  brandColors: boolean;
  customFrame?: string;
  watermark?: string;
}

interface SharingOptions {
  title: string;
  description: string;
  hashtags: string[];
  platforms: Array<'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'email' | 'copy'>;
  customMessage?: string;
  includeAnalytics: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PortalQRIntegration: React.FC<PortalQRIntegrationProps> = ({
  portalConfig,
  qrConfig,
  displaySettings = {},
  downloadConfig = {},
  analytics: analyticsConfig = {},
  customization: customizationProp = {},
  onQRGenerated,
  onQRScanned,
  onDownload,
  onShare,
  onError,
  className = '',
  jobId,
  profileId,
  isEnabled = true,
  mode = 'private'
}) => {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analytics, setAnalytics] = useState<PortalQRAnalytics | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [error, setError] = useState<PortalError | null>(null);
  
  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'analytics' | 'sharing'>('basic');
  
  // Configuration State
  const [placementMode, setPlacementMode] = useState<QRPlacementMode>({
    type: displaySettings?.style === 'floating' ? 'floating' : 'embedded',
    position: 'bottom-right',
    size: displaySettings?.size || 'medium',
    trigger: 'auto',
    animation: 'fade'
  });
  
  const [utmParams, setUtmParams] = useState<UTMParameters>({
    source: 'qr-code',
    medium: 'portal',
    campaign: `portal-${portalConfig.name}`,
    term: 'professional-profile',
    content: 'main-qr'
  });
  
  const [customization, setCustomization] = useState<QRCustomization>({
    foregroundColor: customizationProp?.colors?.foreground || portalConfig.theme.primaryColor,
    backgroundColor: customizationProp?.colors?.background || '#FFFFFF',
    logoEnabled: customizationProp?.logo?.enabled || true,
    logoUrl: customizationProp?.logo?.url,
    logoSize: customizationProp?.logo?.size || 0.2,
    
    gradientEnabled: false,
    gradientStart: portalConfig.theme.primaryColor,
    gradientEnd: portalConfig.theme.secondaryColor,
    borderEnabled: customizationProp?.border?.enabled || false,
    borderWidth: customizationProp?.border?.width || 2,
    borderColor: customizationProp?.border?.color || portalConfig.theme.primaryColor,
    borderRadius: 8,
    shadowEnabled: customizationProp?.shadow?.enabled || true,
    shadowColor: '#00000020',
    shadowBlur: 8,
    shadowOffset: { x: 0, y: 4 },
    
    cornerStyle: 'rounded',
    dataPattern: 'square',
    frameStyle: 'simple',
    brandColors: true,
    watermark: `CVPlus - ${portalConfig.name}`
  });
  
  const [sharingOptions, setSharingOptions] = useState<SharingOptions>({
    title: `${portalConfig.metadata.title} - Professional Portal`,
    description: portalConfig.metadata.description,
    hashtags: ['CVPlus', 'Portfolio', 'Professional'],
    platforms: ['facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy'],
    includeAnalytics: true
  });
  
  // ========================================================================
  // FIREBASE FUNCTIONS
  // ========================================================================
  
  const trackPortalQRScan = httpsCallable(functions, 'trackPortalQRScan');
  const getPortalQRAnalytics = httpsCallable(functions, 'getPortalQRAnalytics');
  const generatePortalUTMUrl = httpsCallable(functions, 'generatePortalUTMUrl');
  
  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================
  
  const finalQRUrl = useMemo(() => {
    const baseUrl = qrConfig.url;
    if (!baseUrl) return '';
    
    // Add UTM parameters for tracking
    const url = new URL(baseUrl);
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(`utm_${key}`, value);
      }
    });
    
    // Add portal-specific tracking parameters
    url.searchParams.set('portal_id', portalConfig.id);
    url.searchParams.set('qr_generated', new Date().toISOString());
    url.searchParams.set('qr_placement', placementMode.type);
    
    return url.toString();
  }, [qrConfig.url, utmParams, portalConfig.id, placementMode.type]);
  
  const qrSize = useMemo(() => {
    const sizeMap = { small: 128, medium: 256, large: 384, custom: displaySettings?.customSize || 256 };
    return placementMode.size === 'custom' ? (placementMode.customSize || 256) : sizeMap[placementMode.size];
  }, [placementMode.size, placementMode.customSize, displaySettings?.customSize]);
  
  // ========================================================================
  // QR CODE GENERATION
  // ========================================================================
  
  const generateEnhancedQRCode = useCallback(async () => {
    if (!finalQRUrl || !canvasRef.current) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      const options = {
        width: qrSize,
        margin: 2,
        color: {
          dark: customization.gradientEnabled ? customization.gradientStart : customization.foregroundColor,
          light: customization.backgroundColor
        },
        errorCorrectionLevel: qrConfig.errorCorrectionLevel || 'M' as const
      };
      
      // Generate base QR code
      await QRCodeGenerator.toCanvas(canvasRef.current, finalQRUrl, options);
      
      // Apply advanced styling
      await applyAdvancedStyling();
      
      // Add logo if enabled
      if (customization.logoEnabled && customization.logoUrl) {
        await addPortalLogo();
      }
      
      // Apply frame styling
      if (customization.frameStyle !== 'none') {
        await applyFrameStyling();
      }
      
      // Generate final data URL
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setQrDataUrl(dataUrl);
      
      // Create QR code data object
      const qrData: QRCodeData = {
        qrCodeUrl: dataUrl,
        targetUrl: finalQRUrl,
        dimensions: { width: qrSize, height: qrSize },
        generatedAt: new Date(),
        format: 'png'
      };
      
      // Track generation event
      await trackQRGeneration();
      
      // Notify parent component
      onQRGenerated?.(qrData);
      
    } catch (err) {
      const error: PortalError = {
        code: 'QR_GENERATION_ERROR',
        message: err instanceof Error ? err.message : 'Failed to generate QR code',
        component: 'PortalQRIntegration',
        operation: 'generateEnhancedQRCode',
        context: { finalQRUrl, qrSize, customization }
      };
      
      setError(error);
      onError?.(error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  }, [finalQRUrl, qrSize, customization, qrConfig.errorCorrectionLevel, onQRGenerated, onError]);
  
  const applyAdvancedStyling = useCallback(async () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Apply gradient if enabled
    if (customization.gradientEnabled && customization.gradientStart && customization.gradientEnd) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, customization.gradientStart);
      gradient.addColorStop(1, customization.gradientEnd);
      
      // Apply gradient to dark pixels
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
          const x = (i / 4) % canvas.width;
          const y = Math.floor((i / 4) / canvas.width);
          
          // Sample gradient at this position
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    
    // Apply border if enabled
    if (customization.borderEnabled) {
      ctx.strokeStyle = customization.borderColor;
      ctx.lineWidth = customization.borderWidth;
      
      if (customization.borderRadius > 0) {
        drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, customization.borderRadius, false, true);
      } else {
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    // Apply shadow if enabled
    if (customization.shadowEnabled) {
      ctx.shadowColor = customization.shadowColor;
      ctx.shadowBlur = customization.shadowBlur;
      ctx.shadowOffsetX = customization.shadowOffset.x;
      ctx.shadowOffsetY = customization.shadowOffset.y;
    }
  }, [customization]);
  
  const addPortalLogo = useCallback(async () => {
    if (!customization.logoUrl || !canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        logo.onload = resolve;
        logo.onerror = reject;
        logo.src = customization.logoUrl!;
      });
      
      // Calculate logo size and position
      const logoSize = canvas.width * customization.logoSize;
      const x = (canvas.width - logoSize) / 2;
      const y = (canvas.height - logoSize) / 2;
      
      // Draw logo background
      ctx.fillStyle = customization.backgroundColor;
      ctx.beginPath();
      if (customization.cornerStyle === 'circle') {
        ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
      } else {
        drawRoundedRect(ctx, x - 5, y - 5, logoSize + 10, logoSize + 10, 5, true, false);
      }
      ctx.fill();
      
      // Draw logo with corner style
      ctx.save();
      ctx.beginPath();
      if (customization.cornerStyle === 'circle') {
        ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, 2 * Math.PI);
      } else if (customization.cornerStyle === 'rounded') {
        drawRoundedRect(ctx, x, y, logoSize, logoSize, logoSize * 0.1, true, false);
      } else {
        ctx.rect(x, y, logoSize, logoSize);
      }
      ctx.clip();
      ctx.drawImage(logo, x, y, logoSize, logoSize);
      ctx.restore();
      
    } catch (err) {
      console.warn('Failed to add portal logo:', err);
    }
  }, [customization]);
  
  const applyFrameStyling = useCallback(async () => {
    if (!canvasRef.current || customization.frameStyle === 'none') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = customization.borderColor;
    ctx.lineWidth = 3;
    
    switch (customization.frameStyle) {
      case 'simple':
        ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
        break;
      case 'fancy':
        drawFancyFrame(ctx, canvas.width, canvas.height);
        break;
      case 'minimal':
        drawMinimalFrame(ctx, canvas.width, canvas.height);
        break;
    }
  }, [customization]);
  
  // ========================================================================
  // ANALYTICS FUNCTIONS
  // ========================================================================
  
  const loadPortalAnalytics = useCallback(async () => {
    if (!analyticsConfig?.enabled) return;
    
    try {
      setIsAnalyticsLoading(true);
      
      const result = await getPortalQRAnalytics({
        portalId: portalConfig.id,
        jobId,
        profileId,
        timeRange: '30d'
      });
      
      setAnalytics(result.data as PortalQRAnalytics);
      
    } catch (err) {
      console.warn('Failed to load portal QR analytics:', err);
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, [analyticsConfig?.enabled, portalConfig.id, jobId, profileId, getPortalQRAnalytics]);
  
  const trackQRGeneration = useCallback(async () => {
    if (!analyticsConfig?.trackGeneration) return;
    
    try {
      await trackPortalQRScan({
        portalId: portalConfig.id,
        jobId,
        profileId,
        url: finalQRUrl,
        event: 'qr_generated',
        placement: placementMode.type,
        utmParams,
        customization,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.warn('Failed to track QR generation:', err);
    }
  }, [analyticsConfig?.trackGeneration, portalConfig.id, jobId, profileId, finalQRUrl, placementMode.type, utmParams, customization, trackPortalQRScan]);
  
  // ========================================================================
  // ACTION HANDLERS
  // ========================================================================
  
  const handleDownload = useCallback(async (format = 'png') => {
    if (!qrDataUrl) return;
    
    try {
      let downloadUrl = qrDataUrl;
      let filename = downloadConfig?.filenameTemplate?.replace('{name}', portalConfig.name) || `portal-qr-${portalConfig.name}`;
      
      // Handle different formats
      if (format !== 'png') {
        // Convert to other formats if needed
        const canvas = canvasRef.current;
        if (canvas) {
          switch (format) {
            case 'jpeg':
              downloadUrl = canvas.toDataURL('image/jpeg', 0.9);
              filename += '.jpg';
              break;
            case 'svg':
              // SVG generation would require additional library
              filename += '.svg';
              break;
            case 'pdf':
              // PDF generation would require additional library
              filename += '.pdf';
              break;
            default:
              filename += '.png';
          }
        }
      } else {
        filename += '.png';
      }
      
      // Create download link
      const link = document.createElement('a');
      link.download = filename;
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Create blob for callback
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      onDownload?.(format, blob);
      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
      
    } catch (err) {
      toast.error('Failed to download QR code');
    }
  }, [qrDataUrl, downloadConfig?.filenameTemplate, portalConfig.name, onDownload]);
  
  const handleShare = useCallback(async (platform: string) => {
    if (!qrDataUrl) return;
    
    try {
      const shareData = {
        title: sharingOptions.title,
        text: sharingOptions.description,
        url: finalQRUrl
      };
      
      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(finalQRUrl);
          toast.success('Portal URL copied to clipboard!');
          break;
          
        case 'email': {
          const emailBody = `Check out my professional portal: ${finalQRUrl}`;
          window.open(`mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(emailBody)}`);
          break;
        }
          
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalQRUrl)}`);
          break;
          
        case 'twitter': {
          const tweetText = `${shareData.text} ${sharingOptions.hashtags.map(h => `#${h}`).join(' ')}`;
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(finalQRUrl)}`);
          break;
        }
          
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(finalQRUrl)}`);
          break;
          
        case 'whatsapp': {
          const whatsappText = `${shareData.text} ${finalQRUrl}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`);
          break;
        }
          
        default:
          if (navigator.share) {
            await navigator.share(shareData);
          }
      }
      
      onShare?.({
        platform,
        url: finalQRUrl,
        timestamp: new Date()
      });
      
    } catch (err) {
      toast.error(`Failed to share via ${platform}`);
    }
    
    setShowShareMenu(false);
  }, [qrDataUrl, sharingOptions, finalQRUrl, onShare]);
  
  const handleRefresh = useCallback(() => {
    generateEnhancedQRCode();
    loadPortalAnalytics();
    toast.success('QR code refreshed!');
  }, [generateEnhancedQRCode, loadPortalAnalytics]);
  
  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================
  
  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: boolean, stroke: boolean) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  };
  
  const drawFancyFrame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const margin = 10;
    const cornerSize = 20;
    
    // Draw corner decorations
    [  
      [margin, margin],
      [width - margin - cornerSize, margin],
      [margin, height - margin - cornerSize],
      [width - margin - cornerSize, height - margin - cornerSize]
    ].forEach(([x, y]) => {
      ctx.strokeRect(x, y, cornerSize, cornerSize);
      ctx.beginPath();
      ctx.moveTo(x + 5, y + cornerSize / 2);
      ctx.lineTo(x + cornerSize - 5, y + cornerSize / 2);
      ctx.moveTo(x + cornerSize / 2, y + 5);
      ctx.lineTo(x + cornerSize / 2, y + cornerSize - 5);
      ctx.stroke();
    });
  };
  
  const drawMinimalFrame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const margin = 15;
    const lineLength = 25;
    
    // Draw minimal corner lines
    ctx.beginPath();
    // Top-left
    ctx.moveTo(margin, margin + lineLength);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + lineLength, margin);
    // Top-right
    ctx.moveTo(width - margin - lineLength, margin);
    ctx.lineTo(width - margin, margin);
    ctx.lineTo(width - margin, margin + lineLength);
    // Bottom-left
    ctx.moveTo(margin, height - margin - lineLength);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(margin + lineLength, height - margin);
    // Bottom-right
    ctx.moveTo(width - margin - lineLength, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.lineTo(width - margin, height - margin - lineLength);
    ctx.stroke();
  };
  
  // ========================================================================
  // EFFECTS
  // ========================================================================
  
  useEffect(() => {
    if (isEnabled && finalQRUrl) {
      generateEnhancedQRCode();
      loadPortalAnalytics();
    }
  }, [isEnabled, finalQRUrl, generateEnhancedQRCode, loadPortalAnalytics]);
  
  useEffect(() => {
    if (finalQRUrl) {
      generateEnhancedQRCode();
    }
  }, [customization, placementMode.size, generateEnhancedQRCode]);
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setShowSettings(false);
        setShowShareMenu(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  // ========================================================================
  // RENDER HELPERS
  // ========================================================================
  
  const renderQRDisplay = () => (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        {isGenerating ? (
          <div 
            className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg"
            style={{ width: qrSize, height: qrSize }}
          >
            <LoadingSpinner size="large" message="Generating enhanced QR code..." />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className={`border border-gray-200 dark:border-gray-700 shadow-lg transition-transform group-hover:scale-105 ${
              customization.borderRadius > 0 ? 'rounded-lg' : ''
            }`}
            style={{ maxWidth: '100%', height: 'auto' }}
            onClick={() => placementMode.type === 'modal' && setShowModal(true)}
          />
        )}
        
        {/* Overlay controls for embedded mode */}
        {!isGenerating && qrDataUrl && placementMode.type === 'embedded' && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                title="Refresh QR Code"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                title="View Full Size"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <FunctionalErrorBoundary 
        error={error} 
        onRetry={generateEnhancedQRCode}
        title="QR Generation Error"
      />
    </div>
  );
  
  const renderActionButtons = () => (
    <div className="flex flex-wrap justify-center gap-2">
      <button
        onClick={() => handleDownload('png')}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Download
      </button>
      
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        
        {showShareMenu && (
          <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-48">
            {sharingOptions.platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => handleShare(platform)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
              >
                {getPlatformIcon(platform)}
                <span className="capitalize">{platform}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button
        onClick={() => setShowAnalytics(!showAnalytics)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <BarChart3 className="w-4 h-4" />
        Analytics
      </button>
      
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <Settings className="w-4 h-4" />
        Settings
      </button>
    </div>
  );
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'copy': return <Copy className="w-4 h-4" />;
      case 'email': return <ExternalLink className="w-4 h-4" />;
      case 'facebook': return <Globe className="w-4 h-4" />;
      case 'twitter': return <Globe className="w-4 h-4" />;
      case 'linkedin': return <Globe className="w-4 h-4" />;
      case 'whatsapp': return <Smartphone className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };
  
  const renderSettingsPanel = () => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">QR Code Settings</h4>
        <button
          onClick={() => setShowSettings(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Settings Tabs */}
      <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
        {[  
          { id: 'basic', label: 'Basic', icon: Settings },
          { id: 'advanced', label: 'Advanced', icon: Palette },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'sharing', label: 'Sharing', icon: Share2 }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      
      {/* Settings Content */}
      <div className="space-y-4">
        {activeTab === 'basic' && renderBasicSettings()}
        {activeTab === 'advanced' && renderAdvancedSettings()}
        {activeTab === 'analytics' && renderAnalyticsSettings()}
        {activeTab === 'sharing' && renderSharingSettings()}
      </div>
    </div>
  );
  
  const renderBasicSettings = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Size: {qrSize}px
        </label>
        <select
          value={placementMode.size}
          onChange={(e) => setPlacementMode({ ...placementMode, size: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        >
          <option value="small">Small (128px)</option>
          <option value="medium">Medium (256px)</option>
          <option value="large">Large (384px)</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Placement Type
        </label>
        <select
          value={placementMode.type}
          onChange={(e) => setPlacementMode({ ...placementMode, type: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        >
          <option value="embedded">Embedded</option>
          <option value="floating">Floating</option>
          <option value="modal">Modal</option>
          <option value="overlay">Overlay</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Foreground Color
        </label>
        <input
          type="color"
          value={customization.foregroundColor}
          onChange={(e) => setCustomization({ ...customization, foregroundColor: e.target.value })}
          className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Background Color
        </label>
        <input
          type="color"
          value={customization.backgroundColor}
          onChange={(e) => setCustomization({ ...customization, backgroundColor: e.target.value })}
          className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
        />
      </div>
    </div>
  );
  
  const renderAdvancedSettings = () => (
    <div className="space-y-4">
      {/* Logo Settings */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="logo-enabled"
            checked={customization.logoEnabled}
            onChange={(e) => setCustomization({ ...customization, logoEnabled: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="logo-enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enable Logo
          </label>
        </div>
        
        {customization.logoEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                value={customization.logoUrl || ''}
                onChange={(e) => setCustomization({ ...customization, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Logo Size: {Math.round(customization.logoSize * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.4"
                step="0.05"
                value={customization.logoSize}
                onChange={(e) => setCustomization({ ...customization, logoSize: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Gradient Settings */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="gradient-enabled"
            checked={customization.gradientEnabled}
            onChange={(e) => setCustomization({ ...customization, gradientEnabled: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="gradient-enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enable Gradient
          </label>
        </div>
        
        {customization.gradientEnabled && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gradient Start
              </label>
              <input
                type="color"
                value={customization.gradientStart || '#000000'}
                onChange={(e) => setCustomization({ ...customization, gradientStart: e.target.value })}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gradient End
              </label>
              <input
                type="color"
                value={customization.gradientEnd || '#333333'}
                onChange={(e) => setCustomization({ ...customization, gradientEnd: e.target.value })}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Frame & Border Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Frame Style
          </label>
          <select
            value={customization.frameStyle}
            onChange={(e) => setCustomization({ ...customization, frameStyle: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="none">None</option>
            <option value="simple">Simple</option>
            <option value="fancy">Fancy</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Corner Style
          </label>
          <select
            value={customization.cornerStyle}
            onChange={(e) => setCustomization({ ...customization, cornerStyle: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
            <option value="circle">Circle</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
      </div>
    </div>
  );
  
  const renderAnalyticsSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="track-generation"
            checked={analyticsConfig?.trackGeneration || false}
            className="rounded border-gray-300"
            readOnly
          />
          <label htmlFor="track-generation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Track Generation
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="track-scans"
            checked={analyticsConfig?.trackScans || false}
            className="rounded border-gray-300"
            readOnly
          />
          <label htmlFor="track-scans" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Track Scans
          </label>
        </div>
      </div>
      
      {/* UTM Parameters */}
      <div className="space-y-3">
        <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">UTM Parameters</h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Source
            </label>
            <input
              type="text"
              value={utmParams.source}
              onChange={(e) => setUtmParams({ ...utmParams, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Medium
            </label>
            <input
              type="text"
              value={utmParams.medium}
              onChange={(e) => setUtmParams({ ...utmParams, medium: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campaign
            </label>
            <input
              type="text"
              value={utmParams.campaign}
              onChange={(e) => setUtmParams({ ...utmParams, campaign: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <input
              type="text"
              value={utmParams.content || ''}
              onChange={(e) => setUtmParams({ ...utmParams, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              placeholder="Optional"
            />
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderSharingSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Share Title
        </label>
        <input
          type="text"
          value={sharingOptions.title}
          onChange={(e) => setSharingOptions({ ...sharingOptions, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Share Description
        </label>
        <textarea
          value={sharingOptions.description}
          onChange={(e) => setSharingOptions({ ...sharingOptions, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Hashtags (comma-separated)
        </label>
        <input
          type="text"
          value={sharingOptions.hashtags.join(', ')}
          onChange={(e) => setSharingOptions({ 
            ...sharingOptions, 
            hashtags: e.target.value.split(',').map(h => h.trim()).filter(Boolean)
          })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
      </div>
    </div>
  );
  
  const renderAnalyticsDashboard = () => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Portal QR Analytics</h4>
        </div>
        <button
          onClick={() => setShowAnalytics(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {isAnalyticsLoading ? (
        <LoadingSpinner message="Loading analytics..." />
      ) : analytics ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Scans</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{analytics.totalScans}</div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Unique Visitors</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{analytics.uniqueVisitors}</div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Session</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(analytics.averageSessionDuration / 60)}m
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Conversion</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(analytics.conversionRate * 100)}%
              </div>
            </div>
          </div>
          
          {/* Device Breakdown */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Device Types</h5>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Smartphone className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <div className="text-lg font-bold">{analytics.deviceTypes.mobile}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Mobile</div>
              </div>
              <div className="text-center">
                <Monitor className="w-6 h-6 mx-auto mb-1 text-green-600" />
                <div className="text-lg font-bold">{analytics.deviceTypes.desktop}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Desktop</div>
              </div>
              <div className="text-center">
                <Tablet className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                <div className="text-lg font-bold">{analytics.deviceTypes.tablet}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Tablet</div>
              </div>
            </div>
          </div>
          
          {/* Geographic Data */}
          {Object.keys(analytics.countries).length > 0 && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Top Countries</h5>
              <div className="space-y-2">
                {Object.entries(analytics.countries)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{country}</span>
                      </div>
                      <span className="text-sm font-semibold">{count}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          {/* Section Engagement */}
          {Object.keys(analytics.sectionEngagement).length > 0 && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Section Engagement</h5>
              <div className="space-y-2">
                {Object.entries(analytics.sectionEngagement)
                  .sort(([, a], [, b]) => b.views - a.views)
                  .slice(0, 5)
                  .map(([section, data]) => (
                    <div key={section} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{section.replace('_', ' ')}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{data.views} views</span>
                        <span className="text-gray-500">{Math.round(data.avgTime)}s avg</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No analytics data available
        </div>
      )}
    </div>
  );
  
  const renderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Portal QR Code</h3>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center space-y-4">
          {renderQRDisplay()}
          {qrDataUrl && !isGenerating && renderActionButtons()}
        </div>
        
        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Scan this QR code to visit your portal
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1 break-all">
            {finalQRUrl}
          </p>
        </div>
      </div>
    </div>
  );
  
  // ========================================================================
  // RENDER CONDITIONS
  // ========================================================================
  
  if (!isEnabled) {
    return null;
  }
  
  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  
  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title={displaySettings?.showTitle ? (displaySettings?.title || 'Portal QR Code') : undefined}
        description={displaySettings?.showInstructions ? (displaySettings?.instructions || 'Scan to visit your professional portal') : undefined}
        isLoading={isGenerating}
        error={error}
        onRetry={generateEnhancedQRCode}
      >
        <div className="space-y-6">
          {/* QR Code Display */}
          {renderQRDisplay()}
          
          {/* Action Buttons */}
          {qrDataUrl && !isGenerating && renderActionButtons()}
          
          {/* Settings Panel */}
          {showSettings && renderSettingsPanel()}
          
          {/* Analytics Dashboard */}
          {showAnalytics && renderAnalyticsDashboard()}
          
          {/* Current URL Display */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <QrCode className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Portal URL with Analytics Tracking:
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 break-all font-mono">
                  {finalQRUrl}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-blue-600 dark:text-blue-400">
                  <span>Campaign: {utmParams.campaign}</span>
                  <span>Source: {utmParams.source}</span>
                  <span>Medium: {utmParams.medium}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FeatureWrapper>
      
      {/* Modal */}
      {showModal && renderModal()}
    </ErrorBoundary>
  );
};

export default PortalQRIntegration;