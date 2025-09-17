/**
 * Feature Detection Component
 * 
 * Advanced feature detection and capability testing for progressive
 * enhancement of multimedia features. Provides comprehensive browser
 * and device capability assessment for optimal user experience.
 * 
 * Features:
 * - Comprehensive browser capability detection
 * - Device and hardware assessment
 * - Network condition monitoring
 * - Progressive feature enablement
 * - Fallback mechanism coordination
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  Battery,
  Cpu,
  HardDrive,
  Camera,
  Mic,
  Volume2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

// Feature detection interfaces
interface DeviceCapabilities {
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
    colorDepth: number;
    orientation: 'portrait' | 'landscape';
  };
  hardware: {
    cores: number;
    memory: number; // GB estimate
    storage: number; // Available storage estimate
    gpu: string;
    touch: boolean;
  };
  media: {
    camera: boolean;
    microphone: boolean;
    speakers: boolean;
    webRTC: boolean;
    mediaRecorder: boolean;
  };
  network: {
    type: string;
    effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | undefined;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
}

interface BrowserCapabilities {
  name: string;
  version: string;
  engine: string;
  features: {
    webGL: boolean;
    webGL2: boolean;
    canvas: boolean;
    svg: boolean;
    video: {
      h264: boolean;
      webm: boolean;
      av1: boolean;
      hls: boolean;
      dash: boolean;
    };
    audio: {
      mp3: boolean;
      aac: boolean;
      ogg: boolean;
      webAudio: boolean;
    };
    storage: {
      localStorage: boolean;
      sessionStorage: boolean;
      indexedDB: boolean;
      webSQL: boolean;
    };
    apis: {
      fetch: boolean;
      websocket: boolean;
      webWorker: boolean;
      serviceWorker: boolean;
      intersectionObserver: boolean;
      mutationObserver: boolean;
    };
  };
}

interface FeatureSupport {
  level: 'full' | 'partial' | 'none';
  confidence: number; // 0-100
  reason?: string;
  fallback?: string;
}

interface FeatureMatrix {
  videoGeneration: FeatureSupport;
  audioProcessing: FeatureSupport;
  imageEditing: FeatureSupport;
  realTimeUpdates: FeatureSupport;
  advancedAnalytics: FeatureSupport;
  offlineSupport: FeatureSupport;
  highQualityPlayback: FeatureSupport;
  interactiveFeatures: FeatureSupport;
}

interface FeatureDetectionContextValue {
  deviceCapabilities: DeviceCapabilities | null;
  browserCapabilities: BrowserCapabilities | null;
  featureMatrix: FeatureMatrix | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  isSupported: (feature: keyof FeatureMatrix) => boolean;
  getSupportLevel: (feature: keyof FeatureMatrix) => 'full' | 'partial' | 'none';
}

// Context for feature detection
const FeatureDetectionContext = createContext<FeatureDetectionContextValue | null>(null);

export const useFeatureDetection = () => {
  const context = useContext(FeatureDetectionContext);
  if (!context) {
    throw new Error('useFeatureDetection must be used within a FeatureDetectionProvider');
  }
  return context;
};

interface FeatureDetectionProviderProps {
  children: ReactNode;
  autoDetect?: boolean;
  refreshInterval?: number;
}

export const FeatureDetectionProvider: React.FC<FeatureDetectionProviderProps> = ({
  children,
  autoDetect = true,
  refreshInterval = 300000 // 5 minutes
}) => {
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);
  const [browserCapabilities, setBrowserCapabilities] = useState<BrowserCapabilities | null>(null);
  const [featureMatrix, setFeatureMatrix] = useState<FeatureMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoDetect) {
      detectCapabilities();
      
      const interval = setInterval(detectCapabilities, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoDetect, refreshInterval]);

  const detectCapabilities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [device, browser] = await Promise.all([
        detectDeviceCapabilities(),
        detectBrowserCapabilities()
      ]);

      setDeviceCapabilities(device);
      setBrowserCapabilities(browser);
      
      const matrix = calculateFeatureMatrix(device, browser);
      setFeatureMatrix(matrix);
    } catch (err) {
      console.error('Feature detection failed:', err);
      setError('Failed to detect device capabilities');
    } finally {
      setIsLoading(false);
    }
  };

  const detectDeviceCapabilities = async (): Promise<DeviceCapabilities> => {
    const screen = {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: window.screen.colorDepth,
      orientation: window.screen.width > window.screen.height ? 'landscape' as const : 'portrait' as const
    };

    const hardware = {
      cores: navigator.hardwareConcurrency || 4,
      memory: (navigator as any).deviceMemory || 4,
      storage: await getStorageEstimate(),
      gpu: await getGPUInfo(),
      touch: 'ontouchstart' in window
    };

    const media = {
      camera: await checkMediaDevice('videoinput'),
      microphone: await checkMediaDevice('audioinput'),
      speakers: await checkMediaDevice('audiooutput'),
      webRTC: !!(window as any).RTCPeerConnection,
      mediaRecorder: !!(window as any).MediaRecorder
    };

    const network = {
      type: (navigator as any).connection?.type || 'unknown',
      effectiveType: (navigator as any).connection?.effectiveType,
      downlink: (navigator as any).connection?.downlink || 0,
      rtt: (navigator as any).connection?.rtt || 0,
      saveData: (navigator as any).connection?.saveData || false
    };

    return { screen, hardware, media, network };
  };

  const detectBrowserCapabilities = async (): Promise<BrowserCapabilities> => {
    const userAgent = navigator.userAgent;
    const name = getBrowserName(userAgent);
    const version = getBrowserVersion(userAgent);
    const engine = getBrowserEngine(userAgent);

    const features = {
      webGL: !!(window as any).WebGLRenderingContext,
      webGL2: !!(window as any).WebGL2RenderingContext,
      canvas: !!document.createElement('canvas').getContext,
      svg: !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect),
      video: await detectVideoFormats(),
      audio: await detectAudioFormats(),
      storage: {
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
        indexedDB: !!window.indexedDB,
        webSQL: !!(window as any).openDatabase
      },
      apis: {
        fetch: !!window.fetch,
        websocket: !!window.WebSocket,
        webWorker: !!window.Worker,
        serviceWorker: !!navigator.serviceWorker,
        intersectionObserver: !!(window as any).IntersectionObserver,
        mutationObserver: !!(window as any).MutationObserver
      }
    };

    return { name, version, engine, features };
  };

  const calculateFeatureMatrix = (device: DeviceCapabilities, browser: BrowserCapabilities): FeatureMatrix => {
    const matrix: FeatureMatrix = {
      videoGeneration: calculateVideoGenerationSupport(device, browser),
      audioProcessing: calculateAudioProcessingSupport(device, browser),
      imageEditing: calculateImageEditingSupport(device, browser),
      realTimeUpdates: calculateRealTimeSupport(device, browser),
      advancedAnalytics: calculateAnalyticsSupport(device, browser),
      offlineSupport: calculateOfflineSupport(device, browser),
      highQualityPlayback: calculatePlaybackSupport(device, browser),
      interactiveFeatures: calculateInteractiveSupport(device, browser)
    };

    return matrix;
  };

  // Helper functions for capability calculation
  const calculateVideoGenerationSupport = (device: DeviceCapabilities, browser: BrowserCapabilities): FeatureSupport => {
    let level: 'full' | 'partial' | 'none' = 'full';
    let confidence = 100;
    let reason = '';

    if (!browser.features.video.h264 && !browser.features.video.webm) {
      level = 'none';
      confidence = 0;
      reason = 'No video codec support';
    } else if (device.hardware.cores < 4 || device.hardware.memory < 4) {
      level = 'partial';
      confidence = 60;
      reason = 'Limited hardware capabilities';
    } else if (device.network.effectiveType === '2g' || device.network.effectiveType === 'slow-2g') {
      level = 'partial';
      confidence = 40;
      reason = 'Slow network connection';
    }

    return { level, confidence, reason };
  };

  const calculateAudioProcessingSupport = (device: DeviceCapabilities, browser: BrowserCapabilities): FeatureSupport => {
    let level: 'full' | 'partial' | 'none' = 'full';
    let confidence = 100;

    if (!browser.features.audio.webAudio) {
      level = 'partial';
      confidence = 60;
    } else if (!device.media.microphone) {
      level = 'partial';
      confidence = 70;
    }

    return { level, confidence };
  };

  const calculateImageEditingSupport = (device: DeviceCapabilities, browser: BrowserCapabilities): FeatureSupport => {
    let level: 'full' | 'partial' | 'none' = 'full';
    let confidence = 100;

    if (!browser.features.canvas) {
      level = 'none';
      confidence = 0;
    } else if (!browser.features.webGL) {
      level = 'partial';
      confidence = 60;
    }

    return { level, confidence };
  };

  const calculateRealTimeSupport = (device: DeviceCapabilities, browser: BrowserCapabilities): FeatureSupport => {
    let level: 'full' | 'partial' | 'none' = 'full';
    let confidence = 100;

    if (!browser.features.apis.websocket) {
      level = 'partial';
      confidence = 40;
    } else if (device.network.effectiveType === '2g' || device.network.effectiveType === 'slow-2g') {
      level = 'partial';
      confidence = 50;
    }

    return { level, confidence };
  };

  const calculateAnalyticsSupport = (device: DeviceCapabilities, browser: BrowserCapabilities): FeatureSupport => {
    let level: 'full' | 'partial' | 'none' = 'full';
    let confidence = 100;

    if (!browser.features.apis.intersectionObserver) {
      level = 'partial';
      confidence = 70;
    }

    return { level, confidence };
  };

  const calculateOfflineSupport = (device: DeviceCapabilities, browser: BrowserCapabilities): FeatureSupport => {
    let level: 'full' | 'partial' | 'none' = 'none';
    let confidence = 0;

    if (browser.features.apis.serviceWorker && browser.features.storage.indexedDB) {
      level = 'full';
      confidence = 90;
    } else if (browser.features.storage.localStorage) {
      level = 'partial';
      confidence = 50;
    }

    return { level, confidence };
  };

  const calculatePlaybackSupport = (device: DeviceCapabilities, browser: BrowserCapabilities): FeatureSupport => {
    let level: 'full' | 'partial' | 'none' = 'full';
    let confidence = 100;

    if (device.screen.pixelRatio < 2 || device.hardware.cores < 4) {
      level = 'partial';
      confidence = 60;
    } else if (device.network.effectiveType === '2g' || device.network.effectiveType === 'slow-2g') {
      level = 'partial';
      confidence = 40;
    }

    return { level, confidence };
  };

  const calculateInteractiveSupport = (device: DeviceCapabilities, browser: BrowserCapabilities): FeatureSupport => {
    let level: 'full' | 'partial' | 'none' = 'full';
    let confidence = 100;

    if (!browser.features.apis.mutationObserver || !browser.features.apis.intersectionObserver) {
      level = 'partial';
      confidence = 70;
    }

    return { level, confidence };
  };

  const isSupported = (feature: keyof FeatureMatrix): boolean => {
    return featureMatrix?.[feature]?.level !== 'none';
  };

  const getSupportLevel = (feature: keyof FeatureMatrix): 'full' | 'partial' | 'none' => {
    return featureMatrix?.[feature]?.level || 'none';
  };

  const value: FeatureDetectionContextValue = {
    deviceCapabilities,
    browserCapabilities,
    featureMatrix,
    isLoading,
    error,
    refresh: detectCapabilities,
    isSupported,
    getSupportLevel
  };

  return (
    <FeatureDetectionContext.Provider value={value}>
      {children}
    </FeatureDetectionContext.Provider>
  );
};

// Helper functions
const getStorageEstimate = async (): Promise<number> => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return Math.round((estimate.quota || 0) / (1024 * 1024 * 1024)); // Convert to GB
    }
  } catch (err) {
    console.warn('Storage estimate not available:', err);
  }
  return 0;
};

const getGPUInfo = async (): Promise<string> => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (err) {
    console.warn('GPU info not available:', err);
  }
  return 'Unknown';
};

const checkMediaDevice = async (kind: string): Promise<boolean> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === kind);
  } catch (err) {
    return false;
  }
};

const detectVideoFormats = async () => {
  const video = document.createElement('video');
  return {
    h264: video.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '',
    webm: video.canPlayType('video/webm; codecs="vp8"') !== '',
    av1: video.canPlayType('video/webm; codecs="av01.0.05M.08"') !== '',
    hls: video.canPlayType('application/vnd.apple.mpegurl') !== '',
    dash: video.canPlayType('application/dash+xml') !== ''
  };
};

const detectAudioFormats = async () => {
  const audio = document.createElement('audio');
  return {
    mp3: audio.canPlayType('audio/mp3') !== '',
    aac: audio.canPlayType('audio/aac') !== '',
    ogg: audio.canPlayType('audio/ogg') !== '',
    webAudio: !!(window as any).AudioContext || !!(window as any).webkitAudioContext
  };
};

const getBrowserName = (userAgent: string): string => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
};

const getBrowserVersion = (userAgent: string): string => {
  const match = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/([0-9.]+)/);
  return match ? match[2] : 'Unknown';
};

const getBrowserEngine = (userAgent: string): string => {
  if (userAgent.includes('WebKit')) return 'WebKit';
  if (userAgent.includes('Gecko')) return 'Gecko';
  if (userAgent.includes('Trident')) return 'Trident';
  return 'Unknown';
};

// Component for displaying feature detection results
interface FeatureDetectionDisplayProps {
  showDetails?: boolean;
  className?: string;
}

export const FeatureDetectionDisplay: React.FC<FeatureDetectionDisplayProps> = ({
  showDetails = false,
  className = ""
}) => {
  const { deviceCapabilities, browserCapabilities, featureMatrix, isLoading, error } = useFeatureDetection();

  if (isLoading) {
    return (
      <div className={`p-4 bg-gray-100 rounded-lg ${className}`}>
        <div className="flex items-center">
          <Monitor className="h-5 w-5 text-gray-500 mr-2 animate-pulse" />
          <span className="text-gray-600">Detecting device capabilities...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  const getSupportIcon = (level: 'full' | 'partial' | 'none') => {
    switch (level) {
      case 'full': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'none': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getSupportColor = (level: 'full' | 'partial' | 'none') => {
    switch (level) {
      case 'full': return 'text-green-700 bg-green-100';
      case 'partial': return 'text-yellow-700 bg-yellow-100';
      case 'none': return 'text-red-700 bg-red-100';
    }
  };

  return (
    <div className={className}>
      {/* Device Overview */}
      {deviceCapabilities && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Capabilities</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white border rounded-lg text-center">
              <Monitor className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-sm font-medium">{deviceCapabilities.screen.width}×{deviceCapabilities.screen.height}</div>
              <div className="text-xs text-gray-500">Screen Resolution</div>
            </div>
            <div className="p-3 bg-white border rounded-lg text-center">
              <Cpu className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-sm font-medium">{deviceCapabilities.hardware.cores} cores</div>
              <div className="text-xs text-gray-500">CPU Cores</div>
            </div>
            <div className="p-3 bg-white border rounded-lg text-center">
              <HardDrive className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-sm font-medium">{deviceCapabilities.hardware.memory}GB</div>
              <div className="text-xs text-gray-500">Memory</div>
            </div>
            <div className="p-3 bg-white border rounded-lg text-center">
              <Wifi className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-sm font-medium">{deviceCapabilities.network.effectiveType || 'Unknown'}</div>
              <div className="text-xs text-gray-500">Network</div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Matrix */}
      {featureMatrix && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Support Matrix</h3>
          <div className="space-y-2">
            {Object.entries(featureMatrix).map(([feature, support]) => (
              <div key={feature} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center">
                  {getSupportIcon(support.level)}
                  <span className="ml-3 font-medium text-gray-900 capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded ${getSupportColor(support.level)}`}>
                    {support.level.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">{support.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Information */}
      {showDetails && browserCapabilities && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Browser Details</h4>
          <div className="text-sm text-gray-600">
            <div>Browser: {browserCapabilities.name} {browserCapabilities.version}</div>
            <div>Engine: {browserCapabilities.engine}</div>
            <div>WebGL: {browserCapabilities.features.webGL ? 'Supported' : 'Not supported'}</div>
            <div>WebRTC: {deviceCapabilities?.media.webRTC ? 'Supported' : 'Not supported'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureDetectionDisplay;