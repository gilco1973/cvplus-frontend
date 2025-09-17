/**
 * Mock data for role detection tests
 */

import type {
  RoleProfileAnalysis,
  RoleMatchResult,
  DetectedRole
} from '../types/role-profiles';

export const mockDetectedRoles: DetectedRole[] = [
  {
    roleId: 'frontend_engineer',
    roleName: 'Frontend Engineer',
    confidence: 0.85,
    matchingFactors: [
      {
        type: 'skills',
        score: 0.9,
        weight: 0.3,
        matchedKeywords: ['React', 'JavaScript', 'CSS'],
        details: 'Strong frontend technology alignment',
        reasoning: {
          contributionExplanation: 'Technical skills show excellent alignment with frontend requirements',
          keywordMatches: [
            { keyword: 'React', found: true, matchType: 'exact', relevance: 0.95 },
            { keyword: 'JavaScript', found: true, matchType: 'exact', relevance: 0.9 },
            { keyword: 'CSS', found: true, matchType: 'exact', relevance: 0.85 }
          ],
          strengthAssessment: 'excellent',
          improvementSuggestions: ['Consider learning TypeScript', 'Add more modern frameworks'],
          confidenceFactors: ['Years of React experience', 'Strong JavaScript foundation']
        }
      }
    ],
    enhancementPotential: 75,
    recommendations: [
      'Enhance TypeScript skills',
      'Add modern frontend frameworks',
      'Improve UI/UX design skills'
    ],
    scoringReasoning: 'Strong match based on extensive frontend development experience with React and JavaScript. Excellent technical skill alignment and relevant project experience.',
    fitAnalysis: {
      strengths: [
        'Extensive React experience',
        'Strong JavaScript foundation',
        'Modern development practices',
        'Component-based architecture expertise'
      ],
      gaps: [
        'TypeScript proficiency could be enhanced',
        'UI/UX design skills need development',
        'Testing frameworks experience limited'
      ],
      overallAssessment: 'Excellent candidate for frontend engineering roles with strong technical foundation and relevant experience. Minor gaps in modern tooling can be easily addressed.'
    }
  },
  {
    roleId: 'fullstack_developer',
    roleName: 'Full Stack Developer',
    confidence: 0.78,
    matchingFactors: [
      {
        type: 'experience',
        score: 0.8,
        weight: 0.2,
        matchedKeywords: ['Full Stack', 'Node.js', 'Database'],
        details: 'Good full-stack development background',
        reasoning: {
          contributionExplanation: 'Experience shows both frontend and backend development capabilities',
          keywordMatches: [
            { keyword: 'Full Stack', found: true, matchType: 'exact', relevance: 0.9 },
            { keyword: 'Node.js', found: true, matchType: 'exact', relevance: 0.8 },
            { keyword: 'Database', found: true, matchType: 'fuzzy', relevance: 0.7 }
          ],
          strengthAssessment: 'good',
          improvementSuggestions: ['Strengthen backend architecture skills', 'Add cloud deployment experience'],
          confidenceFactors: ['Full-stack project experience', 'Both frontend and backend skills']
        }
      }
    ],
    enhancementPotential: 65,
    recommendations: [
      'Strengthen backend architecture',
      'Add cloud platform experience',
      'Improve database design skills'
    ],
    scoringReasoning: 'Good full-stack development potential with solid frontend skills and some backend experience. Would benefit from deeper backend architecture knowledge.',
    fitAnalysis: {
      strengths: [
        'Full-stack project experience',
        'Frontend and backend familiarity',
        'Modern JavaScript ecosystem knowledge'
      ],
      gaps: [
        'Backend architecture design',
        'Database optimization skills',
        'Cloud deployment experience'
      ],
      overallAssessment: 'Solid candidate for full-stack roles with room for growth in backend specialization and system architecture.'
    }
  },
  {
    roleId: 'software_engineer',
    roleName: 'Software Engineer',
    confidence: 0.72,
    matchingFactors: [
      {
        type: 'title',
        score: 0.9,
        weight: 0.4,
        matchedKeywords: ['Software Engineer', 'Developer'],
        details: 'Direct title match with software engineering roles',
        reasoning: {
          contributionExplanation: 'Job titles directly align with software engineering positions',
          keywordMatches: [
            { keyword: 'Software Engineer', found: true, matchType: 'exact', relevance: 0.95 },
            { keyword: 'Developer', found: true, matchType: 'exact', relevance: 0.85 }
          ],
          strengthAssessment: 'excellent',
          improvementSuggestions: ['Broaden technology stack', 'Add system design experience'],
          confidenceFactors: ['Direct role title match', 'Relevant job experience']
        }
      }
    ],
    enhancementPotential: 60,
    recommendations: [
      'Expand technology stack',
      'Add system design skills',
      'Improve software architecture knowledge'
    ],
    scoringReasoning: 'Strong general software engineering match with relevant experience and transferable skills across multiple technology areas.',
    fitAnalysis: {
      strengths: [
        'General software development experience',
        'Multiple programming languages',
        'Problem-solving capabilities'
      ],
      gaps: [
        'Specialized domain expertise',
        'System architecture design',
        'Large-scale system experience'
      ],
      overallAssessment: 'Good general software engineering candidate with broad skills that can be specialized based on specific role requirements.'
    }
  }
];

