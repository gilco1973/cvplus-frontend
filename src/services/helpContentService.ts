import type { HelpContent, HelpTour, TourStep } from '../types/help';

export const HELP_CONTENT: Record<string, HelpContent> = {
  // Home Page Help Content
  'home-welcome': {
    id: 'home-welcome',
    type: 'modal',
    title: 'Welcome to CVPlus!',
    content: 'Transform your traditional CV into an interactive, AI-powered professional profile that stands out to employers and passes ATS systems.',
    category: 'onboarding',
    context: 'home',
    trigger: 'auto',
    priority: 100,
    showOnce: true,
    actions: [
      { label: 'Take Tour', action: 'start_tour', variant: 'primary' },
      { label: 'Skip', action: 'dismiss', variant: 'link' }
    ],
    tags: ['welcome', 'getting-started']
  },
  
  'home-upload-methods': {
    id: 'home-upload-methods',
    type: 'popover',
    title: 'Upload Your CV',
    content: 'Choose between file upload (PDF/DOCX) or URL import from LinkedIn, Indeed, or other job sites.',
    category: 'core-features',
    context: 'home',
    trigger: 'hover',
    position: 'top',
    priority: 90,
    tags: ['upload', 'file', 'url']
  },

  'home-instructions-field': {
    id: 'home-instructions-field',
    type: 'tooltip',
    title: 'Personalize Your CV',
    content: 'Add specific instructions to guide AI analysis. For example: "Focus on leadership skills" or "Highlight Python experience".',
    category: 'customization',
    context: 'home',
    trigger: 'focus',
    position: 'top',
    priority: 70,
    tags: ['instructions', 'customization', 'ai']
  },

  'home-quick-create': {
    id: 'home-quick-create',
    type: 'popover',
    title: 'One-Click Magic ✨',
    content: 'Skip all choices and let our AI automatically apply the best enhancements for your CV. Perfect for quick results!',
    category: 'shortcuts',
    context: 'home',
    trigger: 'hover',
    position: 'top',
    priority: 80,
    tags: ['quick-create', 'automation', 'shortcuts']
  },

  // Processing Page Help Content
  'processing-steps': {
    id: 'processing-steps',
    type: 'overlay',
    title: 'Understanding the Process',
    content: 'Your CV goes through 5 intelligent steps: File analysis, content extraction, AI enhancement, feature application, and multimedia generation.',
    category: 'process-explanation',
    context: 'processing',
    trigger: 'auto',
    priority: 90,
    tags: ['processing', 'ai', 'steps']
  },

  'processing-analysis': {
    id: 'processing-analysis',
    type: 'tooltip',
    title: 'AI Analysis in Progress',
    content: 'Our AI is reading your CV, identifying skills, experience, and achievements to create the best possible enhancement strategy.',
    category: 'process-explanation',
    context: 'processing',
    trigger: 'hover',
    position: 'right',
    priority: 80,
    tags: ['ai-analysis', 'skills', 'enhancement']
  },

  // Individual Processing Steps Help Content
  'processing-upload': {
    id: 'processing-upload',
    type: 'tooltip',
    title: 'File Upload Complete',
    content: 'Your CV file has been successfully uploaded and is ready for AI analysis. The system has validated the file format and extracted the text content.',
    category: 'process-explanation',
    context: 'processing',
    trigger: 'hover',
    position: 'right',
    priority: 85,
    tags: ['upload', 'file-processing', 'validation']
  },

  'processing-analyze': {
    id: 'processing-analyze',
    type: 'tooltip',
    title: 'AI Content Analysis',
    content: 'Advanced AI algorithms are analyzing your CV to identify key skills, experience patterns, achievements, and areas for improvement. This creates a personalized enhancement strategy.',
    category: 'process-explanation',
    context: 'processing',
    trigger: 'hover',
    position: 'right',
    priority: 85,
    tags: ['ai-analysis', 'skills-extraction', 'content-analysis']
  },

  'processing-enhance': {
    id: 'processing-enhance',
    type: 'tooltip',
    title: 'CV Enhancement Generation',
    content: 'Creating your enhanced CV with professional formatting, improved content structure, and ATS-optimized layout based on AI analysis results.',
    category: 'process-explanation',
    context: 'processing',
    trigger: 'hover',
    position: 'right',
    priority: 85,
    tags: ['enhancement', 'formatting', 'ats-optimization']
  },

  'processing-features': {
    id: 'processing-features',
    type: 'tooltip',
    title: 'AI Features Application',
    content: 'Applying selected features like skills visualization, personality insights, QR codes, and certification badges to make your CV stand out to recruiters.',
    category: 'process-explanation',
    context: 'processing',
    trigger: 'hover',
    position: 'right',
    priority: 85,
    tags: ['features', 'visualization', 'enhancement']
  },

  'processing-media': {
    id: 'processing-media',
    type: 'tooltip',
    title: 'Media Content Creation',
    content: 'Generating multimedia content including personalized podcast introductions, video summaries, and interactive portfolio elements to complement your CV.',
    category: 'process-explanation',
    context: 'processing',
    trigger: 'hover',
    position: 'right',
    priority: 85,
    tags: ['media', 'podcast', 'video', 'portfolio']
  },

  // Analysis Page Help Content
  'analysis-results': {
    id: 'analysis-results',
    type: 'guide',
    title: 'Your CV Analysis Results',
    content: 'Review AI-generated insights about your CV including ATS score, keyword optimization, and personalized recommendations.',
    category: 'results-interpretation',
    context: 'analysis',
    trigger: 'auto',
    priority: 100,
    tags: ['analysis', 'ats-score', 'recommendations']
  },

  'ats-score-explanation': {
    id: 'ats-score-explanation',
    type: 'popover',
    title: 'ATS Score Explained',
    content: 'This score (0-100) indicates how well your CV will perform with Applicant Tracking Systems. Higher scores mean better compatibility.',
    category: 'metrics-explanation',
    context: 'analysis',
    trigger: 'click',
    position: 'bottom',
    priority: 85,
    tags: ['ats-score', 'metrics', 'compatibility']
  },

  'keyword-optimization': {
    id: 'keyword-optimization',
    type: 'tooltip',
    title: 'Keyword Matching',
    content: 'Shows how well your CV keywords match job market demands. Green = excellent match, Yellow = good, Red = needs improvement.',
    category: 'metrics-explanation',
    context: 'analysis',
    trigger: 'hover',
    position: 'right',
    priority: 80,
    tags: ['keywords', 'job-matching', 'optimization']
  },

  // Feature Selection Help Content
  'feature-categories': {
    id: 'feature-categories',
    type: 'overlay',
    title: 'Feature Categories Explained',
    content: 'Features are organized by impact: Essential (core improvements), Visual (aesthetic enhancements), and Advanced (cutting-edge features).',
    category: 'feature-explanation',
    context: 'features',
    trigger: 'auto',
    priority: 95,
    tags: ['features', 'categories', 'selection']
  },

  'ats-optimization-feature': {
    id: 'ats-optimization-feature',
    type: 'popover',
    title: 'ATS Optimization',
    content: 'Ensures your CV format and keywords are optimized for Applicant Tracking Systems used by 99% of large companies.',
    category: 'feature-explanation',
    context: 'features',
    trigger: 'hover',
    position: 'right',
    priority: 90,
    tags: ['ats', 'optimization', 'tracking-systems']
  },

  'skills-visualization-feature': {
    id: 'skills-visualization-feature',
    type: 'tooltip',
    title: 'Skills Visualization',
    content: 'Creates beautiful charts and graphs showing your skill levels, making your expertise immediately visible to recruiters.',
    category: 'feature-explanation',
    context: 'features',
    trigger: 'hover',
    position: 'top',
    priority: 75,
    tags: ['skills', 'visualization', 'charts']
  },

  'qr-code-feature': {
    id: 'qr-code-feature',
    type: 'tooltip',
    title: 'Interactive QR Code',
    content: 'Adds a QR code linking to your online portfolio or LinkedIn profile. Perfect for print CVs at networking events.',
    category: 'feature-explanation',
    context: 'features',
    trigger: 'hover',
    position: 'top',
    priority: 70,
    tags: ['qr-code', 'networking', 'online-profile']
  },

  // Preview Page Help Content
  'preview-customization': {
    id: 'preview-customization',
    type: 'tour',
    title: 'Customize Your CV',
    content: 'Fine-tune colors, fonts, layouts, and content to match your personal brand and target industry.',
    category: 'customization',
    context: 'preview',
    trigger: 'auto',
    priority: 90,
    tags: ['customization', 'preview', 'branding']
  },

  // Troubleshooting Help Content
  'upload-failed': {
    id: 'upload-failed',
    type: 'modal',
    title: 'Upload Issues?',
    content: 'Try these solutions: 1) Check file size (max 10MB), 2) Ensure PDF/DOCX format, 3) Check internet connection, 4) Try a different browser.',
    category: 'troubleshooting',
    context: 'global',
    trigger: 'manual',
    priority: 100,
    tags: ['troubleshooting', 'upload', 'errors']
  },

  'slow-processing': {
    id: 'slow-processing',
    type: 'popover',
    title: 'Processing Taking Long?',
    content: 'Complex CVs with many sections may take 2-3 minutes. Our AI is thoroughly analyzing your content for the best results.',
    category: 'troubleshooting',
    context: 'processing',
    trigger: 'manual',
    priority: 80,
    tags: ['troubleshooting', 'performance', 'processing-time']
  }
};

