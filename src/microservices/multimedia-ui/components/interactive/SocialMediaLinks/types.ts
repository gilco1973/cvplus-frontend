import { CVFeatureProps, SocialLinksData } from '../../../../types/cv-features';

export interface SocialLinksProps extends CVFeatureProps {
  data: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
    medium?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
  };
  customization?: {
    style?: 'icons' | 'buttons' | 'cards';
    size?: 'small' | 'medium' | 'large';
    showLabels?: boolean;
    openInNewTab?: boolean;
    theme?: 'dark' | 'light' | 'colorful';
    animateHover?: boolean;
  };
}

export interface SocialLinkAnalytics {
  platform: string;
  clicks: number;
  uniqueClicks: number;
  lastClicked?: Date;
  conversionRate?: number;
}

export interface LinkValidationResult {
  url: string;
  isValid: boolean;
  isReachable: boolean;
  responseTime?: number;
  statusCode?: number;
  error?: string;
}

export interface SocialPlatform {
  name: string;
  key: keyof SocialLinksData;
  icon: React.ComponentType<any>;
  color: string;
  darkColor: string;
  baseUrl?: string;
  validator?: (url: string) => boolean;
}

export interface SizeConfig {
  icon: string;
  container: string;
  text: string;
  spacing: string;
}