export const mockJobAnalysis: RoleProfileAnalysis = {
  primaryRole: mockDetectedRoles[0],
  alternativeRoles: mockDetectedRoles.slice(1),
  overallConfidence: 0.78,
  enhancementSuggestions: {
    immediate: [
      {
        id: 'enhance-typescript',
        title: 'Enhance TypeScript Skills',
        description: 'Add TypeScript proficiency to strengthen frontend development capabilities',
        section: 'skills',
        type: 'skill',
        priority: 'high',
        estimatedScoreImprovement: 15,
        currentValue: 'JavaScript proficiency',
        suggestedValue: 'TypeScript + JavaScript expertise',
        reasoning: 'TypeScript is increasingly important for large-scale frontend applications'
      },
      {
        id: 'add-testing',
        title: 'Add Testing Framework Experience',
        description: 'Include experience with modern testing frameworks like Jest, Vitest, or Cypress',
        section: 'skills',
        type: 'skill',
        priority: 'high',
        estimatedScoreImprovement: 12,
        currentValue: 'Limited testing experience',
        suggestedValue: 'Comprehensive testing suite experience',
        reasoning: 'Testing is crucial for maintainable frontend applications'
      },
      {
        id: 'ui-ux-skills',
        title: 'Develop UI/UX Design Skills',
        description: 'Add design system knowledge and user experience principles',
        section: 'skills',
        type: 'skill',
        priority: 'high',
        estimatedScoreImprovement: 10,
        currentValue: 'Basic UI implementation',
        suggestedValue: 'UI/UX design and implementation',
        reasoning: 'Modern frontend roles require understanding of design principles'
      }
    ],
    strategic: [
      {
        id: 'cloud-deployment',
        title: 'Add Cloud Platform Experience',
        description: 'Gain experience with AWS, Azure, or Google Cloud deployment',
        section: 'experience',
        type: 'experience',
        priority: 'medium',
        estimatedScoreImprovement: 8,
        currentValue: 'Local development focus',
        suggestedValue: 'Full-stack deployment experience',
        reasoning: 'Cloud deployment skills are valuable for full-stack growth'
      },
      {
        id: 'system-architecture',
        title: 'Learn System Architecture',
        description: 'Understand large-scale system design and architecture patterns',
        section: 'knowledge',
        type: 'knowledge',
        priority: 'medium',
        estimatedScoreImprovement: 12,
        currentValue: 'Component-level architecture',
        suggestedValue: 'System-level architecture understanding',
        reasoning: 'Architecture knowledge enables senior-level contributions'
      }
    ]
  },
  gapAnalysis: {
    missingSkills: [
      'TypeScript proficiency',
      'Advanced testing frameworks',
      'UI/UX design principles',
      'System architecture'
    ],
    weakAreas: [
      'Backend development depth',
      'Database optimization',
      'Cloud platform deployment',
      'Performance optimization'
    ],
    strengthAreas: [
      'React development',
      'JavaScript proficiency',
      'Frontend best practices',
      'Component architecture',
      'Modern development workflow'
    ]
  },
  scoringBreakdown: {
    totalRolesAnalyzed: 3,
    adjustedThreshold: 0.5,
    originalThreshold: 0.5,
    averageConfidence: 0.78,
    topFactors: [
      {
        factor: 'Frontend Technology Stack',
        contribution: 0.85,
        explanation: 'Strong React and JavaScript skills align perfectly with frontend engineering requirements'
      },
      {
        factor: 'Full-Stack Potential',
        contribution: 0.78,
        explanation: 'Good foundation for full-stack development with room for backend growth'
      },
      {
        factor: 'General Engineering Skills',
        contribution: 0.72,
        explanation: 'Solid software engineering foundation applicable across multiple domains'
      }
    ]
  },
  detectionMetadata: {
    processingTime: Date.now(),
    algorithmVersion: 'enhanced-opus-4.1',
    adjustmentsMade: [
      'Dynamic threshold adjustment for minimum 3 roles',
      'Enhanced reasoning with detailed gap analysis',
      'Comprehensive skill matching algorithm'
    ],
    confidenceDistribution: [
      { range: '80-100%', count: 1 },
      { range: '60-79%', count: 2 },
      { range: '40-59%', count: 0 },
      { range: '0-39%', count: 0 }
    ]
  }
};