export const HELP_TOURS: Record<string, HelpTour> = {
  'first-time-user': {
    id: 'first-time-user',
    name: 'Getting Started with CVPlus',
    description: 'A quick tour to help you understand how CVPlus works and get the most out of our features.',
    context: 'home',
    category: 'onboarding',
    autoStart: false,
    estimatedTime: 3,
    steps: [
      {
        id: 'step-1',
        target: '#upload-section',
        title: 'Start Here',
        content: 'Upload your existing CV or import from a URL. We support PDF, DOCX, and most job site profiles.',
        position: 'top',
        spotlight: true,
        nextLabel: 'Next'
      },
      {
        id: 'step-2',
        target: '[id="userInstructions"]',
        title: 'Add Your Touch',
        content: 'Tell our AI what to focus on - like specific skills, industries, or achievements you want highlighted.',
        position: 'top',
        spotlight: true,
        nextLabel: 'Got it!'
      },
      {
        id: 'step-3',
        target: '.trust-indicators',
        title: 'Join Thousands of Users',
        content: 'CVPlus helps professionals transform their CVs with AI-powered analysis and enhancement tools.',
        position: 'bottom',
        nextLabel: 'Continue'
      },
      {
        id: 'step-4',
        target: '#features',
        title: 'Powerful Features Await',
        content: 'After upload, you\'ll access AI analysis, ATS optimization, interactive elements, and much more.',
        position: 'top',
        nextLabel: 'Let\'s Begin!'
      }
    ]
  },

  'analysis-walkthrough': {
    id: 'analysis-walkthrough',
    name: 'Understanding Your Analysis',
    description: 'Learn how to interpret your CV analysis results and make informed decisions about improvements.',
    context: 'analysis',
    category: 'feature',
    autoStart: true,
    estimatedTime: 2,
    steps: [
      {
        id: 'ats-score-step',
        target: '[data-help="ats-score"]',
        title: 'Your ATS Score',
        content: 'This score shows how well your CV performs with automated screening systems. Aim for 80+ for best results.',
        position: 'bottom',
        spotlight: true
      },
      {
        id: 'recommendations-step',
        target: '[data-help="recommendations"]',
        title: 'Smart Recommendations',
        content: 'Our AI has analyzed your CV and suggests specific improvements. Select the ones that match your goals.',
        position: 'left',
        spotlight: true
      },
      {
        id: 'continue-step',
        target: '[data-help="continue-button"]',
        title: 'Ready to Enhance',
        content: 'When ready, click Continue to start customizing your enhanced CV with the features you\'ve selected.',
        position: 'top',
        spotlight: true
      }
    ]
  },

  'feature-selection-guide': {
    id: 'feature-selection-guide',
    name: 'Choosing the Right Features',
    description: 'Learn about different feature categories and how to select the best ones for your industry and goals.',
    context: 'features',
    category: 'feature',
    autoStart: false,
    estimatedTime: 4,
    steps: [
      {
        id: 'categories-overview',
        target: '.feature-categories',
        title: 'Feature Categories',
        content: 'Features are organized by impact: Essential features improve compatibility, Visual features enhance appearance, and Advanced features add interactivity.',
        position: 'top',
        spotlight: true
      },
      {
        id: 'essential-features',
        target: '[data-category="core"]',
        title: 'Essential Features',
        content: 'These core improvements are recommended for all users. They enhance ATS compatibility and keyword optimization.',
        position: 'right',
        spotlight: true
      },
      {
        id: 'visual-enhancements',
        target: '[data-category="enhancement"]',
        title: 'Visual Enhancements',
        content: 'Add professional polish with QR codes, certification badges, and professional links.',
        position: 'right',
        spotlight: true
      },
      {
        id: 'advanced-features',
        target: '[data-category="advanced"]',
        title: 'Advanced Features',
        content: 'Stand out with interactive elements like skills charts, personality insights, and portfolio galleries.',
        position: 'right',
        spotlight: true
      }
    ]
  }
};

