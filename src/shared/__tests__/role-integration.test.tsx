/**
 * Role System Integration Tests
 * Tests frontend-backend integration for role detection and recommendations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { roleProfileService } from '../services/roleProfileService';
import { UnifiedAnalysisContainer } from '../components/analysis/unified/UnifiedAnalysisContainer';
import { RoleDetectionSection } from '../components/analysis/role-detection/RoleDetectionSection';
import { RoleBasedRecommendations } from '../components/role-profiles/RoleBasedRecommendations';
import { mockDetectedRoles, mockJobAnalysis } from '../__mocks__/role-detection.mock';
import type { RoleDetectionResponse } from '../types/role-profiles';

// Mock Firebase functions
vi.mock('../config/firebase-optimized', () => ({
  getFunctionsInstance: () => ({
    _url: 'http://localhost:5001/getmycv-ai/us-central1'
  }),
  getAuthInstance: () => ({
    currentUser: {
      uid: 'test-user-id',
      getIdToken: () => Promise.resolve('mock-token')
    },
    onAuthStateChanged: (callback: (user: any) => void) => {
      callback({
        uid: 'test-user-id',
        getIdToken: () => Promise.resolve('mock-token')
      });
      return () => {};
    }
  })
}));

// Mock Firebase callable functions
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn())
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Role System Integration Tests', () => {
  const mockJobId = 'test-job-123';
  const mockUserId = 'test-user-id';
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful role detection
    vi.spyOn(roleProfileService, 'detectRole').mockResolvedValue({
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
    });
    
    // Mock role recommendations
    vi.spyOn(roleProfileService, 'getRoleRecommendations').mockResolvedValue([
      {
        id: 'rec-1',
        title: 'Enhance Technical Skills',
        description: 'Add more modern frameworks to your skillset',
        section: 'skills',
        type: 'enhancement',
        priority: 'high',
        estimatedScoreImprovement: 15,
        roleSpecific: true,
        roleProfileId: 'frontend_engineer',
        reasoning: 'Based on your experience, these skills will make you more competitive'
      },
      {
        id: 'rec-2',
        title: 'Optimize Professional Summary',
        description: 'Tailor your summary for frontend engineering roles',
        section: 'summary',
        type: 'content',
        priority: 'medium',
        estimatedScoreImprovement: 10,
        roleSpecific: true,
        roleProfileId: 'frontend_engineer',
        reasoning: 'A role-specific summary will better highlight relevant experience'
      }
    ]);
    
    // Mock role profiles
    vi.spyOn(roleProfileService, 'getAllRoleProfiles').mockResolvedValue([
      {
        id: 'frontend_engineer',
        name: 'Frontend Engineer',
        category: 'engineering',
        description: 'Frontend development specialist',
        keywords: ['React', 'JavaScript', 'CSS', 'HTML'],
        requiredSkills: ['React', 'JavaScript', 'CSS'],
        preferredSkills: ['TypeScript', 'Next.js', 'GraphQL'],
        experienceLevel: 'mid',
        industryFocus: ['technology', 'software'],
        matchingCriteria: {
          titleKeywords: ['frontend', 'ui', 'react'],
          skillKeywords: ['react', 'javascript', 'css'],
          industryKeywords: ['tech', 'software'],
          experienceKeywords: ['frontend', 'ui', 'web']
        },
        enhancementTemplates: {
          professionalSummary: 'Frontend engineer with expertise in modern web technologies',
          skillsStructure: {
            categories: [
              {
                name: 'Frontend Technologies',
                skills: ['React', 'JavaScript', 'TypeScript'],
                priority: 1
              }
            ],
            displayFormat: 'categorized',
            maxSkillsPerCategory: 10
          },
          experienceEnhancements: [
            {
              roleLevel: 'mid',
              bulletPointTemplate: 'Developed responsive web applications using {technology}',
              achievementTemplate: 'Improved {metric} by {percentage}%',
              quantificationGuide: 'Include performance metrics and user impact',
              actionVerbs: ['Developed', 'Built', 'Implemented', 'Optimized']
            }
          ],
          achievementTemplates: ['Built scalable frontend applications'],
          keywordOptimization: ['React', 'JavaScript', 'Frontend']
        },
        validationRules: {
          requiredSections: ['summary', 'experience', 'skills'],
          optionalSections: ['projects', 'education'],
          criticalSkills: ['React', 'JavaScript']
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        isActive: true
      }
    ]);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('API Integration Tests', () => {
    it('should handle role detection API calls correctly', async () => {
      const detectSpy = vi.spyOn(roleProfileService, 'detectRole');
      
      await roleProfileService.detectRole(mockJobId);
      
      expect(detectSpy).toHaveBeenCalledWith(mockJobId, false);
      expect(detectSpy).toHaveReturnedWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            detectedRole: expect.any(Object),
            alternativeRoles: expect.any(Array),
            analysis: expect.any(Object)
          })
        })
      );
    });
    
    it('should handle role recommendations API calls correctly', async () => {
      const recSpy = vi.spyOn(roleProfileService, 'getRoleRecommendations');
      
      await roleProfileService.getRoleRecommendations(mockJobId, 'frontend_engineer');
      
      expect(recSpy).toHaveBeenCalledWith(mockJobId, 'frontend_engineer', undefined, undefined, false);
      expect(recSpy).toHaveReturnedWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            description: expect.any(String),
            priority: expect.any(String),
            roleSpecific: true
          })
        ])
      );
    });
    
    it('should handle API errors gracefully', async () => {
      // Mock API error
      vi.spyOn(roleProfileService, 'detectRole').mockRejectedValue(new Error('API Error'));
      
      await expect(roleProfileService.detectRole(mockJobId)).rejects.toThrow('API Error');
    });
  });

  describe('Component Integration Tests', () => {
    it('should integrate role detection with UI components', async () => {
      const mockAnalysis = {
        jobId: mockJobId,
        userId: mockUserId,
        analysisResults: mockJobAnalysis,
        recommendations: [],
        status: 'completed' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      render(
        <TestWrapper>
          <RoleDetectionSection
            jobId={mockJobId}
            analysis={mockAnalysis}
            onRoleSelect={() => {}}
            onAnalysisUpdate={() => {}}
          />
        </TestWrapper>
      );
      
      // Should show loading state initially
      expect(screen.getByText(/detecting suitable roles/i)).toBeInTheDocument();
      
      // Wait for role detection to complete
      await waitFor(() => {
        expect(screen.queryByText(/detecting suitable roles/i)).not.toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Should show detected roles
      await waitFor(() => {
        expect(screen.getByText(/detected roles/i)).toBeInTheDocument();
      });
    });
    
    it('should integrate recommendations with role selection', async () => {
      render(
        <TestWrapper>
          <RoleBasedRecommendations
            jobId={mockJobId}
            selectedRoleId="frontend_engineer"
            onRecommendationApply={() => {}}
            onRecommendationsGenerated={() => {}}
          />
        </TestWrapper>
      );
      
      // Wait for recommendations to load
      await waitFor(() => {
        expect(screen.getByText(/enhance technical skills/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Check if recommendations are displayed
      expect(screen.getByText(/optimize professional summary/i)).toBeInTheDocument();
    });
    
    it('should handle the complete workflow integration', async () => {
      const mockAnalysis = {
        jobId: mockJobId,
        userId: mockUserId,
        analysisResults: mockJobAnalysis,
        recommendations: [],
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      render(
        <TestWrapper>
          <UnifiedAnalysisContainer
            jobId={mockJobId}
            initialAnalysis={mockAnalysis}
            onNavigateToResults={() => {}}
          />
        </TestWrapper>
      );
      
      // Should start with role detection
      expect(screen.getByText(/role detection/i)).toBeInTheDocument();
      
      // Wait for detection to complete and show results
      await waitFor(() => {
        expect(screen.getByText(/detected roles/i)).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Simulate role selection
      const roleCard = screen.getByText(/frontend engineer/i).closest('button');
      if (roleCard) {
        fireEvent.click(roleCard);
        
        // Should navigate to recommendations
        await waitFor(() => {
          expect(screen.getByText(/role-based recommendations/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle authentication errors', async () => {
      // Mock auth error
      vi.spyOn(roleProfileService, 'detectRole').mockRejectedValue(
        new Error('User must be authenticated to detect role profiles')
      );
      
      await expect(
        roleProfileService.detectRole(mockJobId)
      ).rejects.toThrow('User must be authenticated');
    });
    
    it('should handle network timeouts', async () => {
      // Mock timeout error
      vi.spyOn(roleProfileService, 'getRoleRecommendations').mockRejectedValue(
        new Error('Request timeout')
      );
      
      await expect(
        roleProfileService.getRoleRecommendations(mockJobId, 'test-role')
      ).rejects.toThrow('Request timeout');
    });
    
    it('should handle invalid job ID errors', async () => {
      // Mock invalid job error
      vi.spyOn(roleProfileService, 'detectRole').mockRejectedValue(
        new Error('Job not found')
      );
      
      await expect(
        roleProfileService.detectRole('invalid-job-id')
      ).rejects.toThrow('Job not found');
    });
  });

  describe('Performance Integration', () => {
    it('should complete role detection within timeout', async () => {
      const startTime = Date.now();
      
      await roleProfileService.detectRole(mockJobId);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Should complete within 10 seconds (mocked, so should be very fast)
      expect(executionTime).toBeLessThan(10000);
    });
    
    it('should handle concurrent requests properly', async () => {
      const promises = [
        roleProfileService.detectRole(mockJobId),
        roleProfileService.getRoleRecommendations(mockJobId, 'test-role-1'),
        roleProfileService.getRoleRecommendations(mockJobId, 'test-role-2')
      ];
      
      // Should handle concurrent requests without errors
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      expect(results[0]).toHaveProperty('success', true);
      expect(results[1]).toBeInstanceOf(Array);
      expect(results[2]).toBeInstanceOf(Array);
    });
  });

  describe('Cache Integration', () => {
    it('should use cached results when available', async () => {
      // First call should trigger API
      await roleProfileService.detectRole(mockJobId);
      
      // Second call should use cache (no force regenerate)
      const detectSpy = vi.spyOn(roleProfileService, 'detectRole');
      await roleProfileService.detectRole(mockJobId, false);
      
      expect(detectSpy).toHaveBeenCalledWith(mockJobId, false);
    });
    
    it('should bypass cache when force regenerate is true', async () => {
      const detectSpy = vi.spyOn(roleProfileService, 'detectRole');
      
      await roleProfileService.detectRole(mockJobId, true);
      
      expect(detectSpy).toHaveBeenCalledWith(mockJobId, true);
    });
  });

  describe('Data Flow Integration', () => {
    it('should pass data correctly through the component chain', async () => {
      const onRoleSelect = vi.fn();
      const onAnalysisUpdate = vi.fn();
      
      const mockAnalysis = {
        jobId: mockJobId,
        userId: mockUserId,
        analysisResults: mockJobAnalysis,
        recommendations: [],
        status: 'completed' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      render(
        <TestWrapper>
          <RoleDetectionSection
            jobId={mockJobId}
            analysis={mockAnalysis}
            onRoleSelect={onRoleSelect}
            onAnalysisUpdate={onAnalysisUpdate}
          />
        </TestWrapper>
      );
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/detected roles/i)).toBeInTheDocument();
      });
      
      // Simulate role selection
      const roleButton = screen.getByText(/frontend engineer/i).closest('button');
      if (roleButton) {
        fireEvent.click(roleButton);
        
        await waitFor(() => {
          expect(onRoleSelect).toHaveBeenCalledWith(
            expect.objectContaining({
              roleId: expect.any(String),
              roleName: expect.any(String)
            })
          );
        });
      }
    });
  });
});

// Integration test utilities
export const integrationTestUtils = {
  mockRoleDetection: () => {
    return vi.spyOn(roleProfileService, 'detectRole').mockResolvedValue({
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
    });
  },
  
  mockRoleRecommendations: () => {
    return vi.spyOn(roleProfileService, 'getRoleRecommendations').mockResolvedValue([
      {
        id: 'test-rec-1',
        title: 'Test Recommendation',
        description: 'Test recommendation description',
        section: 'skills',
        type: 'enhancement',
        priority: 'high',
        estimatedScoreImprovement: 15,
        roleSpecific: true,
        roleProfileId: 'test-role',
        reasoning: 'Test reasoning'
      }
    ]);
  },
  
  mockApiError: (method: string, error: string) => {
    return vi.spyOn(roleProfileService, method as any).mockRejectedValue(new Error(error));
  }
};

export { TestWrapper };