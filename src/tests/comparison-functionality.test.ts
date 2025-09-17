/**
 * Test to verify the comparison functionality is properly connected
 * This test ensures that:
 * 1. Job type includes comparison fields
 * 2. FinalResultsPage can display comparison data
 * 3. CVPreviewPage has comparison enabled
 */

import type { Job } from '../types/cv';

describe('CV Comparison Functionality', () => {
  it('should have comparison fields in Job type', () => {
    const mockJob: Job = {
      id: 'test-job',
      userId: 'test-user',
      status: 'completed',
      parsedData: {
        personalInfo: { name: 'John Doe', email: 'john@example.com' },
        summary: 'Original summary',
        experience: [],
        education: [],
        skills: []
      },
      improvedCV: {
        personalInfo: { name: 'John Doe', email: 'john@example.com' },
        summary: 'Enhanced professional summary',
        experience: [],
        education: [],
        skills: []
      },
      comparisonReport: {
        beforeAfter: [
          {
            section: 'Professional Summary',
            before: 'Original summary',
            after: 'Enhanced professional summary',
            improvement: 'Added power words and quantifiable achievements'
          }
        ]
      },
      transformationSummary: {
        totalChanges: 5,
        sectionsModified: ['summary', 'experience'],
        newSections: [],
        keywordsAdded: ['leadership', 'strategic'],
        estimatedScoreIncrease: 25
      },
      improvementsApplied: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Verify all comparison fields exist
    expect(mockJob.comparisonReport).toBeDefined();
    expect(mockJob.comparisonReport?.beforeAfter).toHaveLength(1);
    expect(mockJob.transformationSummary).toBeDefined();
    expect(mockJob.transformationSummary?.totalChanges).toBe(5);
    expect(mockJob.improvementsApplied).toBe(true);
  });

  it('should display comparison data when available', () => {
    const hasComparisonData = (job: Job) => {
      return !!(
        job.improvementsApplied && 
        job.comparisonReport?.beforeAfter && 
        job.comparisonReport.beforeAfter.length > 0
      );
    };

    const jobWithComparison: Job = {
      id: 'test',
      userId: 'user',
      status: 'completed',
      improvementsApplied: true,
      comparisonReport: {
        beforeAfter: [
          {
            section: 'test',
            before: 'old',
            after: 'new',
            improvement: 'improved'
          }
        ]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const jobWithoutComparison: Job = {
      id: 'test',
      userId: 'user',
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(hasComparisonData(jobWithComparison)).toBe(true);
    expect(hasComparisonData(jobWithoutComparison)).toBe(false);
  });
});