import { diffWords, diffSentences, Change } from 'diff';
import type { CVParsedData, CVExperienceItem, CVEducationItem, CVCertificationItem, CVProjectItem, CVLanguageItem } from '../../types/cvData';

export interface DiffResult {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

export interface SectionComparison {
  sectionName: string;
  before: string;
  after: string;
  changes: DiffResult[];
  hasChanges: boolean;
}

export interface CVComparison {
  sections: SectionComparison[];
  totalChanges: number;
  improvementSummary: {
    sectionsModified: string[];
    newSections: string[];
    enhancedContent: string[];
  };
}

/**
 * Creates a diff between two text strings with word-level granularity
 */
export function createTextDiff(before: string, after: string): DiffResult[] {
  if (!before && !after) return [];
  
  // Handle cases where one text is empty
  if (!before) {
    return [{ type: 'added', value: after }];
  }
  if (!after) {
    return [{ type: 'removed', value: before }];
  }

  const changes = diffWords(before, after);
  
  return changes.map((change: Change): DiffResult => {
    if (change.added) {
      return { type: 'added', value: change.value };
    } else if (change.removed) {
      return { type: 'removed', value: change.value };
    } else {
      return { type: 'unchanged', value: change.value };
    }
  });
}

/**
 * Creates a sentence-level diff for longer content
 */
export function createSentenceDiff(before: string, after: string): DiffResult[] {
  if (!before && !after) return [];
  
  if (!before) {
    return [{ type: 'added', value: after }];
  }
  if (!after) {
    return [{ type: 'removed', value: before }];
  }

  const changes = diffSentences(before, after);
  
  return changes.map((change: Change): DiffResult => {
    if (change.added) {
      return { type: 'added', value: change.value };
    } else if (change.removed) {
      return { type: 'removed', value: change.value };
    } else {
      return { type: 'unchanged', value: change.value };
    }
  });
}

/**
 * Extracts comparable text content from CV data for a specific section
 */
export function extractSectionText(data: CVParsedData, sectionKey: string): string {
  if (!data) return '';

  switch (sectionKey) {
    case 'personalInfo':
      return [
        data.personalInfo?.name || '',
        data.personalInfo?.email || '',
        data.personalInfo?.phone || '',
        data.personalInfo?.address || '',
        data.personalInfo?.linkedin || '',
        data.personalInfo?.github || '',
        data.personalInfo?.website || ''
      ].filter(Boolean).join(' | ');

    case 'summary':
      return data.summary || '';

    case 'experience':
      return (data.experience || []).map((exp: CVExperienceItem) => 
        [
          exp.company || '',
          exp.position || exp.role || '',
          exp.duration || '',
          exp.description || '',
          (exp.achievements || []).join('. '),
          (exp.technologies || []).join(', ')
        ].filter(Boolean).join('\n')
      ).join('\n\n');

    case 'education':
      return (data.education || []).map((edu: CVEducationItem) =>
        [
          edu.institution || '',
          edu.degree || '',
          edu.field || '',
          edu.year || '',
          edu.gpa || '',
          Array.isArray(edu.honors) ? edu.honors.join(', ') : (edu.honors || ''),
          edu.description || ''
        ].filter(Boolean).join('\n')
      ).join('\n\n');

    case 'skills':
      if (Array.isArray(data.skills)) {
        return data.skills.join(', ');
      } else if (data.skills) {
        return [
          data.skills.technical?.join(', ') || '',
          data.skills.soft?.join(', ') || '',
          data.skills.languages?.join(', ') || '',
          data.skills.tools?.join(', ') || ''
        ].filter(Boolean).join(' | ');
      }
      return '';

    case 'achievements':
      return (data.achievements || []).join('\n');

    case 'certifications':
      return (data.certifications || []).map((cert: CVCertificationItem) =>
        [cert.name, cert.issuer, cert.date].filter(Boolean).join(' - ')
      ).join('\n');

    case 'projects':
      return (data.projects || []).map((proj: CVProjectItem) =>
        [
          proj.name || '',
          proj.description || '',
          (proj.technologies || []).join(', '),
          proj.url || ''
        ].filter(Boolean).join('\n')
      ).join('\n\n');

    case 'languages':
      return (data.languages || []).map((lang: CVLanguageItem) =>
        `${lang.language} (${lang.proficiency})`
      ).join(', ');

    case 'customSections':
      if (data.customSections) {
        return Object.entries(data.customSections)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n\n');
      }
      return '';

    default:
      return '';
  }
}

/**
 * Compares two CV datasets and generates section-by-section comparisons
 */
export function compareCV(originalData: CVParsedData, improvedData: CVParsedData): CVComparison {
  const sections: SectionComparison[] = [];
  const sectionsModified: string[] = [];
  const newSections: string[] = [];
  const enhancedContent: string[] = [];

  // Define sections to compare
  const sectionKeys = [
    'personalInfo',
    'summary', 
    'experience',
    'education',
    'skills',
    'achievements',
    'certifications',
    'projects',
    'languages',
    'customSections'
  ];

  for (const sectionKey of sectionKeys) {
    const beforeText = extractSectionText(originalData, sectionKey);
    const afterText = extractSectionText(improvedData, sectionKey);

    // Skip empty sections
    if (!beforeText && !afterText) continue;

    // Check if this is a new section
    if (!beforeText && afterText) {
      newSections.push(sectionKey);
    }

    // Create diff
    const changes = beforeText.length > 200 
      ? createSentenceDiff(beforeText, afterText)
      : createTextDiff(beforeText, afterText);

    const hasChanges = changes.some(change => change.type !== 'unchanged');

    if (hasChanges) {
      sectionsModified.push(sectionKey);
      
      // Check if content was significantly enhanced
      const addedContent = changes
        .filter(change => change.type === 'added')
        .map(change => change.value)
        .join('');
      
      if (addedContent.length > beforeText.length * 0.3) {
        enhancedContent.push(sectionKey);
      }
    }

    sections.push({
      sectionName: sectionKey,
      before: beforeText,
      after: afterText,
      changes,
      hasChanges
    });
  }

  return {
    sections: sections.filter(section => section.before || section.after),
    totalChanges: sectionsModified.length,
    improvementSummary: {
      sectionsModified,
      newSections,
      enhancedContent
    }
  };
}

/**
 * Generates a human-readable section name
 */
export function getSectionDisplayName(sectionKey: string): string {
  const displayNames: Record<string, string> = {
    personalInfo: 'Personal Information',
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    achievements: 'Key Achievements',
    certifications: 'Certifications',
    projects: 'Projects',
    languages: 'Languages',
    customSections: 'Additional Sections'
  };

  return displayNames[sectionKey] || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
}

/**
 * Calculates improvement statistics
 */
export function calculateImprovementStats(comparison: CVComparison | null) {
  if (!comparison) {
    return {
      totalSections: 0,
      modifiedSections: 0,
      newSections: 0,
      enhancedSections: 0,
      improvementPercentage: 0
    };
  }

  const stats = {
    totalSections: comparison.sections?.length || 0,
    modifiedSections: comparison.improvementSummary?.sectionsModified?.length || 0,
    newSections: comparison.improvementSummary?.newSections?.length || 0,
    enhancedSections: comparison.improvementSummary?.enhancedContent?.length || 0,
    improvementPercentage: 0
  };

  if (stats.totalSections > 0) {
    stats.improvementPercentage = Math.round(
      ((stats.modifiedSections + stats.newSections) / stats.totalSections) * 100
    );
  }

  return stats;
}