// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts
  format: ExportFormat;
  quality: ExportQuality;
  options: ExportFormatOptions;
  privacy: ExportPrivacySettings;
}

export type ExportFormat =
  | 'public-url'
  | 'pdf-document'
  | 'embed-widget'
  | 'qr-code'
  | 'social-image'
  | 'json-data';

export type ExportQuality = 'draft' | 'standard' | 'high' | 'print';

export interface ExportFormatOptions {
  publicUrl?: PublicUrlOptions;
  pdf?: PdfExportOptions;
  embed?: EmbedWidgetOptions;
  qr?: QrCodeOptions;
  social?: SocialImageOptions;
  json?: JsonExportOptions;
}

export interface PublicUrlOptions {
  customSlug?: string;
  customDomain?: string;
  seoOptimized: boolean;
  analyticsEnabled: boolean;
  socialSharingEnabled: boolean;
  contactFormEnabled: boolean;
}

export interface PdfExportOptions {
  format: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  includeImages: boolean;
  includeColors: boolean;
  optimizeForPrint: boolean;
  watermark?: string;
}

export interface EmbedWidgetOptions {
  width: number;
  height: number;
  responsive: boolean;
  showHeader: boolean;
  showFooter: boolean;
  theme: 'light' | 'dark' | 'auto';
  customCss?: string;
}

export interface QrCodeOptions {
  size: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  darkColor: string;
  lightColor: string;
  logoUrl?: string;
  logoSize?: number;
}

export interface SocialImageOptions {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'general';
  dimensions: {
    width: number;
    height: number;
  };
  includePhoto: boolean;
  backgroundStyle: 'gradient' | 'solid' | 'pattern' | 'image';
  textOverlay: boolean;
}

export interface JsonExportOptions {
  includeMetadata: boolean;
  includeAnalytics: boolean;
  compressData: boolean;
  formatVersion: string;
}

export interface ExportPrivacySettings {
  accessLevel: 'public' | 'unlisted' | 'private' | 'password';
  password?: string;
  allowedDomains?: string[];
  expirationDate?: Date;
  downloadEnabled: boolean;
  printEnabled: boolean;
  rightClickProtection: boolean;
  analyticsOptOut: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: {
    url?: string;
    embedCode?: string;
    downloadUrl?: string;
    qrCodeData?: string;
    metadata?: ExportMetadata;
  };
  errors?: string[];
  warnings?: string[];
}

export interface ExportMetadata {
  id: string;
  userId: string;
  profileId: string;
  format: ExportFormat;
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;
  lastAccessed?: Date;
  expiresAt?: Date;
  size: number;
  checksum: string;
}

export interface ExportAnalytics {
  views: number;
  uniqueVisitors: number;
  downloads: number;
  shares: number;
  averageViewTime: number;
  topReferrers: string[];
  deviceBreakdown: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  geographicData: {
    country: string;
    views: number;
  }[];
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  supportedFormats: ExportFormat[];
  preview: string;
  configuration: Partial<ExportConfiguration>;
  isPremium: boolean;
}