export const mockRoleMatchResults: RoleMatchResult[] = mockDetectedRoles;

// Utility functions for tests
export const createMockDetectedRole = (overrides: Partial<DetectedRole> = {}): DetectedRole => ({
  ...mockDetectedRoles[0],
  ...overrides
});

export const createMockRoleAnalysis = (overrides: Partial<RoleProfileAnalysis> = {}): RoleProfileAnalysis => ({
  ...mockJobAnalysis,
  ...overrides
});

// Mock API responses
export const mockApiResponses = {
  detectRoleProfile: {
    success: true,
    data: {
      analysis: mockJobAnalysis,
      detectedRole: mockDetectedRoles[0],
      alternativeRoles: mockDetectedRoles.slice(1),
      metadata: {
        model: 'claude-opus-4-1-20250805',
        totalRoles: mockDetectedRoles.length,
        enhancedReasoning: true
      },
      cached: false,
      generatedAt: new Date().toISOString()
    }
  },
  getRoleRecommendations: [
    {
      id: 'rec-typescript',
      title: 'Enhance TypeScript Skills',
      description: 'Add TypeScript proficiency to strengthen your frontend development capabilities',
      section: 'skills',
      type: 'enhancement',
      priority: 'high',
      estimatedScoreImprovement: 15,
      roleSpecific: true,
      roleProfileId: 'frontend_engineer',
      reasoning: 'TypeScript is increasingly important for large-scale frontend applications and will significantly improve your marketability'
    },
    {
      id: 'rec-testing',
      title: 'Add Testing Framework Experience', 
      description: 'Include experience with modern testing frameworks like Jest, Vitest, or Cypress',
      section: 'skills',
      type: 'enhancement',
      priority: 'high',
      estimatedScoreImprovement: 12,
      roleSpecific: true,
      roleProfileId: 'frontend_engineer',
      reasoning: 'Testing skills are crucial for maintaining high-quality frontend applications and are expected by most employers'
    }
  ],
  getRoleProfiles: {
    success: true,
    data: {
      profiles: [
        {
          id: 'frontend_engineer',
          name: 'Frontend Engineer',
          category: 'engineering',
          description: 'Specialized in user interface development and user experience',
          keywords: ['React', 'JavaScript', 'CSS', 'HTML', 'Frontend'],
          requiredSkills: ['React', 'JavaScript', 'CSS', 'HTML'],
          preferredSkills: ['TypeScript', 'Next.js', 'Tailwind CSS'],
          experienceLevel: 'mid',
          industryFocus: ['technology', 'software']
        }
      ]
    }
  }
};