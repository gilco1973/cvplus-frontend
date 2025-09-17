/**
 * Professional CV Template Specifications
 * Complete template definitions for CVPlus professional CV generation system
 * Industry-optimized templates with comprehensive styling and feature specifications
 */

import type {
  CVTemplate,
  TemplateId,
  TemplateCategory,
  ExperienceLevel,
  ColorPalette,
  TypographySystem,
  SpacingSystem,
  LayoutConfiguration,
  FeatureSpecification,
  StylingSystem,
  ATSCompatibility
,
  INDUSTRY_COLOR_SCHEMES,
  PROFESSIONAL_TYPOGRAPHY
} from '../types/cv-templates';
import type { CVParsedData } from '../types/cvData';

// ============================================================================
// SPACING SYSTEM DEFINITIONS
// ============================================================================

const createSpacingSystem = (): SpacingSystem => ({
  base: '4px',
  scale: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '48px'
  },
  sections: {
    header: { padding: '24px', margin: '0 0 32px 0' },
    content: { padding: '16px', margin: '0 0 24px 0' },
    footer: { padding: '16px', margin: '32px 0 0 0' }
  }
});

// ============================================================================
// LAYOUT CONFIGURATIONS BY CATEGORY
// ============================================================================

const createExecutiveLayout = (): LayoutConfiguration => ({
  grid: {
    columns: 12,
    gap: '24px',
    maxWidth: '1200px',
    margins: {
      mobile: '16px',
      tablet: '24px',
      desktop: '32px'
    }
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
    print: 'print'
  },
  sections: {
    personalInfo: {
      order: 1,
      span: { mobile: 12, tablet: 12, desktop: 12 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    summary: {
      order: 2,
      span: { mobile: 12, tablet: 12, desktop: 8 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    experience: {
      order: 3,
      span: { mobile: 12, tablet: 12, desktop: 8 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    skills: {
      order: 6,
      span: { mobile: 12, tablet: 6, desktop: 4 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    education: {
      order: 4,
      span: { mobile: 12, tablet: 12, desktop: 8 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    certifications: {
      order: 7,
      span: { mobile: 12, tablet: 6, desktop: 4 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    projects: {
      order: 8,
      span: { mobile: 12, tablet: 12, desktop: 8 },
      visibility: { mobile: false, tablet: true, desktop: true, print: true }
    },
    languages: {
      order: 9,
      span: { mobile: 12, tablet: 6, desktop: 4 },
      visibility: { mobile: true, tablet: true, desktop: true, print: false }
    },
    awards: {
      order: 5,
      span: { mobile: 12, tablet: 12, desktop: 8 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    customSections: {
      order: 10,
      span: { mobile: 12, tablet: 12, desktop: 12 },
      visibility: { mobile: true, tablet: true, desktop: true, print: false }
    }
  },
  header: {
    height: '120px',
    sticky: false,
    background: 'transparent'
  },
  footer: {
    height: '60px',
    content: 'minimal'
  }
});

const createTechnicalLayout = (): LayoutConfiguration => ({
  grid: {
    columns: 12,
    gap: '20px',
    maxWidth: '1100px',
    margins: {
      mobile: '16px',
      tablet: '20px',
      desktop: '24px'
    }
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1100px',
    print: 'print'
  },
  sections: {
    personalInfo: {
      order: 1,
      span: { mobile: 12, tablet: 8, desktop: 8 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    skills: {
      order: 2,
      span: { mobile: 12, tablet: 4, desktop: 4 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    summary: {
      order: 3,
      span: { mobile: 12, tablet: 12, desktop: 8 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    experience: {
      order: 4,
      span: { mobile: 12, tablet: 12, desktop: 8 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    projects: {
      order: 5,
      span: { mobile: 12, tablet: 12, desktop: 8 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    education: {
      order: 6,
      span: { mobile: 12, tablet: 6, desktop: 4 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    certifications: {
      order: 7,
      span: { mobile: 12, tablet: 6, desktop: 4 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    languages: {
      order: 8,
      span: { mobile: 12, tablet: 6, desktop: 4 },
      visibility: { mobile: true, tablet: true, desktop: true, print: false }
    },
    awards: {
      order: 9,
      span: { mobile: 12, tablet: 12, desktop: 8 },
      visibility: { mobile: false, tablet: true, desktop: true, print: true }
    },
    customSections: {
      order: 10,
      span: { mobile: 12, tablet: 12, desktop: 12 },
      visibility: { mobile: true, tablet: true, desktop: true, print: false }
    }
  },
  header: {
    height: '100px',
    sticky: false,
    background: 'transparent'
  },
  footer: {
    height: '40px',
    content: 'minimal'
  }
});

const createCreativeLayout = (): LayoutConfiguration => ({
  grid: {
    columns: 12,
    gap: '28px',
    maxWidth: '1300px',
    margins: {
      mobile: '20px',
      tablet: '28px',
      desktop: '40px'
    }
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1300px',
    print: 'print'
  },
  sections: {
    personalInfo: {
      order: 1,
      span: { mobile: 12, tablet: 6, desktop: 6 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    summary: {
      order: 2,
      span: { mobile: 12, tablet: 6, desktop: 6 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    projects: {
      order: 3,
      span: { mobile: 12, tablet: 12, desktop: 8 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    skills: {
      order: 6,
      span: { mobile: 12, tablet: 6, desktop: 4 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    experience: {
      order: 4,
      span: { mobile: 12, tablet: 12, desktop: 8 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    education: {
      order: 7,
      span: { mobile: 12, tablet: 6, desktop: 4 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    certifications: {
      order: 8,
      span: { mobile: 12, tablet: 6, desktop: 4 },
      visibility: { mobile: true, tablet: true, desktop: true, print: false }
    },
    awards: {
      order: 5,
      span: { mobile: 12, tablet: 12, desktop: 8 },
      visibility: { mobile: true, tablet: true, desktop: true, print: true }
    },
    languages: {
      order: 9,
      span: { mobile: 12, tablet: 6, desktop: 4 },
      visibility: { mobile: false, tablet: true, desktop: true, print: false }
    },
    customSections: {
      order: 10,
      span: { mobile: 12, tablet: 12, desktop: 12 },
      visibility: { mobile: true, tablet: true, desktop: true, print: false }
    }
  },
  header: {
    height: '140px',
    sticky: false,
    background: 'linear-gradient(135deg, #805ad5, #ed8936)'
  },
  footer: {
    height: '80px',
    content: 'extended'
  }
});

// ============================================================================
// FEATURE SPECIFICATIONS BY CATEGORY
// ============================================================================

const createExecutiveFeatures = (): FeatureSpecification => ({
  skills: {
    type: 'bars',
    showLevels: true,
    groupByCategory: true,
    maxItems: 12,
    animation: 'slide'
  },
  experience: {
    layout: 'timeline',
    showDuration: true,
    showLocation: true,
    showAchievements: true,
    showTechnologies: false,
    dateFormat: 'full',
    sortOrder: 'reverse-chronological'
  },
  contact: {
    layout: 'horizontal',
    showIcons: true,
    clickableLinks: true,
    showQRCode: false,
    socialLinksStyle: 'icons'
  },
  interactivity: {
    expandableSections: true,
    hoverEffects: true,
    smoothScrolling: true,
    printOptimization: true
  },
  accessibility: {
    highContrast: true,
    focusIndicators: true,
    screenReaderOptimized: true,
    keyboardNavigation: true
  }
});

const createTechnicalFeatures = (): FeatureSpecification => ({
  skills: {
    type: 'tags',
    showLevels: true,
    groupByCategory: true,
    maxItems: 20,
    animation: 'fade'
  },
  experience: {
    layout: 'cards',
    showDuration: true,
    showLocation: true,
    showAchievements: true,
    showTechnologies: true,
    dateFormat: 'short',
    sortOrder: 'reverse-chronological'
  },
  contact: {
    layout: 'vertical',
    showIcons: true,
    clickableLinks: true,
    showQRCode: true,
    socialLinksStyle: 'buttons'
  },
  interactivity: {
    expandableSections: true,
    hoverEffects: true,
    smoothScrolling: true,
    printOptimization: true
  },
  accessibility: {
    highContrast: true,
    focusIndicators: true,
    screenReaderOptimized: true,
    keyboardNavigation: true
  }
});

const createCreativeFeatures = (): FeatureSpecification => ({
  skills: {
    type: 'circles',
    showLevels: true,
    groupByCategory: false,
    maxItems: 16,
    animation: 'scale'
  },
  experience: {
    layout: 'timeline',
    showDuration: true,
    showLocation: false,
    showAchievements: true,
    showTechnologies: false,
    dateFormat: 'year-only',
    sortOrder: 'reverse-chronological'
  },
  contact: {
    layout: 'grid',
    showIcons: true,
    clickableLinks: true,
    showQRCode: false,
    socialLinksStyle: 'icons'
  },
  interactivity: {
    expandableSections: true,
    hoverEffects: true,
    smoothScrolling: true,
    printOptimization: true
  },
  accessibility: {
    highContrast: false,
    focusIndicators: true,
    screenReaderOptimized: true,
    keyboardNavigation: true
  }
});

// ============================================================================
// STYLING SYSTEMS BY CATEGORY
// ============================================================================

const createExecutiveStyling = (): StylingSystem => ({
  components: {
    cards: {
      borderRadius: '12px',
      shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      background: '#ffffff',
      hover: {
        shadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-2px)',
        transition: { duration: '0.3s', easing: 'ease-out' }
      }
    },
    buttons: {
      primary: {
        background: '#1a365d',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '1rem',
        fontWeight: 600,
        hover: {
          background: '#2c5282',
          transform: 'translateY(-1px)'
        }
      },
      secondary: {
        background: 'transparent',
        color: '#1a365d',
        border: '2px solid #1a365d',
        borderRadius: '8px',
        padding: '10px 22px',
        fontSize: '1rem',
        fontWeight: 500,
        hover: {
          background: '#1a365d',
          transform: 'scale(1.02)'
        }
      }
    },
    inputs: {
      borderRadius: '8px',
      border: '2px solid #e2e8f0',
      padding: '12px 16px',
      fontSize: '1rem',
      background: '#ffffff',
      focus: {
        border: '2px solid #1a365d',
        shadow: '0 0 0 3px rgba(26, 54, 93, 0.1)',
        outline: 'none'
      }
    },
    dividers: {
      style: 'gradient',
      thickness: '2px',
      color: 'linear-gradient(90deg, #1a365d, #744210)',
      margin: '32px 0'
    }
  },
  animations: {
    pageLoad: { duration: '0.6s', easing: 'ease-out' },
    sectionReveal: { duration: '0.4s', easing: 'ease-out', delay: '0.1s' },
    hoverEffects: { duration: '0.3s', easing: 'ease-out' },
    focusTransition: { duration: '0.2s', easing: 'ease-in-out' }
  },
  customProperties: {
    '--executive-primary': '#1a365d',
    '--executive-secondary': '#744210',
    '--executive-accent': '#2c5282',
    '--executive-surface': '#ffffff',
    '--executive-text': '#1a202c'
  }
});

const createTechnicalStyling = (): StylingSystem => ({
  components: {
    cards: {
      borderRadius: '8px',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      background: '#ffffff',
      hover: {
        shadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        transform: 'translateY(-1px)',
        transition: { duration: '0.2s', easing: 'ease-out' }
      }
    },
    buttons: {
      primary: {
        background: '#3182ce',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 20px',
        fontSize: '0.875rem',
        fontWeight: 500,
        hover: {
          background: '#2c5282',
          transform: 'scale(1.02)'
        }
      },
      secondary: {
        background: 'transparent',
        color: '#3182ce',
        border: '1px solid #3182ce',
        borderRadius: '6px',
        padding: '9px 19px',
        fontSize: '0.875rem',
        fontWeight: 500,
        hover: {
          background: '#ebf8ff',
          transform: 'scale(1.02)'
        }
      }
    },
    inputs: {
      borderRadius: '6px',
      border: '1px solid #d2d6dc',
      padding: '8px 12px',
      fontSize: '0.875rem',
      background: '#ffffff',
      focus: {
        border: '2px solid #3182ce',
        shadow: '0 0 0 2px rgba(49, 130, 206, 0.1)',
        outline: 'none'
      }
    },
    dividers: {
      style: 'line',
      thickness: '1px',
      color: '#e2e8f0',
      margin: '24px 0'
    }
  },
  animations: {
    pageLoad: { duration: '0.4s', easing: 'ease-out' },
    sectionReveal: { duration: '0.3s', easing: 'ease-out' },
    hoverEffects: { duration: '0.2s', easing: 'ease-out' },
    focusTransition: { duration: '0.15s', easing: 'ease-in-out' }
  },
  customProperties: {
    '--tech-primary': '#3182ce',
    '--tech-secondary': '#2d3748',
    '--tech-accent': '#4299e1',
    '--tech-surface': '#ffffff',
    '--tech-text': '#2d3748'
  }
});

const createCreativeStyling = (): StylingSystem => ({
  components: {
    cards: {
      borderRadius: '16px',
      shadow: '0 8px 32px rgba(128, 90, 213, 0.12)',
      border: 'none',
      background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
      hover: {
        shadow: '0 12px 40px rgba(128, 90, 213, 0.2)',
        transform: 'translateY(-4px) scale(1.02)',
        transition: { duration: '0.4s', easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }
      }
    },
    buttons: {
      primary: {
        background: 'linear-gradient(135deg, #805ad5 0%, #ed8936 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        padding: '14px 28px',
        fontSize: '1rem',
        fontWeight: 600,
        hover: {
          background: 'linear-gradient(135deg, #9f7aea 0%, #f6ad55 100%)',
          transform: 'translateY(-2px)'
        }
      },
      secondary: {
        background: 'rgba(128, 90, 213, 0.1)',
        color: '#805ad5',
        border: '2px solid #805ad5',
        borderRadius: '12px',
        padding: '12px 26px',
        fontSize: '1rem',
        fontWeight: 600,
        hover: {
          background: '#805ad5',
          transform: 'scale(1.05)'
        }
      }
    },
    inputs: {
      borderRadius: '12px',
      border: '2px solid #e9d8fd',
      padding: '14px 18px',
      fontSize: '1rem',
      background: '#faf5ff',
      focus: {
        border: '2px solid #805ad5',
        shadow: '0 0 0 4px rgba(128, 90, 213, 0.1)',
        outline: 'none'
      }
    },
    dividers: {
      style: 'decorative',
      thickness: '3px',
      color: 'linear-gradient(90deg, #805ad5, #ed8936)',
      margin: '40px 0'
    }
  },
  animations: {
    pageLoad: { duration: '0.8s', easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
    sectionReveal: { duration: '0.5s', easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', delay: '0.2s' },
    hoverEffects: { duration: '0.4s', easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
    focusTransition: { duration: '0.3s', easing: 'ease-in-out' }
  },
  customProperties: {
    '--creative-primary': '#805ad5',
    '--creative-secondary': '#ed8936',
    '--creative-accent': '#9f7aea',
    '--creative-surface': '#faf5ff',
    '--creative-text': '#322659'
  }
});

// ============================================================================
// ATS COMPATIBILITY CONFIGURATIONS
// ============================================================================

const createHighATSCompatibility = (): ATSCompatibility => ({
  formats: {
    visual: {
      enabled: true,
      features: ['modern-layout', 'color-scheme', 'icons', 'graphics'],
      limitations: ['complex-layouts', 'custom-fonts']
    },
    ats: {
      enabled: true,
      structure: 'semantic',
      features: ['standard-sections', 'keyword-optimization', 'simple-formatting'],
      compatibility: {
        applicantTrackingSystems: [
          'Workday', 'SuccessFactors', 'Taleo', 'Greenhouse', 'Lever',
          'BambooHR', 'JazzHR', 'SmartRecruiters', 'iCIMS', 'Bullhorn'
        ],
        score: 95,
        recommendations: [
          'Use standard section headers',
          'Maintain chronological order',
          'Include relevant keywords naturally',
          'Use simple bullet points',
          'Avoid tables and complex layouts'
        ]
      }
    }
  },
  optimization: {
    keywordPlacement: 'strategic',
    sectionHeaders: 'ats-optimized',
    formatting: {
      bulletPoints: true,
      boldKeywords: true,
      standardFonts: true,
      simpleLayout: true
    }
  },
  validation: {
    maxFileSize: '2MB',
    supportedFormats: ['pdf', 'docx'],
    requiredSections: ['personalInfo', 'experience', 'education'],
    forbiddenElements: ['tables', 'text-boxes', 'headers-footers', 'columns']
  }
});

const createMediumATSCompatibility = (): ATSCompatibility => ({
  formats: {
    visual: {
      enabled: true,
      features: ['modern-layout', 'color-scheme', 'icons', 'graphics', 'custom-sections'],
      limitations: ['complex-graphics']
    },
    ats: {
      enabled: true,
      structure: 'structured',
      features: ['standard-sections', 'keyword-optimization', 'moderate-formatting'],
      compatibility: {
        applicantTrackingSystems: [
          'Workday', 'SuccessFactors', 'Greenhouse', 'Lever',
          'BambooHR', 'SmartRecruiters', 'iCIMS'
        ],
        score: 85,
        recommendations: [
          'Balance visual appeal with ATS compatibility',
          'Use standard fonts for main content',
          'Limit complex formatting',
          'Test with major ATS systems'
        ]
      }
    }
  },
  optimization: {
    keywordPlacement: 'natural',
    sectionHeaders: 'standard',
    formatting: {
      bulletPoints: true,
      boldKeywords: false,
      standardFonts: false,
      simpleLayout: false
    }
  },
  validation: {
    maxFileSize: '3MB',
    supportedFormats: ['pdf', 'docx', 'html'],
    requiredSections: ['personalInfo', 'experience'],
    forbiddenElements: ['complex-tables', 'nested-sections']
  }
});

// ============================================================================
// DEMO DATA FOR PREVIEWS
// ============================================================================

const createExecutiveDemoData = (): Partial<CVParsedData> => ({
  personalInfo: {
    fullName: 'Alexandra Richardson',
    email: 'a.richardson@executive.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/alexandra-richardson'
  },
  summary: 'Transformational C-Suite executive with 20+ years of experience driving strategic growth and operational excellence across Fortune 500 companies. Proven track record of leading digital transformations, building high-performance teams, and delivering sustainable revenue growth exceeding $2B annually.',
  experience: [
    {
      title: 'Chief Executive Officer',
      company: 'Global Innovations Corp',
      location: 'New York, NY',
      duration: '2020 - Present',
      achievements: [
        'Led company through 300% revenue growth and successful IPO',
        'Expanded operations to 15 international markets',
        'Built executive team and scaled organization to 2,500+ employees'
      ]
    }
  ],
  education: [
    {
      degree: 'MBA',
      field: 'Executive Leadership',
      institution: 'Harvard Business School',
      year: '2005'
    }
  ],
  skills: {
    categories: {
      'Leadership': ['Strategic Planning', 'Team Building', 'Change Management'],
      'Business': ['P&L Management', 'Market Expansion', 'Digital Transformation'],
      'Finance': ['Capital Allocation', 'M&A', 'IPO Management']
    }
  }
});

const createTechnicalDemoData = (): Partial<CVParsedData> => ({
  personalInfo: {
    fullName: 'Marcus Chen',
    email: 'marcus.chen@techpro.dev',
    phone: '+1 (555) 987-6543',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/marcus-chen-dev',
    github: 'github.com/marcuschen'
  },
  summary: 'Full-stack software engineer with 8+ years of experience building scalable web applications and distributed systems. Expert in React, Node.js, and cloud architecture with a passion for clean code and engineering excellence.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'TechFlow Systems',
      location: 'San Francisco, CA',
      duration: '2021 - Present',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
      achievements: [
        'Led development of microservices architecture serving 1M+ users',
        'Reduced application load time by 60% through optimization',
        'Mentored 5 junior developers and established code review standards'
      ]
    }
  ],
  skills: {
    categories: {
      'Frontend': ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      'Backend': ['Node.js', 'Python', 'PostgreSQL', 'Redis'],
      'DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      'Tools': ['Git', 'Jest', 'Webpack', 'VS Code']
    }
  },
  projects: [
    {
      title: 'E-commerce Platform',
      description: 'Built scalable e-commerce platform handling 100k+ transactions',
      technologies: ['React', 'Node.js', 'PostgreSQL']
    }
  ]
});

const createCreativeDemoData = (): Partial<CVParsedData> => ({
  personalInfo: {
    fullName: 'Sofia Martinez',
    email: 'sofia@creativedesigns.co',
    phone: '+1 (555) 246-8135',
    location: 'Los Angeles, CA',
    portfolio: 'sofiadesigns.com',
    linkedin: 'linkedin.com/in/sofia-martinez-design'
  },
  summary: 'Award-winning creative director with 10+ years of experience crafting compelling brand narratives and innovative design solutions. Specialized in digital experiences, brand identity, and creative campaign development for global brands.',
  experience: [
    {
      title: 'Creative Director',
      company: 'Stellar Creative Agency',
      location: 'Los Angeles, CA',
      duration: '2019 - Present',
      achievements: [
        'Led creative campaigns that increased client brand awareness by 150%',
        'Managed creative team of 12 designers and copywriters',
        'Won 3 international design awards including Cannes Lions'
      ]
    }
  ],
  skills: {
    categories: {
      'Design': ['Brand Identity', 'UI/UX Design', 'Typography', 'Color Theory'],
      'Software': ['Adobe Creative Suite', 'Figma', 'Sketch', 'Principle'],
      'Strategy': ['Creative Direction', 'Campaign Development', 'Brand Strategy']
    }
  },
  projects: [
    {
      title: 'Nike Future Forward Campaign',
      description: 'Developed integrated brand campaign reaching 50M+ consumers globally'
    }
  ]
});

// ============================================================================
// PROFESSIONAL TEMPLATE DEFINITIONS
// ============================================================================

export const PROFESSIONAL_TEMPLATES: Record<string, CVTemplate> = {
  'executive-authority': {
    id: 'executive-authority' as TemplateId,
    name: 'Executive Authority',
    description: 'Commanding presence for C-suite and senior leadership roles. Sophisticated design that projects executive gravitas and strategic thinking.',
    version: '1.0.0',
    category: 'executive',
    targetRoles: ['CEO', 'CFO', 'CTO', 'VP', 'Director', 'General Manager', 'Senior Executive'],
    experienceLevel: ['senior', 'executive'],
    industries: ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Consulting'],
    colors: INDUSTRY_COLOR_SCHEMES.executive,
    typography: PROFESSIONAL_TYPOGRAPHY.executive,
    spacing: createSpacingSystem(),
    layout: createExecutiveLayout(),
    features: createExecutiveFeatures(),
    styling: createExecutiveStyling(),
    ats: createHighATSCompatibility(),
    preview: {
      thumbnail: '/templates/executive-authority-thumb.png',
      mockupUrl: '/templates/executive-authority-mockup.png',
      demoData: createExecutiveDemoData(),
      previewEmoji: '👔'
    },
    metadata: {
      author: 'CVPlus Design Team',
      created: '2024-01-15',
      updated: '2024-08-21',
      popularity: 95,
      rating: 4.8,
      tags: ['executive', 'leadership', 'corporate', 'professional', 'c-suite'],
      isDefault: false,
      isPremium: true
    },
    customization: {
      allowColorChanges: true,
      allowFontChanges: false,
      allowLayoutChanges: false,
      customizableElements: ['colors', 'sections-order']
    }
  },

  'tech-innovation': {
    id: 'tech-innovation' as TemplateId,
    name: 'Tech Innovation',
    description: 'Clean, systematic design perfect for software engineers, developers, and technology professionals. Skills-first layout with technical project showcases.',
    version: '1.0.0',
    category: 'technical',
    targetRoles: ['Software Engineer', 'Developer', 'DevOps Engineer', 'Data Scientist', 'Product Manager', 'Technical Lead'],
    experienceLevel: ['entry', 'mid', 'senior'],
    industries: ['Technology', 'Software', 'Startups', 'E-commerce', 'Gaming'],
    colors: INDUSTRY_COLOR_SCHEMES.technical,
    typography: PROFESSIONAL_TYPOGRAPHY.technical,
    spacing: createSpacingSystem(),
    layout: createTechnicalLayout(),
    features: createTechnicalFeatures(),
    styling: createTechnicalStyling(),
    ats: createMediumATSCompatibility(),
    preview: {
      thumbnail: '/templates/tech-innovation-thumb.png',
      mockupUrl: '/templates/tech-innovation-mockup.png',
      demoData: createTechnicalDemoData(),
      previewEmoji: '💻'
    },
    metadata: {
      author: 'CVPlus Design Team',
      created: '2024-01-15',
      updated: '2024-08-21',
      popularity: 88,
      rating: 4.7,
      tags: ['technical', 'software', 'development', 'engineering', 'innovation'],
      isDefault: true,
      isPremium: false
    },
    customization: {
      allowColorChanges: true,
      allowFontChanges: true,
      allowLayoutChanges: true,
      customizableElements: ['colors', 'typography', 'layout-grid', 'sections']
    }
  },

  'creative-showcase': {
    id: 'creative-showcase' as TemplateId,
    name: 'Creative Showcase',
    description: 'Bold, expressive design for creative professionals. Portfolio-integrated layout with vibrant colors and unique visual elements that showcase creativity.',
    version: '1.0.0',
    category: 'creative',
    targetRoles: ['Graphic Designer', 'Creative Director', 'UX Designer', 'Art Director', 'Photographer', 'Writer'],
    experienceLevel: ['mid', 'senior', 'specialized'],
    industries: ['Design', 'Advertising', 'Media', 'Entertainment', 'Fashion', 'Arts'],
    colors: INDUSTRY_COLOR_SCHEMES.creative,
    typography: PROFESSIONAL_TYPOGRAPHY.creative,
    spacing: createSpacingSystem(),
    layout: createCreativeLayout(),
    features: createCreativeFeatures(),
    styling: createCreativeStyling(),
    ats: createMediumATSCompatibility(),
    preview: {
      thumbnail: '/templates/creative-showcase-thumb.png',
      mockupUrl: '/templates/creative-showcase-mockup.png',
      demoData: createCreativeDemoData(),
      previewEmoji: '🎨'
    },
    metadata: {
      author: 'CVPlus Design Team',
      created: '2024-01-15',
      updated: '2024-08-21',
      popularity: 82,
      rating: 4.6,
      tags: ['creative', 'design', 'portfolio', 'artistic', 'visual'],
      isDefault: false,
      isPremium: true
    },
    customization: {
      allowColorChanges: true,
      allowFontChanges: true,
      allowLayoutChanges: true,
      customizableElements: ['colors', 'typography', 'layout-sections', 'animations']
    }
  },

  'healthcare-professional': {
    id: 'healthcare-professional' as TemplateId,
    name: 'Healthcare Professional',
    description: 'Clean, trustworthy design for medical professionals. Credentials-focused layout with emphasis on patient care and medical certifications.',
    version: '1.0.0',
    category: 'healthcare',
    targetRoles: ['Doctor', 'Nurse', 'Physician Assistant', 'Medical Technician', 'Healthcare Administrator', 'Therapist'],
    experienceLevel: ['entry', 'mid', 'senior', 'specialized'],
    industries: ['Healthcare', 'Medical', 'Pharmaceutical', 'Biotechnology', 'Mental Health'],
    colors: INDUSTRY_COLOR_SCHEMES.healthcare,
    typography: PROFESSIONAL_TYPOGRAPHY.healthcare,
    spacing: createSpacingSystem(),
    layout: createExecutiveLayout(), // Professional layout suitable for healthcare
    features: createExecutiveFeatures(), // Trust-focused features
    styling: createExecutiveStyling(), // Clean, professional styling
    ats: createHighATSCompatibility(),
    preview: {
      thumbnail: '/templates/healthcare-professional-thumb.png',
      mockupUrl: '/templates/healthcare-professional-mockup.png',
      demoData: {
        personalInfo: {
          fullName: 'Dr. Sarah Johnson',
          email: 's.johnson@healthcare.com',
          phone: '+1 (555) 321-7890',
          location: 'Chicago, IL',
          linkedin: 'linkedin.com/in/dr-sarah-johnson'
        },
        summary: 'Board-certified internal medicine physician with 12+ years of experience in patient care, clinical research, and healthcare quality improvement. Committed to evidence-based medicine and compassionate patient care.',
        experience: [{
          title: 'Internal Medicine Physician',
          company: 'Chicago Medical Center',
          location: 'Chicago, IL',
          duration: '2018 - Present',
          achievements: [
            'Maintained 98% patient satisfaction scores over 5 years',
            'Led quality improvement initiative reducing readmission rates by 15%',
            'Published 8 peer-reviewed articles in medical journals'
          ]
        }],
        education: [{
          degree: 'MD',
          field: 'Medicine',
          institution: 'Northwestern University',
          year: '2012'
        }],
        certifications: [{
          name: 'Board Certified Internal Medicine',
          issuer: 'American Board of Internal Medicine',
          year: '2015'
        }]
      },
      previewEmoji: '🏥'
    },
    metadata: {
      author: 'CVPlus Design Team',
      created: '2024-01-15',
      updated: '2024-08-21',
      popularity: 78,
      rating: 4.5,
      tags: ['healthcare', 'medical', 'professional', 'clinical', 'trustworthy'],
      isDefault: false,
      isPremium: false
    },
    customization: {
      allowColorChanges: true,
      allowFontChanges: false,
      allowLayoutChanges: false,
      customizableElements: ['colors', 'sections-order']
    }
  },

  'financial-expert': {
    id: 'financial-expert' as TemplateId,
    name: 'Financial Expert',
    description: 'Conservative, stable design for finance sector professionals. Achievement-focused layout with financial metrics and regulatory compliance emphasis.',
    version: '1.0.0',
    category: 'financial',
    targetRoles: ['Financial Analyst', 'Investment Banker', 'CPA', 'CFO', 'Portfolio Manager', 'Financial Advisor'],
    experienceLevel: ['mid', 'senior', 'executive'],
    industries: ['Banking', 'Investment', 'Insurance', 'Accounting', 'Financial Services', 'Real Estate'],
    colors: INDUSTRY_COLOR_SCHEMES.financial,
    typography: PROFESSIONAL_TYPOGRAPHY.financial,
    spacing: createSpacingSystem(),
    layout: createExecutiveLayout(),
    features: createExecutiveFeatures(),
    styling: createExecutiveStyling(),
    ats: createHighATSCompatibility(),
    preview: {
      thumbnail: '/templates/financial-expert-thumb.png',
      mockupUrl: '/templates/financial-expert-mockup.png',
      demoData: {
        personalInfo: {
          fullName: 'Michael Thompson',
          email: 'm.thompson@finance.com',
          phone: '+1 (555) 456-7890',
          location: 'New York, NY',
          linkedin: 'linkedin.com/in/michael-thompson-cfa'
        },
        summary: 'Senior investment professional with 15+ years of experience managing $500M+ in assets. CFA charterholder with expertise in portfolio management, risk analysis, and client relationship management.',
        experience: [{
          title: 'Senior Portfolio Manager',
          company: 'Goldman Sachs Asset Management',
          location: 'New York, NY',
          duration: '2019 - Present',
          achievements: [
            'Managed portfolio generating 12% annual returns outperforming benchmark by 3%',
            'Grew client assets under management from $200M to $500M',
            'Led team of 6 analysts covering technology and healthcare sectors'
          ]
        }],
        education: [{
          degree: 'MBA',
          field: 'Finance',
          institution: 'Wharton School',
          year: '2010'
        }],
        certifications: [{
          name: 'CFA Charter',
          issuer: 'CFA Institute',
          year: '2012'
        }]
      },
      previewEmoji: '💼'
    },
    metadata: {
      author: 'CVPlus Design Team',
      created: '2024-01-15',
      updated: '2024-08-21',
      popularity: 85,
      rating: 4.7,
      tags: ['finance', 'investment', 'banking', 'professional', 'conservative'],
      isDefault: false,
      isPremium: true
    },
    customization: {
      allowColorChanges: true,
      allowFontChanges: false,
      allowLayoutChanges: false,
      customizableElements: ['colors']
    }
  },

  'academic-scholar': {
    id: 'academic-scholar' as TemplateId,
    name: 'Academic Scholar',
    description: 'Scholarly design for educators and researchers. Research-focused layout with publication prominence and academic achievement highlights.',
    version: '1.0.0',
    category: 'academic',
    targetRoles: ['Professor', 'Researcher', 'PhD Candidate', 'Lecturer', 'Academic Administrator', 'Postdoc'],
    experienceLevel: ['entry', 'mid', 'senior', 'specialized'],
    industries: ['Education', 'Research', 'Universities', 'Think Tanks', 'Government Research'],
    colors: INDUSTRY_COLOR_SCHEMES.academic,
    typography: PROFESSIONAL_TYPOGRAPHY.academic,
    spacing: createSpacingSystem(),
    layout: createExecutiveLayout(),
    features: createExecutiveFeatures(),
    styling: createExecutiveStyling(),
    ats: createHighATSCompatibility(),
    preview: {
      thumbnail: '/templates/academic-scholar-thumb.png',
      mockupUrl: '/templates/academic-scholar-mockup.png',
      demoData: {
        personalInfo: {
          fullName: 'Dr. Jennifer Williams',
          email: 'j.williams@university.edu',
          phone: '+1 (555) 654-3210',
          location: 'Boston, MA',
          linkedin: 'linkedin.com/in/dr-jennifer-williams'
        },
        summary: 'Distinguished professor of Computer Science with 18+ years of research experience in artificial intelligence and machine learning. Published author of 45+ peer-reviewed papers with 2,000+ citations.',
        experience: [{
          title: 'Professor of Computer Science',
          company: 'MIT',
          location: 'Cambridge, MA',
          duration: '2015 - Present',
          achievements: [
            'Secured $2.5M in research funding from NSF and private foundations',
            'Mentored 25+ PhD students with 95% completion rate',
            'Received Excellence in Teaching Award (2019, 2021)'
          ]
        }],
        education: [{
          degree: 'PhD',
          field: 'Computer Science',
          institution: 'Stanford University',
          year: '2006'
        }],
        publications: [
          'Deep Learning Applications in Natural Language Processing (Nature, 2023)',
          'Advances in Neural Network Architecture (ICML, 2022)'
        ]
      },
      previewEmoji: '🎓'
    },
    metadata: {
      author: 'CVPlus Design Team',
      created: '2024-01-15',
      updated: '2024-08-21',
      popularity: 72,
      rating: 4.6,
      tags: ['academic', 'research', 'education', 'scholarly', 'publications'],
      isDefault: false,
      isPremium: false
    },
    customization: {
      allowColorChanges: true,
      allowFontChanges: true,
      allowLayoutChanges: true,
      customizableElements: ['colors', 'typography', 'sections']
    }
  },

  'sales-performance': {
    id: 'sales-performance' as TemplateId,
    name: 'Sales Performance',
    description: 'Dynamic, results-focused design for sales professionals. Performance dashboard layout with achievement metrics and client success stories.',
    version: '1.0.0',
    category: 'sales',
    targetRoles: ['Sales Representative', 'Account Manager', 'Sales Director', 'Business Development', 'Sales Engineer'],
    experienceLevel: ['entry', 'mid', 'senior'],
    industries: ['Sales', 'Business Development', 'Technology Sales', 'Pharmaceutical Sales', 'Real Estate'],
    colors: INDUSTRY_COLOR_SCHEMES.sales,
    typography: PROFESSIONAL_TYPOGRAPHY.sales,
    spacing: createSpacingSystem(),
    layout: createTechnicalLayout(), // Results-focused layout
    features: createTechnicalFeatures(), // Performance-oriented features
    styling: createCreativeStyling(), // Dynamic, energetic styling
    ats: createMediumATSCompatibility(),
    preview: {
      thumbnail: '/templates/sales-performance-thumb.png',
      mockupUrl: '/templates/sales-performance-mockup.png',
      demoData: {
        personalInfo: {
          fullName: 'David Rodriguez',
          email: 'd.rodriguez@sales.com',
          phone: '+1 (555) 789-0123',
          location: 'Austin, TX',
          linkedin: 'linkedin.com/in/david-rodriguez-sales'
        },
        summary: 'Top-performing enterprise sales professional with 10+ years of experience exceeding quotas and building lasting client relationships. Consistently ranked in top 5% of sales team with $15M+ in annual revenue generation.',
        experience: [{
          title: 'Senior Enterprise Account Executive',
          company: 'Salesforce',
          location: 'Austin, TX',
          duration: '2020 - Present',
          achievements: [
            'Exceeded annual quota by 145% for three consecutive years',
            'Closed largest deal in company history worth $2.5M',
            'Mentored 8 junior sales reps, 6 promoted to senior roles'
          ]
        }],
        skills: {
          categories: {
            'Sales': ['Enterprise Sales', 'Account Management', 'CRM', 'Negotiation'],
            'Industry': ['SaaS', 'Cloud Solutions', 'Digital Transformation'],
            'Tools': ['Salesforce', 'HubSpot', 'LinkedIn Sales Navigator']
          }
        }
      },
      previewEmoji: '📈'
    },
    metadata: {
      author: 'CVPlus Design Team',
      created: '2024-01-15',
      updated: '2024-08-21',
      popularity: 80,
      rating: 4.5,
      tags: ['sales', 'performance', 'results', 'dynamic', 'achievement'],
      isDefault: false,
      isPremium: false
    },
    customization: {
      allowColorChanges: true,
      allowFontChanges: true,
      allowLayoutChanges: true,
      customizableElements: ['colors', 'typography', 'layout-sections']
    }
  },

  'international-professional': {
    id: 'international-professional' as TemplateId,
    name: 'International Professional',
    description: 'Universal design for global and multicultural roles. Clean, accessible layout with emphasis on cross-cultural competencies and international experience.',
    version: '1.0.0',
    category: 'international',
    targetRoles: ['International Manager', 'Global Consultant', 'Diplomat', 'Export Manager', 'Multicultural Specialist'],
    experienceLevel: ['mid', 'senior', 'executive', 'specialized'],
    industries: ['International Business', 'Consulting', 'Government', 'NGO', 'Import/Export', 'Tourism'],
    colors: INDUSTRY_COLOR_SCHEMES.international,
    typography: PROFESSIONAL_TYPOGRAPHY.international,
    spacing: createSpacingSystem(),
    layout: createTechnicalLayout(), // Clean, structured layout
    features: createTechnicalFeatures(), // Universal accessibility features
    styling: createTechnicalStyling(), // Clean, minimal styling
    ats: createHighATSCompatibility(),
    preview: {
      thumbnail: '/templates/international-professional-thumb.png',
      mockupUrl: '/templates/international-professional-mockup.png',
      demoData: {
        personalInfo: {
          fullName: 'Elena Kowalski',
          email: 'e.kowalski@global.com',
          phone: '+1 (555) 890-1234',
          location: 'Washington, DC',
          linkedin: 'linkedin.com/in/elena-kowalski-global'
        },
        summary: 'International business professional with 14+ years of experience managing cross-cultural teams and global operations across 20+ countries. Fluent in 5 languages with expertise in international market expansion.',
        experience: [{
          title: 'Global Operations Director',
          company: 'International Development Corp',
          location: 'Washington, DC',
          duration: '2019 - Present',
          achievements: [
            'Led market expansion into 8 new countries generating $50M revenue',
            'Managed diverse teams across 4 continents with 95% retention rate',
            'Negotiated international partnerships worth $25M annually'
          ]
        }],
        languages: [
          { language: 'English', proficiency: 'Native' },
          { language: 'Spanish', proficiency: 'Fluent' },
          { language: 'French', proficiency: 'Advanced' },
          { language: 'German', proficiency: 'Intermediate' },
          { language: 'Mandarin', proficiency: 'Intermediate' }
        ]
      },
      previewEmoji: '🌍'
    },
    metadata: {
      author: 'CVPlus Design Team',
      created: '2024-01-15',
      updated: '2024-08-21',
      popularity: 68,
      rating: 4.4,
      tags: ['international', 'global', 'multicultural', 'universal', 'diplomatic'],
      isDefault: false,
      isPremium: false
    },
    customization: {
      allowColorChanges: true,
      allowFontChanges: true,
      allowLayoutChanges: true,
      customizableElements: ['colors', 'typography', 'layout', 'language-sections']
    }
  }

};

// ============================================================================
// TEMPLATE UTILITIES
// ============================================================================

export function getTemplateById(templateId: string): CVTemplate | undefined {
  return PROFESSIONAL_TEMPLATES[templateId];
}

export function getTemplatesByCategory(category: TemplateCategory): CVTemplate[] {
  return Object.values(PROFESSIONAL_TEMPLATES)
    .filter(template => template.category === category);
}

export function getTemplatesByIndustry(industry: string): CVTemplate[] {
  return Object.values(PROFESSIONAL_TEMPLATES)
    .filter(template => template.industries.includes(industry));
}

export function getTemplatesByExperienceLevel(level: ExperienceLevel): CVTemplate[] {
  return Object.values(PROFESSIONAL_TEMPLATES)
    .filter(template => template.experienceLevel.includes(level));
}

export function getPopularTemplates(limit = 5): CVTemplate[] {
  return Object.values(PROFESSIONAL_TEMPLATES)
    .sort((a, b) => b.metadata.popularity - a.metadata.popularity)
    .slice(0, limit);
}

export function getDefaultTemplates(): CVTemplate[] {
  return Object.values(PROFESSIONAL_TEMPLATES)
    .filter(template => template.metadata.isDefault);
}

export function getPremiumTemplates(): CVTemplate[] {
  return Object.values(PROFESSIONAL_TEMPLATES)
    .filter(template => template.metadata.isPremium);
}

// Template validation utility
export function validateTemplate(template: CVTemplate): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!template.id || template.id.length === 0) {
    errors.push('Template ID is required');
  }
  
  if (!template.name || template.name.length === 0) {
    errors.push('Template name is required');
  }
  
  if (!template.category) {
    errors.push('Template category is required');
  }
  
  if (!template.colors || !template.colors.primary) {
    errors.push('Template colors are required');
  }
  
  if (!template.typography || !template.typography.fonts) {
    errors.push('Template typography is required');
  }
  
  if (!template.layout || !template.layout.grid) {
    errors.push('Template layout is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Template search utility
export function searchTemplates(query: string): CVTemplate[] {
  const lowercaseQuery = query.toLowerCase();
  
  return Object.values(PROFESSIONAL_TEMPLATES)
    .filter(template => 
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.targetRoles.some(role => role.toLowerCase().includes(lowercaseQuery)) ||
      template.industries.some(industry => industry.toLowerCase().includes(lowercaseQuery)) ||
      template.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
}
