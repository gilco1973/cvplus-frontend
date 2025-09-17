import { 
  detectPlaceholdersInText, 
  detectPlaceholdersInObject, 
  detectPlaceholdersInCV,
  hasPlaceholders,
  getPlaceholderSummary,
  groupPlaceholdersBySection 
} from '../placeholderDetection';

describe('Placeholder Detection', () => {
  describe('detectPlaceholdersInText', () => {
    it('should detect INSERT placeholders', () => {
      const text = 'I have [INSERT NUMBER] years of experience.';
      const result = detectPlaceholdersInText(text);
      expect(result).toEqual(['[INSERT NUMBER]']);
    });

    it('should detect ADD placeholders', () => {
      const text = 'Increased performance by [ADD PERCENTAGE]%.';
      const result = detectPlaceholdersInText(text);
      expect(result).toEqual(['[ADD PERCENTAGE]']);
    });

    it('should detect multiple placeholders', () => {
      const text = 'Led [INSERT TEAM SIZE] team to deliver [INSERT VALUE] in [INSERT TIMEFRAME].';
      const result = detectPlaceholdersInText(text);
      expect(result).toEqual(['[INSERT TEAM SIZE]', '[INSERT VALUE]', '[INSERT TIMEFRAME]']);
    });

    it('should handle case-insensitive detection', () => {
      const text = 'Used [insert tool] and [ADD percentage]% improvement.';
      const result = detectPlaceholdersInText(text);
      expect(result).toEqual(['[insert tool]', '[ADD percentage]']);
    });

    it('should return empty array for text without placeholders', () => {
      const text = 'This is normal text without any placeholders.';
      const result = detectPlaceholdersInText(text);
      expect(result).toEqual([]);
    });

    it('should handle null or undefined input', () => {
      expect(detectPlaceholdersInText(null as unknown)).toEqual([]);
      expect(detectPlaceholdersInText(undefined as unknown)).toEqual([]);
      expect(detectPlaceholdersInText('')).toEqual([]);
    });
  });

  describe('detectPlaceholdersInObject', () => {
    it('should detect placeholders in simple object', () => {
      const obj = {
        title: 'Software Engineer',
        description: 'Led [INSERT TEAM SIZE] developers to build [INSERT PRODUCT].'
      };
      const result = detectPlaceholdersInObject(obj, 'experience');
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('[INSERT TEAM SIZE]');
      expect(result[0].section).toBe('experience');
    });

    it('should detect placeholders in nested arrays', () => {
      const obj = {
        jobs: [
          {
            title: 'Developer',
            achievements: ['Built [INSERT PRODUCT]', 'Improved by [ADD PERCENTAGE]%']
          }
        ]
      };
      const result = detectPlaceholdersInObject(obj, 'experience');
      expect(result).toHaveLength(2);
    });

    it('should handle deep nesting', () => {
      const obj = {
        level1: {
          level2: {
            level3: 'Deep placeholder: [INSERT VALUE]'
          }
        }
      };
      const result = detectPlaceholdersInObject(obj, 'test');
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('[INSERT VALUE]');
    });
  });

  describe('detectPlaceholdersInCV', () => {
    it('should detect placeholders across multiple CV sections', () => {
      const cvData = {
        personalInfo: {
          name: 'John Doe',
          email: '[INSERT EMAIL]'
        },
        summary: 'Experienced professional with [INSERT NUMBER] years of experience.',
        experience: [
          {
            title: 'Senior Developer',
            description: 'Led team of [INSERT TEAM SIZE] developers.'
          }
        ],
        skills: {
          technical: ['JavaScript', '[INSERT FRAMEWORK]']
        }
      };

      const result = detectPlaceholdersInCV(cvData);
      expect(result).toHaveLength(4);
      
      // Check sections are correctly identified
      const sections = result.map(r => r.section);
      expect(sections).toContain('personalInfo');
      expect(sections).toContain('summary');
      expect(sections).toContain('experience');
      expect(sections).toContain('skills');
    });

    it('should return empty array for CV without placeholders', () => {
      const cvData = {
        personalInfo: { name: 'John Doe', email: 'john@example.com' },
        summary: 'Experienced software developer.',
        experience: [{ title: 'Developer', description: 'Built web applications.' }]
      };

      const result = detectPlaceholdersInCV(cvData);
      expect(result).toEqual([]);
    });

    it('should handle null or undefined CV data', () => {
      expect(detectPlaceholdersInCV(null)).toEqual([]);
      expect(detectPlaceholdersInCV(undefined)).toEqual([]);
    });
  });

  describe('hasPlaceholders', () => {
    it('should return true when placeholders exist', () => {
      const cvData = {
        summary: 'Has [INSERT NUMBER] years experience.'
      };
      expect(hasPlaceholders(cvData)).toBe(true);
    });

    it('should return false when no placeholders exist', () => {
      const cvData = {
        summary: 'Has 5 years experience.'
      };
      expect(hasPlaceholders(cvData)).toBe(false);
    });
  });

  describe('getPlaceholderSummary', () => {
    it('should provide correct summary statistics', () => {
      const matches = [
        { text: '[INSERT NUMBER]', location: 'summary', section: 'summary' },
        { text: '[INSERT NUMBER]', location: 'experience[0]', section: 'experience' },
        { text: '[ADD PERCENTAGE]', location: 'experience[0]', section: 'experience' }
      ];

      const summary = getPlaceholderSummary(matches);
      
      expect(summary.totalCount).toBe(3);
      expect(summary.uniqueCount).toBe(2); // [INSERT NUMBER] appears twice
      expect(summary.sectionsCount).toBe(2);
      expect(summary.sectionsAffected).toEqual(['summary', 'experience']);
    });
  });

  describe('groupPlaceholdersBySection', () => {
    it('should group placeholders correctly by section', () => {
      const matches = [
        { text: '[INSERT NUMBER]', location: 'summary', section: 'summary' },
        { text: '[INSERT TEAM]', location: 'experience[0]', section: 'experience' },
        { text: '[ADD PERCENTAGE]', location: 'experience[1]', section: 'experience' }
      ];

      const grouped = groupPlaceholdersBySection(matches);
      
      expect(Object.keys(grouped)).toEqual(['summary', 'experience']);
      expect(grouped.summary).toHaveLength(1);
      expect(grouped.experience).toHaveLength(2);
    });
  });
});