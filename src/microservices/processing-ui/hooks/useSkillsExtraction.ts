// Skills extraction hook for cv-processing-ui microservice
import { useState } from 'react';
import { createLogger } from '@cvplus/logging';
import { NotificationService } from '@/core-ui/services/NotificationService';
import type { Skill, SkillCategory, SkillLevel } from '../types/cv';

// Initialize logger for cv-processing-ui microservice
const logger = createLogger('cv-processing-ui:skills-extraction');

interface SkillsExtractionState {
  isExtracting: boolean;
  progress: number;
  currentStep: string;
  extractedSkills: ExtractedSkill[];
  error: string | null;
}

interface ExtractedSkill {
  name: string;
  category: SkillCategory;
  confidence: number; // 0-1
  sources: SkillSource[];
  suggestedLevel: SkillLevel;
  marketDemand: 'low' | 'medium' | 'high';
  relatedSkills: string[];
}

interface SkillSource {
  section: string; // 'experience', 'education', 'projects', etc.
  context: string; // The text where the skill was found
  relevance: number; // 0-1
}

interface SkillsExtractionOptions {
  targetRole?: string;
  targetIndustry?: string;
  includeRelatedSkills?: boolean;
  confidenceThreshold?: number; // Minimum confidence to include skill
  categorizeAutomatically?: boolean;
}

interface SkillInsight {
  missingSkills: string[];
  overrepresentedSkills: string[];
  recommendedSkills: string[];
  skillGaps: SkillGap[];
}

interface SkillGap {
  skill: string;
  category: SkillCategory;
  importance: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  learningResources?: string[];
}

// Mock skills database for demonstration
const SKILL_DATABASE = {
  technical: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL',
    'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git',
    'REST APIs', 'GraphQL', 'Machine Learning', 'Data Analysis', 'DevOps'
  ],
  soft: [
    'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Project Management',
    'Time Management', 'Critical Thinking', 'Adaptability', 'Creativity', 'Negotiation'
  ],
  language: [
    'English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Portuguese',
    'Italian', 'Russian', 'Arabic'
  ],
  certification: [
    'AWS Certified', 'Google Cloud Certified', 'Microsoft Certified', 'Cisco CCNA',
    'PMP', 'Scrum Master', 'Six Sigma', 'ITIL', 'CompTIA Security+'
  ]
};