export class HelpContentService {
  private static instance: HelpContentService;

  static getInstance(): HelpContentService {
    if (!this.instance) {
      this.instance = new HelpContentService();
    }
    return this.instance;
  }

  getContentByContext(context: string): HelpContent[] {
    return Object.values(HELP_CONTENT).filter(content => 
      content.context === context || content.context === 'global'
    ).sort((a, b) => b.priority - a.priority);
  }

  getContentById(id: string): HelpContent | null {
    return HELP_CONTENT[id] || null;
  }

  getTourByContext(context: string): HelpTour[] {
    return Object.values(HELP_TOURS).filter(tour => tour.context === context);
  }

  getTourById(id: string): HelpTour | null {
    return HELP_TOURS[id] || null;
  }

  searchContent(query: string): HelpContent[] {
    const lowercaseQuery = query.toLowerCase();
    return Object.values(HELP_CONTENT).filter(content =>
      content.title.toLowerCase().includes(lowercaseQuery) ||
      content.content.toLowerCase().includes(lowercaseQuery) ||
      content.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    ).sort((a, b) => b.priority - a.priority);
  }

  getContentByCategory(category: string): HelpContent[] {
    return Object.values(HELP_CONTENT).filter(content => 
      content.category === category
    ).sort((a, b) => b.priority - a.priority);
  }
}