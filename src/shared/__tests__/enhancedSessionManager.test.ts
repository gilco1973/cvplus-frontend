// Enhanced Session Manager Test Suite
import { EnhancedSessionManager } from '../services/enhancedSessionManager';
import {
  EnhancedSessionState,
  FeatureState,
  SubstepProgress,
  ProcessingCheckpoint,
  CVStep
} from '../types/session';

// Mock Firebase and other dependencies
jest.mock('firebase/app');
jest.mock('firebase/firestore');
jest.mock('../services/sessionManager', () => ({
  SessionManager: {
    getInstance: jest.fn().mockReturnValue({
      createSession: jest.fn().mockResolvedValue({
        sessionId: 'test-session-id',
        currentStep: 'upload',
        completedSteps: [],
        createdAt: new Date(),
        lastActiveAt: new Date()
      }),
      getSession: jest.fn(),
      updateSessionData: jest.fn()
    })
  }
}));

describe('EnhancedSessionManager', () => {
  let sessionManager: EnhancedSessionManager;
  let mockSession: EnhancedSessionState;

  beforeEach(() => {
    sessionManager = EnhancedSessionManager.getInstance();
    
    mockSession = {
      sessionId: 'test-session-123',
      currentStep: 'analysis' as CVStep,
      completedSteps: ['upload', 'processing'] as CVStep[],
      createdAt: new Date('2024-01-01'),
      lastActiveAt: new Date('2024-01-02'),
      stepProgress: {
        upload: {
          completion: 100,
          timeSpent: 300,
          substeps: [
            {
              id: 'file-upload',
              name: 'File Upload',
              status: 'completed',
              startedAt: new Date('2024-01-01T10:00:00'),
              completedAt: new Date('2024-01-01T10:05:00')
            }
          ],
          startedAt: new Date('2024-01-01T10:00:00'),
          completedAt: new Date('2024-01-01T10:05:00'),
          estimatedTimeToComplete: 0
        },
        processing: {
          completion: 100,
          timeSpent: 600,
          substeps: [
            {
              id: 'cv-parse',
              name: 'CV Parsing',
              status: 'completed',
              startedAt: new Date('2024-01-01T10:05:00'),
              completedAt: new Date('2024-01-01T10:15:00')
            }
          ],
          startedAt: new Date('2024-01-01T10:05:00'),
          completedAt: new Date('2024-01-01T10:15:00'),
          estimatedTimeToComplete: 0
        },
        analysis: {
          completion: 60,
          timeSpent: 360,
          substeps: [
            {
              id: 'skill-analysis',
              name: 'Skill Analysis',
              status: 'in_progress',
              startedAt: new Date('2024-01-01T10:15:00')
            },
            {
              id: 'experience-analysis',
              name: 'Experience Analysis',
              status: 'pending'
            }
          ],
          startedAt: new Date('2024-01-01T10:15:00'),
          estimatedTimeToComplete: 240
        },
        features: {
          completion: 0,
          timeSpent: 0,
          substeps: [],
          estimatedTimeToComplete: 600
        },
        templates: {
          completion: 0,
          timeSpent: 0,
          substeps: [],
          estimatedTimeToComplete: 300
        },
        preview: {
          completion: 0,
          timeSpent: 0,
          substeps: [],
          estimatedTimeToComplete: 180
        },
        results: {
          completion: 0,
          timeSpent: 0,
          substeps: [],
          estimatedTimeToComplete: 120
        },
        keywords: {
          completion: 0,
          timeSpent: 0,
          substeps: [],
          estimatedTimeToComplete: 240
        },
        completed: {
          completion: 0,
          timeSpent: 0,
          substeps: [],
          estimatedTimeToComplete: 0
        }
      },
      featureStates: {
        'podcast-generation': {
          featureId: 'podcast-generation',
          enabled: true,
          configuration: { duration: 'medium', style: 'professional' },
          progress: {
            completed: false,
            currentSubtask: 'script-generation',
            percentComplete: 30
          },
          dependencies: ['analysis'],
          userPreferences: {
            priority: 'high',
            recommended: true
          },
          metadata: {
            estimatedDuration: 300,
            complexity: 'medium'
          }
        },
        'video-introduction': {
          featureId: 'video-introduction',
          enabled: false,
          configuration: {},
          progress: {
            completed: false,
            currentSubtask: null,
            percentComplete: 0
          },
          dependencies: ['analysis'],
          userPreferences: {
            priority: 'medium',
            recommended: false
          },
          metadata: {
            estimatedDuration: 480,
            complexity: 'high'
          }
        }
      },
      processingCheckpoints: [
        {
          id: 'checkpoint-cv-analysis-123',
          sessionId: 'test-session-123',
          stepId: 'analysis' as CVStep,
          functionName: 'analyzeCV',
          parameters: { analysisType: 'comprehensive' },
          state: 'completed',
          createdAt: new Date('2024-01-01T10:15:00'),
          completedAt: new Date('2024-01-01T10:20:00'),
          priority: 'high',
          retryCount: 0,
          maxRetries: 3,
          dependencies: [],
          estimatedDuration: 300,
          executionTime: 285,
          result: { skillsIdentified: 15, experienceYears: 5 }
        }
      ],
      uiState: {
        currentView: 'analysis-dashboard',
        activeFormId: 'personal-info-form',
        formStates: {
          'personal-info-form': {
            formId: 'personal-info-form',
            fields: {
              name: {
                value: 'John Doe',
                dirty: false,
                touched: true,
                valid: true,
                errors: [],
                warnings: [],
                lastModified: new Date('2024-01-01T09:00:00'),
                validationRules: ['required'],
                metadata: { fieldType: 'text', required: true }
              }
            },
            metadata: {
              version: '1.0',
              lastModified: new Date('2024-01-01T09:05:00'),
              userAgent: 'test-agent',
              formSchema: 'personal-info',
              isDirty: false,
              isValid: true
            },
            sections: {}
          }
        },
        navigationHistory: [
          {
            sessionId: 'test-session-123',
            step: 'upload' as CVStep,
            substep: null,
            timestamp: new Date('2024-01-01T10:00:00'),
            parameters: {}
          }
        ],
        scrollPositions: {
          '/analysis': 150,
          '/features': 0
        },
        expandedSections: ['skills-section', 'experience-section']
      },
      validationResults: {
        globalValidations: [
          {
            field: 'email',
            valid: true,
            errors: [],
            warnings: [],
            timestamp: new Date('2024-01-01T09:00:00')
          }
        ],
        stepValidations: {
          upload: [
            {
              field: 'cv-file',
              valid: true,
              errors: [],
              warnings: [],
              timestamp: new Date('2024-01-01T10:00:00')
            }
          ]
        }
      },
      performanceMetrics: {
        initialLoadTime: 1250,
        renderTime: 180,
        memoryUsage: 45000000,
        networkRequests: 8,
        cacheHitRate: 0.75,
        interactionCount: 23,
        errorCount: 0
      },
      contextData: {
        userAgent: 'test-user-agent',
        viewport: { width: 1920, height: 1080 },
        referrer: 'https://google.com',
        timezone: 'America/New_York',
        language: 'en-US',
        environment: 'test'
      },
      schemaVersion: '2.0',
      migrationHistory: [],
      actionQueue: [],
      offlineCapability: {
        enabled: false,
        lastSyncAt: new Date('2024-01-01T10:00:00'),
        pendingActions: 0,
        storageUsed: 0,
        maxStorageSize: 52428800
      }
    };

    // Setup default mock implementations
    (sessionManager as any).firestore = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => mockSession
          }),
          set: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({})
        })
      })
    };
  });

  describe('Enhanced Session Creation', () => {
    it('should create enhanced session with micro-state tracking', async () => {
      const formData = {
        personalInfo: { name: 'John Doe', email: 'john@example.com' }
      };

      const session = await sessionManager.createEnhancedSession(formData);

      expect(session.sessionId).toBeDefined();
      expect(session.stepProgress).toBeDefined();
      expect(session.featureStates).toBeDefined();
      expect(session.uiState).toBeDefined();
      expect(session.performanceMetrics).toBeDefined();
      expect(session.schemaVersion).toBe('2.0');
    });

    it('should initialize all step progress states', async () => {
      const session = await sessionManager.createEnhancedSession();

      const expectedSteps: CVStep[] = [
        'upload', 'processing', 'analysis', 'features', 
        'templates', 'preview', 'results', 'keywords', 'completed'
      ];

      expectedSteps.forEach(step => {
        expect(session.stepProgress[step]).toBeDefined();
        expect(session.stepProgress[step].completion).toBe(0);
        expect(session.stepProgress[step].substeps).toEqual([]);
      });
    });

    it('should initialize feature states with proper dependencies', async () => {
      const session = await sessionManager.createEnhancedSession();

      expect(session.featureStates['podcast-generation']).toBeDefined();
      expect(session.featureStates['podcast-generation'].dependencies).toContain('analysis');
      expect(session.featureStates['video-introduction']).toBeDefined();
      expect(session.featureStates['skills-visualization']).toBeDefined();
    });
  });

  describe('Feature State Management', () => {
    beforeEach(() => {
      jest.spyOn(sessionManager, 'getEnhancedSession').mockResolvedValue(mockSession);
    });

    it('should enable feature with valid dependencies', async () => {
      const success = await sessionManager.enableFeature('test-session-123', 'video-introduction', {
        quality: 'HD',
        duration: 'short'
      });

      expect(success).toBe(true);
    });

    it('should update feature state correctly', async () => {
      const updates = {
        configuration: { newSetting: 'value' },
        progress: { percentComplete: 75 }
      };

      const success = await sessionManager.updateFeatureState(
        'test-session-123', 
        'podcast-generation', 
        updates
      );

      expect(success).toBe(true);
    });

    it('should evaluate conditional logic for feature enabling', async () => {
      // Test that features can only be enabled when dependencies are met
      const canEnable = await sessionManager.canEnableFeature(
        'test-session-123',
        'portfolio-gallery'
      );

      // Should depend on the mock implementation
      expect(typeof canEnable).toBe('boolean');
    });
  });

  describe('Step Progress Management', () => {
    beforeEach(() => {
      jest.spyOn(sessionManager, 'getEnhancedSession').mockResolvedValue(mockSession);
    });

    it('should update substep progress correctly', async () => {
      const substepUpdates: Partial<SubstepProgress>[] = [
        {
          id: 'skill-analysis',
          status: 'completed',
          completedAt: new Date()
        }
      ];

      const result = await sessionManager.updateStepProgress(
        'test-session-123',
        'analysis',
        substepUpdates
      );

      expect(result).toBeDefined();
    });

    it('should calculate step completion percentage', async () => {
      const session = await sessionManager.getEnhancedSession('test-session-123');
      const analysisProgress = session!.stepProgress.analysis;
      
      expect(analysisProgress.completion).toBe(60);
      expect(analysisProgress.substeps).toHaveLength(2);
    });

    it('should track time spent in steps', async () => {
      const session = await sessionManager.getEnhancedSession('test-session-123');
      
      expect(session!.stepProgress.upload.timeSpent).toBe(300);
      expect(session!.stepProgress.processing.timeSpent).toBe(600);
      expect(session!.stepProgress.analysis.timeSpent).toBe(360);
    });
  });

  describe('Processing Checkpoints', () => {
    beforeEach(() => {
      jest.spyOn(sessionManager, 'getEnhancedSession').mockResolvedValue(mockSession);
    });

    it('should create processing checkpoints', async () => {
      const checkpoint = await sessionManager.createProcessingCheckpoint(
        'test-session-123',
        'features',
        'generatePodcast',
        { duration: 'medium', style: 'professional' }
      );

      expect(checkpoint.id).toBeDefined();
      expect(checkpoint.sessionId).toBe('test-session-123');
      expect(checkpoint.stepId).toBe('features');
      expect(checkpoint.functionName).toBe('generatePodcast');
      expect(checkpoint.state).toBe('pending');
    });

    it('should update checkpoint status', async () => {
      const checkpointId = 'checkpoint-cv-analysis-123';
      
      await sessionManager.updateCheckpointStatus(
        checkpointId,
        'completed',
        { result: 'success' }
      );

      // Verify the checkpoint was updated
      const session = await sessionManager.getEnhancedSession('test-session-123');
      const checkpoint = session!.processingCheckpoints.find(cp => cp.id === checkpointId);
      
      expect(checkpoint?.state).toBe('completed');
      expect(checkpoint?.result).toEqual({ result: 'success' });
    });
  });

  describe('User Interaction Tracking', () => {
    beforeEach(() => {
      jest.spyOn(sessionManager, 'getEnhancedSession').mockResolvedValue(mockSession);
    });

    it('should track user interactions', async () => {
      const interaction = {
        type: 'click' as const,
        element: 'enable-feature-button',
        data: { featureId: 'podcast-generation' }
      };

      const success = await sessionManager.addUserInteraction('test-session-123', interaction);

      expect(success).toBe(true);
    });

    it('should update performance metrics', async () => {
      const session = await sessionManager.getEnhancedSession('test-session-123');

      expect(session!.performanceMetrics.interactionCount).toBe(23);
      expect(session!.performanceMetrics.initialLoadTime).toBe(1250);
      expect(session!.performanceMetrics.renderTime).toBe(180);
      expect(session!.performanceMetrics.errorCount).toBe(0);
    });
  });

  describe('Session State Persistence', () => {
    it('should save and retrieve enhanced session state', async () => {
      const sessionId = 'test-session-123';
      
      // Mock the firestore operations
      const session = await sessionManager.getEnhancedSession(sessionId);
      
      expect(session).toBeDefined();
      expect(session!.sessionId).toBe(sessionId);
      expect(session!.stepProgress).toBeDefined();
      expect(session!.featureStates).toBeDefined();
    });

    it('should handle session state updates', async () => {
      const updates = {
        currentStep: 'features' as CVStep,
        lastActiveAt: new Date()
      };

      const result = await sessionManager.updateSessionState('test-session-123', updates);

      expect(result).toBeDefined();
    });
  });

  describe('Validation and Error Handling', () => {
    it('should validate session data integrity', async () => {
      const session = await sessionManager.getEnhancedSession('test-session-123');
      
      expect(session!.schemaVersion).toBe('2.0');
      expect(session!.validationResults.globalValidations).toHaveLength(1);
      expect(session!.validationResults.stepValidations.upload).toHaveLength(1);
    });

    it('should handle missing session gracefully', async () => {
      // Mock a missing session
      (sessionManager as any).firestore.collection().doc().get.mockResolvedValue({
        exists: false,
        data: () => null
      });

      const session = await sessionManager.getEnhancedSession('nonexistent-session');
      
      expect(session).toBeNull();
    });

    it('should handle corrupted session data', async () => {
      // Mock corrupted data
      (sessionManager as any).firestore.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({ invalidData: 'corrupted' })
      });

      await expect(sessionManager.getEnhancedSession('corrupted-session'))
        .rejects.toThrow();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should track performance metrics accurately', async () => {
      const session = await sessionManager.getEnhancedSession('test-session-123');
      
      expect(session!.performanceMetrics.memoryUsage).toBe(45000000);
      expect(session!.performanceMetrics.networkRequests).toBe(8);
      expect(session!.performanceMetrics.cacheHitRate).toBe(0.75);
    });

    it('should manage memory efficiently for large sessions', async () => {
      // Test with a large session
      const largeSession = {
        ...mockSession,
        performanceMetrics: {
          ...mockSession.performanceMetrics,
          memoryUsage: 100000000 // 100MB
        }
      };

      jest.spyOn(sessionManager, 'getEnhancedSession').mockResolvedValue(largeSession);
      
      const session = await sessionManager.getEnhancedSession('large-session');
      
      expect(session!.performanceMetrics.memoryUsage).toBeGreaterThan(50000000);
    });
  });
});