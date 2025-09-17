import { 
  Linkedin, 
  Github, 
  Globe, 
  Twitter, 
  Edit, 
  Youtube, 
  Instagram, 
  Facebook
} from 'lucide-react';
import { SocialPlatform, SizeConfig } from './types';

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    name: 'LinkedIn',
    key: 'linkedin',
    icon: Linkedin,
    color: '#0077B5',
    darkColor: '#0A66C2',
    baseUrl: 'https://linkedin.com/in/',
    validator: (url) => /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\//.test(url)
  },
  {
    name: 'GitHub',
    key: 'github',
    icon: Github,
    color: '#181717',
    darkColor: '#f0f6fc',
    baseUrl: 'https://github.com/',
    validator: (url) => /^https?:\/\/(www\.)?github\.com\//.test(url)
  },
  {
    name: 'Portfolio',
    key: 'portfolio',
    icon: Globe,
    color: '#007ACC',
    darkColor: '#40A9FF',
    validator: (url) => /^https?:\/\/.+/.test(url)
  },
  {
    name: 'Twitter',
    key: 'twitter',
    icon: Twitter,
    color: '#1DA1F2',
    darkColor: '#1D9BF0',
    baseUrl: 'https://twitter.com/',
    validator: (url) => /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//.test(url)
  },
  {
    name: 'Medium',
    key: 'medium',
    icon: Edit,
    color: '#00AB6C',
    darkColor: '#1A8917',
    baseUrl: 'https://medium.com/@',
    validator: (url) => /^https?:\/\/(www\.)?medium\.com\/@/.test(url)
  },
  {
    name: 'YouTube',
    key: 'youtube',
    icon: Youtube,
    color: '#FF0000',
    darkColor: '#FF4444',
    baseUrl: 'https://youtube.com/c/',
    validator: (url) => /^https?:\/\/(www\.)?youtube\.com\/(c|channel|user)\//.test(url)
  },
  {
    name: 'Instagram',
    key: 'instagram',
    icon: Instagram,
    color: '#E4405F',
    darkColor: '#F77737',
    baseUrl: 'https://instagram.com/',
    validator: (url) => /^https?:\/\/(www\.)?instagram\.com\//.test(url)
  },
  {
    name: 'Facebook',
    key: 'facebook',
    icon: Facebook,
    color: '#1877F2',
    darkColor: '#4267B2',
    baseUrl: 'https://facebook.com/',
    validator: (url) => /^https?:\/\/(www\.)?facebook\.com\//.test(url)
  }
];

export const SIZE_CLASSES: Record<string, SizeConfig> = {
  small: {
    icon: 'w-4 h-4',
    container: 'p-2',
    text: 'text-xs',
    spacing: 'gap-1'
  },
  medium: {
    icon: 'w-5 h-5',
    container: 'p-3',
    text: 'text-sm',
    spacing: 'gap-2'
  },
  large: {
    icon: 'w-6 h-6',
    container: 'p-4',
    text: 'text-base',
    spacing: 'gap-3'
  }
};
