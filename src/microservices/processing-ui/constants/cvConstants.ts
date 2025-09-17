// CV processing constants for cv-processing-ui microservice

export const CV_PROCESSING_EVENTS = {
  CV_UPLOADED: 'cv-uploaded',
  CV_GENERATED: 'cv-generated',
  CV_UPDATED: 'cv-updated',
  CV_DELETED: 'cv-deleted',
  CV_ANALYSIS_STARTED: 'cv-analysis-started',
  CV_ANALYSIS_COMPLETED: 'cv-analysis-completed',
  CV_PREVIEW_GENERATED: 'cv-preview-generated',
  CV_EXPORTED: 'cv-exported',
  TEMPLATE_SELECTED: 'template-selected',
  ATS_OPTIMIZATION_COMPLETED: 'ats-optimization-completed'
} as const;

export const CV_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'yellow' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'archived', label: 'Archived', color: 'gray' },
  { value: 'template', label: 'Template', color: 'blue' }
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level', description: '0-2 years of experience' },
  { value: 'mid', label: 'Mid Level', description: '3-5 years of experience' },
  { value: 'senior', label: 'Senior Level', description: '6-10 years of experience' },
  { value: 'executive', label: 'Executive', description: '10+ years of experience' }
] as const;

export const SKILL_CATEGORIES = [
  { value: 'technical', label: 'Technical Skills', icon: 'code' },
  { value: 'soft', label: 'Soft Skills', icon: 'users' },
  { value: 'language', label: 'Languages', icon: 'globe' },
  { value: 'certification', label: 'Certifications', icon: 'award' },
  { value: 'other', label: 'Other', icon: 'plus' }
] as const;

export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Basic understanding', color: 'red' },
  { value: 'intermediate', label: 'Intermediate', description: 'Practical experience', color: 'yellow' },
  { value: 'advanced', label: 'Advanced', description: 'Extensive experience', color: 'blue' },
  { value: 'expert', label: 'Expert', description: 'Deep expertise', color: 'green' }
] as const;

export const LANGUAGE_PROFICIENCIES = [
  { value: 'basic', label: 'Basic', description: 'Elementary proficiency' },
  { value: 'conversational', label: 'Conversational', description: 'Limited working proficiency' },
  { value: 'professional', label: 'Professional', description: 'Professional working proficiency' },
  { value: 'native', label: 'Native', description: 'Native or bilingual proficiency' }
] as const;

export const GENERATION_TYPES = [
  { value: 'from_upload', label: 'From Upload', description: 'Generate from uploaded document' },
  { value: 'from_profile', label: 'From Profile', description: 'Generate from user profile data' },
  { value: 'from_scratch', label: 'From Scratch', description: 'Create new CV from form input' },
  { value: 'enhancement', label: 'Enhancement', description: 'Improve existing CV' },
  { value: 'ai_assisted', label: 'AI Assisted', description: 'AI-powered content generation' },
  { value: 'job_tailored', label: 'Job Tailored', description: 'Optimize for specific job posting' }
] as const;

export const CV_LENGTHS = [
  { value: 'one_page', label: 'One Page', description: 'Concise single-page format' },
  { value: 'two_page', label: 'Two Pages', description: 'Standard two-page format' },
  { value: 'extended', label: 'Extended', description: 'Comprehensive multi-page format' }
] as const;

export const CV_TONES = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-oriented' },
  { value: 'conversational', label: 'Conversational', description: 'Friendly and approachable' },
  { value: 'dynamic', label: 'Dynamic', description: 'Energetic and action-oriented' },
  { value: 'conservative', label: 'Conservative', description: 'Traditional and formal' },
  { value: 'creative', label: 'Creative', description: 'Innovative and artistic' },
  { value: 'technical', label: 'Technical', description: 'Detail-oriented and precise' }
] as const;

export const ANALYSIS_TYPES = [
  { value: 'ats_optimization', label: 'ATS Optimization', icon: 'robot' },
  { value: 'keyword_analysis', label: 'Keyword Analysis', icon: 'search' },
  { value: 'structure_analysis', label: 'Structure Analysis', icon: 'layout' },
  { value: 'content_quality', label: 'Content Quality', icon: 'star' },
  { value: 'formatting_check', label: 'Formatting Check', icon: 'format' },
  { value: 'skills_assessment', label: 'Skills Assessment', icon: 'brain' },
  { value: 'experience_validation', label: 'Experience Validation', icon: 'check' },
  { value: 'industry_alignment', label: 'Industry Alignment', icon: 'industry' },
  { value: 'role_matching', label: 'Role Matching', icon: 'target' }
] as const;

export const RECOMMENDATION_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' }
] as const;

export const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF', icon: 'file-pdf', description: 'Portable Document Format' },
  { value: 'docx', label: 'DOCX', icon: 'file-word', description: 'Microsoft Word Document' },
  { value: 'html', label: 'HTML', icon: 'file-html', description: 'Web Page Format' },
  { value: 'json', label: 'JSON', icon: 'file-json', description: 'Structured Data Format' }
] as const;

export const TEMPLATE_CATEGORIES = [
  { value: 'professional', label: 'Professional', description: 'Clean and business-focused' },
  { value: 'creative', label: 'Creative', description: 'Artistic and visually appealing' },
  { value: 'modern', label: 'Modern', description: 'Contemporary and sleek design' },
  { value: 'classic', label: 'Classic', description: 'Traditional and timeless' },
  { value: 'academic', label: 'Academic', description: 'Scholarly and research-focused' },
  { value: 'technical', label: 'Technical', description: 'Engineering and tech-optimized' },
  { value: 'executive', label: 'Executive', description: 'Senior leadership focused' },
  { value: 'entry-level', label: 'Entry Level', description: 'New graduate friendly' }
] as const;

export const CUSTOM_SECTION_TYPES = [
  { value: 'text', label: 'Text', icon: 'text', description: 'Free-form text content' },
  { value: 'list', label: 'List', icon: 'list', description: 'Bulleted or numbered list' },
  { value: 'table', label: 'Table', icon: 'table', description: 'Structured tabular data' },
  { value: 'media', label: 'Media', icon: 'image', description: 'Images or multimedia content' }
] as const;

export const DEFAULT_CV_SECTIONS = [
  'personal-info',
  'summary',
  'experience',
  'education',
  'skills'
] as const;

export const OPTIONAL_CV_SECTIONS = [
  'projects',
  'certifications',
  'languages',
  'references',
  'volunteer',
  'publications',
  'awards',
  'interests'
] as const;

export const FILE_UPLOAD_CONSTRAINTS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/rtf'
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf']
} as const;

export const ATS_SCORE_RANGES = {
  excellent: { min: 90, max: 100, color: 'green', label: 'Excellent' },
  good: { min: 75, max: 89, color: 'blue', label: 'Good' },
  fair: { min: 60, max: 74, color: 'yellow', label: 'Fair' },
  poor: { min: 0, max: 59, color: 'red', label: 'Poor' }
} as const;

export const PROCESSING_TIMEOUTS = {
  upload: 30000, // 30 seconds
  generation: 60000, // 1 minute
  analysis: 45000, // 45 seconds
  export: 30000, // 30 seconds
  preview: 15000 // 15 seconds
} as const;