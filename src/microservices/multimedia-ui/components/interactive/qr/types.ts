// @ts-ignore - Export conflictsexport interface QRCodeTemplate {
  id: string;
  name: string;
  description: string;
  style: {
    foregroundColor: string;
    backgroundColor: string;
    logoUrl?: string;
    margin: number;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    width: number;
    borderRadius?: number;
    gradientType?: 'linear' | 'radial' | 'none';
    gradientColors?: string[];
  };
  frame?: {
    type: 'none' | 'square' | 'circle' | 'rounded';
    color: string;
    width: number;
  };
  callToAction?: {
    text: string;
    position: 'top' | 'bottom' | 'overlay';
    font: string;
    color: string;
  };
}

export interface QRCodeConfig {
  id: string;
  jobId: string;
  type: 'profile' | 'contact' | 'portfolio' | 'resume-download' | 'linkedin' | 'custom' | 'portal-primary' | 'portal-chat' | 'portal-contact' | 'portal-download' | 'portal-menu';
  data: string;
  template: QRCodeTemplate;
  qrImageUrl?: string;
  analytics: {
    totalScans: number;
    uniqueScans: number;
    scansByDate: Record<string, number>;
    scansByLocation: Record<string, number>;
    scansByDevice: Record<string, number>;
    scansBySource: Record<string, number>;
  };
  metadata: {
    title: string;
    description: string;
    tags: string[];
    expiresAt?: Date;
    isActive: boolean;
    trackingEnabled: boolean;
  };
  advanced: {
    dynamicContent: boolean;
    redirectUrl?: string;
    shortUrl?: string;
    passwordProtected: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface QRCodeCustomization {
  size?: number;
  style?: 'square' | 'rounded' | 'circular';
  logoUrl?: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

export interface QRCodeOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface QRCodeAnalytics {
  totalScans: number;
  uniqueScans: number;
  scansByDate: Record<string, number>;
  scansByDevice: Record<string, number>;
  lastScanned?: Date;
}

export interface EnhancedQRCodeData {
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

export interface QRCodeProps {
  jobId: string;
  profileId?: string;
  isEnabled?: boolean;
  data?: {
    url: string;
    profileUrl?: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
  } | null;
  enhancedData?: EnhancedQRCodeData | null;
  customization?: QRCodeCustomization;
  onUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  mode?: 'private' | 'public';
}