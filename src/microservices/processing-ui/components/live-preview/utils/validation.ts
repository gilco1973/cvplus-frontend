// @ts-ignore
/**
 * LivePreview Validation Utilities
 *
 * Validation functions for CV data and templates
  */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CVValidationOptions {
  requirePersonalInfo?: boolean;
  requireExperience?: boolean;
  requireEducation?: boolean;
  requireSkills?: boolean;
  minExperienceEntries?: number;
  maxExperienceEntries?: number;
}

const DEFAULT_VALIDATION_OPTIONS: CVValidationOptions = {
  requirePersonalInfo: true,
  requireExperience: false,
  requireEducation: false,
  requireSkills: false,
  minExperienceEntries: 0,
  maxExperienceEntries: 20
};

/**
 * Validates CV data structure and content
  */
export function validateCVData(
  cvData: any,
  options: CVValidationOptions = DEFAULT_VALIDATION_OPTIONS
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!cvData || typeof cvData !== 'object') {
    return {
      isValid: false,
      errors: ['CV data must be a valid object'],
      warnings: []
    };
  }

  // Validate personal information
  if (options.requirePersonalInfo) {
    if (!cvData.personalInfo) {
      errors.push('Personal information is required');
    } else {
      const { name, email, phone } = cvData.personalInfo;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required');
      }

      if (!email || typeof email !== 'string') {
        errors.push('Email is required');
      } else if (!isValidEmail(email)) {
        errors.push('Email format is invalid');
      }

      if (phone && typeof phone === 'string' && phone.length > 0 && !isValidPhone(phone)) {
        warnings.push('Phone number format may be invalid');
      }
    }
  }

  // Validate experience
  if (options.requireExperience && (!cvData.experience || cvData.experience.length === 0)) {
    errors.push('At least one work experience entry is required');
  }

  if (cvData.experience && Array.isArray(cvData.experience)) {
    if (options.minExperienceEntries && cvData.experience.length < options.minExperienceEntries) {
      errors.push(`At least ${options.minExperienceEntries} experience entries are required`);
    }

    if (options.maxExperienceEntries && cvData.experience.length > options.maxExperienceEntries) {
      warnings.push(`Consider limiting experience entries to ${options.maxExperienceEntries} or fewer`);
    }

    cvData.experience.forEach((exp: any, index: number) => {
      if (!exp.company || typeof exp.company !== 'string' || exp.company.trim().length === 0) {
        errors.push(`Experience entry ${index + 1}: Company name is required`);
      }

      if (!exp.position || typeof exp.position !== 'string' || exp.position.trim().length === 0) {
        errors.push(`Experience entry ${index + 1}: Position title is required`);
      }

      if (exp.description && exp.description.length > 1000) {
        warnings.push(`Experience entry ${index + 1}: Description is quite long, consider shortening`);
      }
    });
  }

  // Validate education
  if (options.requireEducation && (!cvData.education || cvData.education.length === 0)) {
    errors.push('At least one education entry is required');
  }

  if (cvData.education && Array.isArray(cvData.education)) {
    cvData.education.forEach((edu: any, index: number) => {
      if (!edu.degree || typeof edu.degree !== 'string' || edu.degree.trim().length === 0) {
        warnings.push(`Education entry ${index + 1}: Degree/qualification name is missing`);
      }

      if (!edu.institution || typeof edu.institution !== 'string' || edu.institution.trim().length === 0) {
        warnings.push(`Education entry ${index + 1}: Institution name is missing`);
      }
    });
  }

  // Validate skills
  if (options.requireSkills && (!cvData.skills || cvData.skills.length === 0)) {
    errors.push('Skills section is required');
  }

  if (cvData.skills && Array.isArray(cvData.skills)) {
    if (cvData.skills.length > 50) {
      warnings.push('Consider limiting skills to 50 or fewer for better readability');
    }

    const invalidSkills = cvData.skills.filter((skill: any, index: number) => {
      if (typeof skill !== 'string' || skill.trim().length === 0) {
        return true;
      }
      if (skill.length > 50) {
        warnings.push(`Skill "${skill.slice(0, 20)}..." is quite long`);
      }
      return false;
    });

    if (invalidSkills.length > 0) {
      errors.push('Some skills have invalid format (must be non-empty strings)');
    }
  }

  // Validate summary
  if (cvData.summary) {
    if (typeof cvData.summary !== 'string') {
      errors.push('Summary must be a text string');
    } else {
      if (cvData.summary.length < 50) {
        warnings.push('Summary is quite short, consider adding more detail');
      }
      if (cvData.summary.length > 500) {
        warnings.push('Summary is quite long, consider shortening for better impact');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates template structure
  */
export function validateTemplate(template: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!template || typeof template !== 'object') {
    return {
      isValid: false,
      errors: ['Template must be a valid object'],
      warnings: []
    };
  }

  const requiredFields = ['id', 'name'];
  for (const field of requiredFields) {
    if (!template[field] || typeof template[field] !== 'string') {
      errors.push(`Template ${field} is required and must be a string`);
    }
  }

  if (template.id && !/^[a-z0-9-]+$/.test(template.id)) {
    errors.push('Template ID must contain only lowercase letters, numbers, and hyphens');
  }

  if (template.isPremium !== undefined && typeof template.isPremium !== 'boolean') {
    errors.push('Template isPremium field must be a boolean');
  }

  if (template.category && typeof template.category !== 'string') {
    warnings.push('Template category should be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates viewport configuration
  */
export function validateViewportConfig(config: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config || typeof config !== 'object') {
    return {
      isValid: false,
      errors: ['Viewport config must be a valid object'],
      warnings: []
    };
  }

  const validModes = ['desktop', 'tablet', 'mobile', 'print'];
  if (!validModes.includes(config.mode)) {
    errors.push(`Viewport mode must be one of: ${validModes.join(', ')}`);
  }

  if (typeof config.width !== 'number' || config.width <= 0) {
    errors.push('Viewport width must be a positive number');
  }

  if (typeof config.height !== 'number' || config.height <= 0) {
    errors.push('Viewport height must be a positive number');
  }

  const validOrientations = ['portrait', 'landscape'];
  if (!validOrientations.includes(config.orientation)) {
    errors.push(`Viewport orientation must be one of: ${validOrientations.join(', ')}`);
  }

  // Check for reasonable dimensions
  if (config.width && config.height) {
    if (config.width > 4000 || config.height > 4000) {
      warnings.push('Viewport dimensions are very large, consider smaller values');
    }
    if (config.width < 200 || config.height < 200) {
      warnings.push('Viewport dimensions are very small, content may not display properly');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Helper function to validate email format
  */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Helper function to validate phone format
  */
function isValidPhone(phone: string): boolean {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Sanitizes CV data by removing invalid entries and fixing format issues
  */
export function sanitizeCVData(cvData: any): any {
  if (!cvData || typeof cvData !== 'object') {
    return {
      personalInfo: { name: '', email: '', phone: '', location: '' },
      summary: '',
      experience: [],
      education: [],
      skills: []
    };
  }

  const sanitized = { ...cvData };

  // Sanitize personal info
  if (!sanitized.personalInfo || typeof sanitized.personalInfo !== 'object') {
    sanitized.personalInfo = {};
  }

  const personalFields = ['name', 'email', 'phone', 'location', 'linkedin', 'github', 'website'];
  personalFields.forEach(field => {
    if (typeof sanitized.personalInfo[field] !== 'string') {
      sanitized.personalInfo[field] = '';
    } else {
      sanitized.personalInfo[field] = sanitized.personalInfo[field].trim();
    }
  });

  // Sanitize summary
  if (typeof sanitized.summary !== 'string') {
    sanitized.summary = '';
  } else {
    sanitized.summary = sanitized.summary.trim();
  }

  // Sanitize experience
  if (!Array.isArray(sanitized.experience)) {
    sanitized.experience = [];
  } else {
    sanitized.experience = sanitized.experience
      .filter(exp => exp && typeof exp === 'object')
      .map(exp => ({
        company: (typeof exp.company === 'string' ? exp.company : '').trim(),
        position: (typeof exp.position === 'string' ? exp.position : '').trim(),
        duration: (typeof exp.duration === 'string' ? exp.duration : '').trim(),
        description: (typeof exp.description === 'string' ? exp.description : '').trim(),
        achievements: Array.isArray(exp.achievements)
          ? exp.achievements.filter(a => typeof a === 'string' && a.trim().length > 0).map(a => a.trim())
          : []
      }));
  }

  // Sanitize education
  if (!Array.isArray(sanitized.education)) {
    sanitized.education = [];
  } else {
    sanitized.education = sanitized.education
      .filter(edu => edu && typeof edu === 'object')
      .map(edu => ({
        degree: (typeof edu.degree === 'string' ? edu.degree : '').trim(),
        institution: (typeof edu.institution === 'string' ? edu.institution : '').trim(),
        year: (typeof edu.year === 'string' ? edu.year : '').trim()
      }));
  }

  // Sanitize skills
  if (!Array.isArray(sanitized.skills)) {
    sanitized.skills = [];
  } else {
    sanitized.skills = sanitized.skills
      .filter(skill => typeof skill === 'string' && skill.trim().length > 0)
      .map(skill => skill.trim())
      .slice(0, 50); // Limit to 50 skills
  }

  return sanitized;
}