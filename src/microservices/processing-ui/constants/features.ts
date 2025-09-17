// @ts-ignore
/**
 * CV Processing Feature Definitions
 *
 * Defines all available CV processing features with their metadata
 *
 * @author Gil Klainert
 * @version 3.0.0 - Enhanced T063 Implementation
  */

import {
  Target,
  Brain,
  Users,
  Sparkles,
  Video,
  Briefcase,
  BarChart3,
  Shield
} from 'lucide-react';
import type { CVProcessingFeature } from '../types/upload';

export const DEFAULT_FEATURES: CVProcessingFeature[] = [
  {
    id: 'ats-optimization',
    name: 'ATS Optimization',
    description: 'Optimize your CV for Applicant Tracking Systems with keyword analysis and formatting improvements.',
    icon: Target,
    enabled: true,
    estimatedTime: 15
  },
  {
    id: 'skills-analysis',
    name: 'Skills Analysis',
    description: 'AI-powered analysis and categorization of your technical and soft skills.',
    icon: Brain,
    enabled: true,
    estimatedTime: 10
  },
  {
    id: 'personality-insights',
    name: 'Personality Insights',
    description: 'Generate personality insights and professional traits based on your CV content.',
    icon: Users,
    enabled: false,
    premium: true,
    estimatedTime: 20
  },
  {
    id: 'content-enhancement',
    name: 'Content Enhancement',
    description: 'AI-powered suggestions to improve CV content, wording, and structure.',
    icon: Sparkles,
    enabled: true,
    estimatedTime: 12
  },
  {
    id: 'multimedia-generation',
    name: 'Multimedia Generation',
    description: 'Generate AI-powered podcast summaries and video introductions.',
    icon: Video,
    enabled: false,
    premium: true,
    estimatedTime: 30
  },
  {
    id: 'industry-alignment',
    name: 'Industry Alignment',
    description: 'Analyze how well your CV aligns with specific industry standards and expectations.',
    icon: Briefcase,
    enabled: false,
    estimatedTime: 8
  },
  {
    id: 'competitive-analysis',
    name: 'Competitive Analysis',
    description: 'Compare your CV against industry benchmarks and similar profiles.',
    icon: BarChart3,
    enabled: false,
    premium: true,
    estimatedTime: 18
  },
  {
    id: 'privacy-scan',
    name: 'Privacy & Security Scan',
    description: 'Scan for sensitive information and provide privacy recommendations.',
    icon: Shield,
    enabled: true,
    estimatedTime: 5
  }
];

export const DEFAULT_SELECTED_FEATURES = [
  'ats-optimization',
  'skills-analysis',
  'content-enhancement',
  'privacy-scan'
];