export function useSkillsExtraction() {
  const [state, setState] = useState<SkillsExtractionState>({
    isExtracting: false,
    progress: 0,
    currentStep: '',
    extractedSkills: [],
    error: null
  });

  const extractSkills = async (
    cvContent: string,
    options: SkillsExtractionOptions = {}
  ): Promise<ExtractedSkill[]> => {
    try {
      setState(prev => ({
        ...prev,
        isExtracting: true,
        progress: 0,
        currentStep: 'Analyzing CV content...',
        error: null,
        extractedSkills: []
      }));

      logger.info('Starting skills extraction', {
        contentLength: cvContent.length,
        targetRole: options.targetRole,
        targetIndustry: options.targetIndustry
      });

      // Simulate extraction process
      await simulateExtractionSteps();

      // Mock skills extraction
      const extractedSkills = await performSkillsExtraction(cvContent, options);

      setState(prev => ({
        ...prev,
        isExtracting: false,
        progress: 100,
        currentStep: 'Extraction complete',
        extractedSkills
      }));

      NotificationService.success(
        `Extracted ${extractedSkills.length} skills from your CV`,
        { microservice: 'processing-ui' }
      );

      logger.info('Skills extraction completed', {
        extractedCount: extractedSkills.length,
        avgConfidence: extractedSkills.reduce((sum, skill) => sum + skill.confidence, 0) / extractedSkills.length
      });

      return extractedSkills;
    } catch (error) {
      logger.error('Skills extraction failed', error);
      setState(prev => ({
        ...prev,
        isExtracting: false,
        progress: 0,
        currentStep: '',
        error: error instanceof Error ? error.message : 'Extraction failed'
      }));
      throw error;
    }
  };

  const simulateExtractionSteps = async (): Promise<void> => {
    const steps = [
      { step: 'Analyzing CV content...', duration: 1000 },
      { step: 'Identifying skill mentions...', duration: 1500 },
      { step: 'Categorizing detected skills...', duration: 1200 },
      { step: 'Validating skill relevance...', duration: 800 },
      { step: 'Calculating confidence scores...', duration: 600 },
      { step: 'Finding related skills...', duration: 1000 },
      { step: 'Generating recommendations...', duration: 400 }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      setState(prev => ({
        ...prev,
        progress: Math.round((i / steps.length) * 100),
        currentStep: step.step
      }));

      await new Promise(resolve => setTimeout(resolve, step.duration));
    }
  };

  const performSkillsExtraction = async (
    content: string,
    options: SkillsExtractionOptions
  ): Promise<ExtractedSkill[]> => {
    const extractedSkills: ExtractedSkill[] = [];
    const contentLower = content.toLowerCase();

    // Extract technical skills
    SKILL_DATABASE.technical.forEach(skill => {
      if (contentLower.includes(skill.toLowerCase())) {
        const confidence = Math.random() * 0.4 + 0.6; // 0.6-1.0
        if (confidence >= (options.confidenceThreshold || 0.5)) {
          extractedSkills.push({
            name: skill,
            category: 'technical',
            confidence,
            sources: [
              {
                section: 'experience',
                context: `Found mention of ${skill} in work experience`,
                relevance: confidence
              }
            ],
            suggestedLevel: getRandomSkillLevel(),
            marketDemand: getRandomMarketDemand(),
            relatedSkills: getRelatedSkills(skill, 'technical')
          });
        }
      }
    });

    // Extract soft skills
    SKILL_DATABASE.soft.forEach(skill => {
      if (contentLower.includes(skill.toLowerCase())) {
        const confidence = Math.random() * 0.3 + 0.5; // 0.5-0.8
        if (confidence >= (options.confidenceThreshold || 0.5)) {
          extractedSkills.push({
            name: skill,
            category: 'soft',
            confidence,
            sources: [
              {
                section: 'summary',
                context: `Found mention of ${skill} in professional summary`,
                relevance: confidence
              }
            ],
            suggestedLevel: getRandomSkillLevel(),
            marketDemand: getRandomMarketDemand(),
            relatedSkills: getRelatedSkills(skill, 'soft')
          });
        }
      }
    });

    // Sort by confidence
    return extractedSkills.sort((a, b) => b.confidence - a.confidence);
  };

  const getRandomSkillLevel = (): SkillLevel => {
    const levels: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    return levels[Math.floor(Math.random() * levels.length)];
  };

  const getRandomMarketDemand = (): 'low' | 'medium' | 'high' => {
    const demands = ['low', 'medium', 'high'] as const;
    return demands[Math.floor(Math.random() * demands.length)];
  };

  const getRelatedSkills = (skill: string, category: SkillCategory): string[] => {
    const relatedSkillsMap: Record<string, string[]> = {
      'JavaScript': ['TypeScript', 'React', 'Node.js', 'HTML', 'CSS'],
      'React': ['JavaScript', 'Redux', 'Next.js', 'HTML', 'CSS'],
      'Python': ['Django', 'Flask', 'Machine Learning', 'Data Analysis'],
      'Leadership': ['Management', 'Team Building', 'Strategic Planning'],
      'Project Management': ['Agile', 'Scrum', 'Planning', 'Organization']
    };

    return relatedSkillsMap[skill] || [];
  };

  const analyzeSkillGaps = (
    currentSkills: ExtractedSkill[],
    targetRole?: string
  ): SkillInsight => {
    // Mock skill gap analysis
    const insight: SkillInsight = {
      missingSkills: ['Docker', 'Kubernetes', 'AWS'],
      overrepresentedSkills: [],
      recommendedSkills: ['TypeScript', 'React Native', 'GraphQL'],
      skillGaps: [
        {
          skill: 'Cloud Computing',
          category: 'technical',
          importance: 'high',
          description: 'Cloud skills are essential for modern development roles',
          learningResources: ['AWS Training', 'Cloud Certification Courses']
        },
        {
          skill: 'DevOps',
          category: 'technical',
          importance: 'medium',
          description: 'DevOps knowledge improves deployment and collaboration',
          learningResources: ['Docker Documentation', 'Kubernetes Tutorials']
        }
      ]
    };

    return insight;
  };

  const categorizeSkills = (skills: string[]): Record<SkillCategory, string[]> => {
    const categorized: Record<SkillCategory, string[]> = {
      technical: [],
      soft: [],
      language: [],
      certification: [],
      other: []
    };

    skills.forEach(skill => {
      const skillLower = skill.toLowerCase();

      if (SKILL_DATABASE.technical.some(s => s.toLowerCase() === skillLower)) {
        categorized.technical.push(skill);
      } else if (SKILL_DATABASE.soft.some(s => s.toLowerCase() === skillLower)) {
        categorized.soft.push(skill);
      } else if (SKILL_DATABASE.language.some(s => s.toLowerCase() === skillLower)) {
        categorized.language.push(skill);
      } else if (SKILL_DATABASE.certification.some(s => s.toLowerCase().includes(skillLower))) {
        categorized.certification.push(skill);
      } else {
        categorized.other.push(skill);
      }
    });

    return categorized;
  };

  const convertToSkills = (extractedSkills: ExtractedSkill[]): Skill[] => {
    return extractedSkills.map((extracted, index) => ({
      id: `skill_${Date.now()}_${index}`,
      name: extracted.name,
      category: extracted.category,
      level: extracted.suggestedLevel,
      verified: false,
      yearsOfExperience: Math.floor(Math.random() * 5) + 1,
      lastUsed: new Date()
    }));
  };

  const clearResults = (): void => {
    setState(prev => ({
      ...prev,
      extractedSkills: [],
      error: null,
      progress: 0,
      currentStep: ''
    }));
    logger.info('Skills extraction results cleared');
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  const cancelExtraction = (): void => {
    setState(prev => ({
      ...prev,
      isExtracting: false,
      progress: 0,
      currentStep: ''
    }));
    logger.info('Skills extraction cancelled');
  };

  return {
    // State
    isExtracting: state.isExtracting,
    progress: state.progress,
    currentStep: state.currentStep,
    extractedSkills: state.extractedSkills,
    error: state.error,

    // Actions
    extractSkills,
    analyzeSkillGaps,
    categorizeSkills,
    convertToSkills,
    clearResults,
    clearError,
    cancelExtraction
  };
}