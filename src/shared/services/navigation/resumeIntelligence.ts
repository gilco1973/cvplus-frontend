// Resume Intelligence - Smart resume point detection and recommendations
import {
  EnhancedSessionState,
  ResumeRecommendation,
  ActionRecommendation,
  AlternativeResumeOption,
  CVStep
} from '../../types/session';

export interface SessionAnalysis {
  completionRate: number;
  blockers: string[];
  strengths: string[];
  timeSpent: number;
  lastActivity: Date;
}

export class ResumeIntelligence {
  
  public async suggestOptimalResumePoint(session: EnhancedSessionState): Promise<ResumeRecommendation> {
    const analysis = this.analyzeSessionState(session);
    const recommendations = this.generateResumeRecommendations(session, analysis);

    const optimal = recommendations.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    return optimal;
  }

  public async getNextRecommendedActions(session: EnhancedSessionState): Promise<ActionRecommendation[]> {
    const actions: ActionRecommendation[] = [];

    // Current step incomplete substeps
    const currentStepProgress = session.stepProgress[session.currentStep];
    if (currentStepProgress) {
      const incompleteSubsteps = currentStepProgress.substeps.filter(s => s.status !== 'completed');
      
      for (const substep of incompleteSubsteps) {
        actions.push({
          id: `complete_${substep.id}`,
          type: 'complete_section',
          title: `Complete ${substep.name}`,
          description: `Finish the ${substep.name} section to progress further`,
          priority: substep.status === 'in_progress' ? 'high' : 'medium',
          estimatedTime: 5,
          requiredSteps: [substep.id],
          benefits: ['Progress tracking', 'Session continuity']
        });
      }
    }

    // Recommended features
    const disabledFeatures = Object.values(session.featureStates).filter(f => !f.enabled);
    for (const feature of disabledFeatures.slice(0, 3)) {
      if (this.shouldRecommendFeature(feature, session)) {
        actions.push({
          id: `enable_${feature.featureId}`,
          type: 'enable_feature',
          title: `Enable ${feature.featureId}`,
          description: `Add ${feature.featureId} to enhance your CV`,
          priority: feature.userPreferences?.recommended ? 'high' : 'low',
          estimatedTime: feature.metadata?.estimatedDuration || 3,
          requiredSteps: feature.dependencies,
          benefits: this.getFeatureBenefits(feature.featureId)
        });
      }
    }

    // Validation issues
    const validationIssues = this.getValidationIssues(session);
    for (const issue of validationIssues) {
      actions.push({
        id: `fix_${issue.field}`,
        type: 'fix_error',
        title: `Fix ${issue.field}`,
        description: issue.errors.join(', '),
        priority: 'critical',
        estimatedTime: 2,
        requiredSteps: [issue.field],
        benefits: ['Validation compliance', 'Better results']
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  public identifySkippableSteps(session: EnhancedSessionState): CVStep[] {
    const skippableSteps: CVStep[] = [];

    const stepAnalysis = {
      keywords: {
        skippable: session.currentStep !== 'keywords' && 
                  session.completedSteps.includes('analysis'),
        reason: 'Keywords can be optimized later'
      },
      features: {
        skippable: Object.values(session.featureStates).some(f => f.enabled && f.progress.completed),
        reason: 'Basic features are already configured'
      }
    };

    for (const [step, analysis] of Object.entries(stepAnalysis)) {
      if (analysis.skippable) {
        skippableSteps.push(step as CVStep);
      }
    }

    return skippableSteps;
  }

  private analyzeSessionState(session: EnhancedSessionState): SessionAnalysis {
    return {
      completionRate: this.calculateCompletionPercentage(session) / 100,
      blockers: this.identifyCriticalIssues(session),
      strengths: this.identifySessionStrengths(session),
      timeSpent: this.calculateTotalTimeSpent(session),
      lastActivity: session.lastActiveAt
    };
  }

  private generateResumeRecommendations(
    session: EnhancedSessionState, 
    analysis: SessionAnalysis
  ): ResumeRecommendation[] {
    const recommendations: ResumeRecommendation[] = [];

    // Continue from current step
    recommendations.push({
      recommendedStep: session.currentStep,
      reason: 'Continue from where you left off',
      timeToComplete: 5,
      confidence: 0.9,
      priority: 'high',
      alternativeOptions: [],
      requiredData: [],
      warnings: []
    });

    // Skip to next logical step if current is nearly complete
    const currentProgress = session.stepProgress[session.currentStep];
    if (currentProgress && currentProgress.completion > 80) {
      const nextStep = this.getNextStep(session.currentStep);
      if (nextStep) {
        recommendations.push({
          recommendedStep: nextStep,
          reason: 'Current step is mostly complete, continue to next',
          timeToComplete: 4,
          confidence: 0.75,
          priority: 'medium',
          alternativeOptions: [],
          requiredData: [],
          warnings: []
        });
      }
    }

    return recommendations;
  }

  private shouldRecommendFeature(feature: any, session: EnhancedSessionState): boolean {
    return !feature.enabled && 
           feature.dependencies.every((dep: string) => session.featureStates[dep]?.enabled);
  }

  private getFeatureBenefits(featureId: string): string[] {
    const benefits: Record<string, string[]> = {
      'podcast-generation': ['Unique audio CV format', 'Stand out to employers'],
      'video-introduction': ['Personal connection', 'Showcase personality'],
      'skills-visualization': ['Visual impact', 'Easy skill assessment']
    };
    
    return benefits[featureId] || ['Enhanced CV presentation'];
  }

  private getValidationIssues(session: EnhancedSessionState): any[] {
    return session.validationResults.globalValidations.filter(v => !v.valid);
  }

  private calculateCompletionPercentage(session: EnhancedSessionState): number {
    const mainSteps: CVStep[] = ['upload', 'processing', 'analysis', 'features', 'templates', 'preview', 'results'];
    const completedMainSteps = mainSteps.filter(step => session.completedSteps.includes(step));
    
    let baseCompletion = (completedMainSteps.length / mainSteps.length) * 80;
    
    const currentStepProgress = session.stepProgress[session.currentStep];
    if (currentStepProgress) {
      baseCompletion += (currentStepProgress.completion / 100) * (80 / mainSteps.length);
    }

    if (session.completedSteps.includes('keywords')) baseCompletion += 10;
    
    const enabledFeatures = Object.values(session.featureStates).filter(f => f.enabled);
    baseCompletion += Math.min(enabledFeatures.length * 2, 10);

    return Math.min(baseCompletion, 100);
  }

  private identifyCriticalIssues(session: EnhancedSessionState): string[] {
    const issues: string[] = [];

    const validationIssues = this.getValidationIssues(session);
    if (validationIssues.length > 0) {
      issues.push(`${validationIssues.length} validation errors need fixing`);
    }

    const failedCheckpoints = session.processingCheckpoints.filter(cp => cp.state === 'failed');
    if (failedCheckpoints.length > 0) {
      issues.push(`${failedCheckpoints.length} processing operations failed`);
    }

    return issues;
  }

  private identifySessionStrengths(session: EnhancedSessionState): string[] {
    const strengths: string[] = [];
    
    const enabledFeatures = Object.values(session.featureStates).filter(f => f.enabled);
    if (enabledFeatures.length > 3) {
      strengths.push('Rich feature selection');
    }

    const completionRate = this.calculateCompletionPercentage(session);
    if (completionRate > 70) {
      strengths.push('High completion rate');
    }

    return strengths;
  }

  private calculateTotalTimeSpent(session: EnhancedSessionState): number {
    return Object.values(session.stepProgress).reduce((total, progress) => 
      total + progress.timeSpent, 0
    );
  }

  private getNextStep(currentStep: CVStep): CVStep | null {
    const stepOrder: CVStep[] = ['upload', 'processing', 'analysis', 'features', 'templates', 'preview', 'results'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    return currentIndex >= 0 && currentIndex < stepOrder.length - 1 
      ? stepOrder[currentIndex + 1] 
      : null;
  }
}