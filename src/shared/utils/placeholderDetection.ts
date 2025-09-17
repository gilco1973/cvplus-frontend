/**
 * Utility functions for detecting placeholders in CV content
 */

export interface PlaceholderMatch {
  text: string;
  location: string;
  section: string;
}

/**
 * Common placeholder patterns to detect
 */
const PLACEHOLDER_PATTERNS = [
  /\[INSERT[^\]]*\]/gi,
  /\[ADD[^\]]*\]/gi,
  /\[REPLACE[^\]]*\]/gi,
  /\[UPDATE[^\]]*\]/gi,
  /\[YOUR[^\]]*\]/gi,
  /\[ENTER[^\]]*\]/gi,
  /\[SPECIFY[^\]]*\]/gi,
  /\[CUSTOMIZE[^\]]*\]/gi,
  /\[FILL[^\]]*\]/gi
];

/**
 * Detects placeholder patterns in a text string
 * @param text - The text to search for placeholders
 * @returns Array of detected placeholder texts
 */
export const detectPlaceholdersInText = (text: string): string[] => {
  if (!text || typeof text !== 'string') return [];
  
  const placeholders: string[] = [];
  
  PLACEHOLDER_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      placeholders.push(...matches);
    }
  });
  
  // Remove duplicates and return
  return [...new Set(placeholders)];
};

/**
 * Recursively searches through an object for placeholder patterns
 * @param obj - The object to search
 * @param section - The current section name for context
 * @returns Array of placeholder matches with location information
 */
export const detectPlaceholdersInObject = (
  obj: unknown, 
  section = 'unknown'
): PlaceholderMatch[] => {
  const matches: PlaceholderMatch[] = [];
  
  if (!obj) return matches;
  
  const searchInValue = (value: unknown, location: string) => {
    if (typeof value === 'string') {
      const placeholders = detectPlaceholdersInText(value);
      placeholders.forEach(placeholder => {
        matches.push({
          text: placeholder,
          location,
          section
        });
      });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        searchInValue(item, `${location}[${index}]`);
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([key, val]) => {
        searchInValue(val, location ? `${location}.${key}` : key);
      });
    }
  };
  
  if (typeof obj === 'string') {
    searchInValue(obj, section);
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      searchInValue(item, `${section}[${index}]`);
    });
  } else if (typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      searchInValue(value, key);
    });
  }
  
  return matches;
};

/**
 * Detects placeholders in CV data structure
 * @param cvData - The CV data object to search
 * @returns Array of all placeholder matches found
 */
export const detectPlaceholdersInCV = (cvData: unknown): PlaceholderMatch[] => {
  if (!cvData || typeof cvData !== 'object') return [];
  
  const allMatches: PlaceholderMatch[] = [];
  const cvObject = cvData as Record<string, unknown>;
  
  // Check different sections of the CV
  const sections = [
    'personalInfo',
    'summary',
    'experience',
    'education', 
    'skills',
    'projects',
    'certifications',
    'achievements',
    'volunteer',
    'languages',
    'interests'
  ];
  
  sections.forEach(sectionName => {
    if (cvObject[sectionName]) {
      const sectionMatches = detectPlaceholdersInObject(
        cvObject[sectionName], 
        sectionName
      );
      allMatches.push(...sectionMatches);
    }
  });
  
  return allMatches;
};

/**
 * Groups placeholders by section for better organization
 * @param matches - Array of placeholder matches
 * @returns Object with placeholders grouped by section
 */
export const groupPlaceholdersBySection = (matches: PlaceholderMatch[]) => {
  return matches.reduce((acc, match) => {
    if (!acc[match.section]) {
      acc[match.section] = [];
    }
    acc[match.section].push(match);
    return acc;
  }, {} as Record<string, PlaceholderMatch[]>);
};

/**
 * Gets a summary of placeholders found
 * @param matches - Array of placeholder matches
 * @returns Summary object with counts and sections
 */
export const getPlaceholderSummary = (matches: PlaceholderMatch[]) => {
  const grouped = groupPlaceholdersBySection(matches);
  const sectionsWithPlaceholders = Object.keys(grouped);
  const totalCount = matches.length;
  const uniquePlaceholders = [...new Set(matches.map(m => m.text))];
  
  return {
    totalCount,
    uniqueCount: uniquePlaceholders.length,
    sectionsAffected: sectionsWithPlaceholders,
    sectionsCount: sectionsWithPlaceholders.length,
    grouped,
    uniquePlaceholders
  };
};

/**
 * Checks if CV data contains any placeholders
 * @param cvData - The CV data to check
 * @returns True if placeholders are found, false otherwise
 */
export const hasPlaceholders = (cvData: unknown): boolean => {
  const matches = detectPlaceholdersInCV(cvData);
  return matches.length > 0;
};