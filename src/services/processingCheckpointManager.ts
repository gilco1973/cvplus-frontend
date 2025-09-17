// Processing Checkpoint Manager - Smart checkpointing for resumable processing operations
import { 
  ProcessingCheckpoint,
  ProcessingJob,
  ProcessingQueue,
  CVStep,
  EnhancedSessionState
} from '../types/session';
import { EnhancedSessionManager } from './enhancedSessionManager';

export class ProcessingCheckpointManager {
  private static instance: ProcessingCheckpointManager;
  private enhancedSessionManager: EnhancedSessionManager;
  private activeCheckpoints = new Map<string, ProcessingCheckpoint>();
  private processingQueues = new Map<string, ProcessingQueue>();
  
  private constructor() {
    this.enhancedSessionManager = EnhancedSessionManager.getInstance();
    this.setupCheckpointCleanup();
  }

  public static getInstance(): ProcessingCheckpointManager {
    if (!ProcessingCheckpointManager.instance) {
      ProcessingCheckpointManager.instance = new ProcessingCheckpointManager();
    }
    return ProcessingCheckpointManager.instance;
  }

  // =====================================================================================
  // CHECKPOINT MANAGEMENT
  // =====================================================================================

  public async createCheckpoint(
    sessionId: string,
    stepId: CVStep,
    functionName: string,
    parameters: Record<string, unknown>,
    featureId?: string
  ): Promise<ProcessingCheckpoint> {
    const checkpoint: ProcessingCheckpoint = {
      id: this.generateCheckpointId(),
      stepId,
      featureId,
      timestamp: new Date(),
      state: 'created',
      resumeData: {
        functionName,
        parameters,
        progress: 0
      },
      dependencies: this.extractDependencies(parameters),
      canSkip: this.canSkipCheckpoint(stepId, functionName),
      priority: this.calculatePriority(stepId, functionName),
      performance: {
        startTime: new Date()
      }
    };

    // Store checkpoint in memory
    this.activeCheckpoints.set(checkpoint.id, checkpoint);

    // Save checkpoint to session
    await this.saveCheckpointToSession(sessionId, checkpoint);

    return checkpoint;
  }

  public async updateCheckpoint(
    checkpointId: string,
    updates: Partial<ProcessingCheckpoint>
  ): Promise<ProcessingCheckpoint | null> {
    const checkpoint = this.activeCheckpoints.get(checkpointId);
    if (!checkpoint) return null;

    const updatedCheckpoint = {
      ...checkpoint,
      ...updates,
      timestamp: new Date()
    };

    // Update performance tracking
    if (updates.state === 'completed' && checkpoint.performance) {
      updatedCheckpoint.performance = {
        ...checkpoint.performance,
        endTime: new Date(),
        duration: Date.now() - checkpoint.performance.startTime.getTime()
      };
    }

    this.activeCheckpoints.set(checkpointId, updatedCheckpoint);
    
    // Update in session storage
    await this.updateCheckpointInSession(checkpointId, updatedCheckpoint);

    return updatedCheckpoint;
  }

  public async resumeFromCheckpoint(
    sessionId: string,
    checkpointId: string
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    const session = await this.enhancedSessionManager.getEnhancedSession(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const checkpoint = session.processingCheckpoints.find(cp => cp.id === checkpointId);
    if (!checkpoint) {
      return { success: false, error: 'Checkpoint not found' };
    }

    try {
      // Update checkpoint state
      await this.updateCheckpoint(checkpointId, { state: 'processing' });

      // Execute the resume function
      const result = await this.executeResumeFunction(checkpoint);

      // Mark as completed
      await this.updateCheckpoint(checkpointId, { 
        state: 'completed',
        resumeData: {
          ...checkpoint.resumeData,
          partialResults: result,
          progress: 100
        }
      });

      return { success: true, result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update error recovery information
      const errorRecovery = checkpoint.errorRecovery || {
        retryCount: 0,
        maxRetries: 3,
        lastError: errorMessage
      };

      errorRecovery.retryCount += 1;
      errorRecovery.lastError = errorMessage;

      if (errorRecovery.retryCount < errorRecovery.maxRetries) {
        // Schedule retry
        errorRecovery.nextRetryAt = new Date(Date.now() + this.calculateRetryDelay(errorRecovery.retryCount));
        
        await this.updateCheckpoint(checkpointId, {
          state: 'failed',
          errorRecovery
        });

        // Attempt automatic retry after delay
        setTimeout(() => {
          this.resumeFromCheckpoint(sessionId, checkpointId);
        }, this.calculateRetryDelay(errorRecovery.retryCount));
      } else {
        // Max retries exceeded
        await this.updateCheckpoint(checkpointId, {
          state: 'failed',
          errorRecovery
        });
      }

      return { success: false, error: errorMessage };
    }
  }

  public async getResumableCheckpoints(sessionId: string): Promise<ProcessingCheckpoint[]> {
    const session = await this.enhancedSessionManager.getEnhancedSession(sessionId);
    if (!session) return [];

    return session.processingCheckpoints.filter(checkpoint => 
      checkpoint.state === 'failed' || checkpoint.state === 'created'
    );
  }

  public async clearCompletedCheckpoints(sessionId: string): Promise<number> {
    const session = await this.enhancedSessionManager.getEnhancedSession(sessionId);
    if (!session) return 0;

    const completedCheckpoints = session.processingCheckpoints.filter(cp => cp.state === 'completed');
    const remainingCheckpoints = session.processingCheckpoints.filter(cp => cp.state !== 'completed');

    // Remove from active checkpoints
    completedCheckpoints.forEach(cp => {
      this.activeCheckpoints.delete(cp.id);
    });

    // Update session with only remaining checkpoints
    await this.updateSessionCheckpoints(sessionId, remainingCheckpoints);

    return completedCheckpoints.length;
  }

  // =====================================================================================
  // PROCESSING QUEUE MANAGEMENT
  // =====================================================================================

  public async createProcessingQueue(sessionId: string): Promise<ProcessingQueue> {
    const queue: ProcessingQueue = {
      sessionId,
      jobs: [],
      paused: false,
      processing: false,
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      queuedJobs: 0,
      averageJobDuration: 0,
      successRate: 100,
      createdAt: new Date()
    };

    this.processingQueues.set(sessionId, queue);
    return queue;
  }

  public async addJobToQueue(
    sessionId: string,
    job: Omit<ProcessingJob, 'id' | 'queuedAt'>
  ): Promise<string> {
    let queue = this.processingQueues.get(sessionId);
    if (!queue) {
      queue = await this.createProcessingQueue(sessionId);
    }

    const processingJob: ProcessingJob = {
      ...job,
      id: this.generateJobId(),
      queuedAt: new Date()
    };

    queue.jobs.push(processingJob);
    queue.totalJobs += 1;
    queue.queuedJobs += 1;

    this.processingQueues.set(sessionId, queue);

    // Auto-start processing if not paused and not already processing
    if (!queue.paused && !queue.processing) {
      this.processNextJob(sessionId);
    }

    return processingJob.id;
  }

  public async pauseQueue(sessionId: string): Promise<boolean> {
    const queue = this.processingQueues.get(sessionId);
    if (!queue) return false;

    queue.paused = true;
    this.processingQueues.set(sessionId, queue);
    return true;
  }

  public async resumeQueue(sessionId: string): Promise<boolean> {
    const queue = this.processingQueues.get(sessionId);
    if (!queue) return false;

    queue.paused = false;
    this.processingQueues.set(sessionId, queue);

    // Start processing if not already processing
    if (!queue.processing) {
      this.processNextJob(sessionId);
    }

    return true;
  }

  private async processNextJob(sessionId: string): Promise<void> {
    const queue = this.processingQueues.get(sessionId);
    if (!queue || queue.paused || queue.processing) return;

    // Find next job to process
    const nextJob = this.getNextJob(queue);
    if (!nextJob) return;

    queue.processing = true;
    queue.lastProcessedAt = new Date();
    this.processingQueues.set(sessionId, queue);

    try {
      // Create checkpoint for the job
      const checkpoint = await this.createCheckpoint(
        sessionId,
        'processing',
        `job_${nextJob.type}`,
        nextJob.payload,
        nextJob.id
      );

      // Process the job
      const startTime = Date.now();
      nextJob.startedAt = new Date();
      
      const result = await this.executeJob(nextJob);

      const duration = Date.now() - startTime;
      nextJob.completedAt = new Date();
      nextJob.progress = 100;

      // Update queue statistics
      queue.completedJobs += 1;
      queue.queuedJobs -= 1;
      this.updateQueueMetrics(queue, duration, true);

      // Complete checkpoint
      await this.updateCheckpoint(checkpoint.id, {
        state: 'completed',
        resumeData: {
          ...checkpoint.resumeData,
          partialResults: result,
          progress: 100
        }
      });

      // Remove completed job from queue
      queue.jobs = queue.jobs.filter(job => job.id !== nextJob.id);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      nextJob.lastError = errorMessage;
      nextJob.failedAt = new Date();
      nextJob.retryCount += 1;

      if (nextJob.retryCount < nextJob.maxRetries) {
        // Requeue for retry
        nextJob.queuedAt = new Date(Date.now() + this.calculateRetryDelay(nextJob.retryCount));
      } else {
        // Remove failed job after max retries
        queue.failedJobs += 1;
        queue.queuedJobs -= 1;
        queue.jobs = queue.jobs.filter(job => job.id !== nextJob.id);
        this.updateQueueMetrics(queue, 0, false);
      }
    }

    queue.processing = false;
    this.processingQueues.set(sessionId, queue);

    // Continue processing next job
    setTimeout(() => this.processNextJob(sessionId), 100);
  }

  private getNextJob(queue: ProcessingQueue): ProcessingJob | null {
    // Sort by priority (higher first) and then by queued time
    const availableJobs = queue.jobs
      .filter(job => job.queuedAt <= new Date() && this.areDependenciesMet(job, queue))
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Higher priority first
        }
        return a.queuedAt.getTime() - b.queuedAt.getTime(); // Earlier first
      });

    return availableJobs[0] || null;
  }

  private areDependenciesMet(job: ProcessingJob, queue: ProcessingQueue): boolean {
    return job.dependencies.every(depId => {
      const depJob = queue.jobs.find(j => j.id === depId);
      return !depJob || depJob.completedAt !== undefined;
    });
  }

  private updateQueueMetrics(queue: ProcessingQueue, duration: number, success: boolean): void {
    if (success && duration > 0) {
      const totalDuration = queue.averageJobDuration * queue.completedJobs + duration;
      queue.averageJobDuration = totalDuration / (queue.completedJobs + 1);
    }

    const totalAttempts = queue.completedJobs + queue.failedJobs;
    if (totalAttempts > 0) {
      queue.successRate = (queue.completedJobs / totalAttempts) * 100;
    }
  }

  // =====================================================================================
  // EXECUTION ENGINES
  // =====================================================================================

  private async executeResumeFunction(checkpoint: ProcessingCheckpoint): Promise<unknown> {
    const { functionName, parameters, partialResults, progress } = checkpoint.resumeData;

    // Create execution context
    const context = {
      checkpointId: checkpoint.id,
      stepId: checkpoint.stepId,
      featureId: checkpoint.featureId,
      partialResults,
      progress,
      parameters
    };

    // Route to appropriate function handler
    switch (functionName) {
      case 'processCV':
        return this.executeProcessCV(parameters, context);
      case 'generateFeature':
        return this.executeGenerateFeature(parameters, context);
      case 'analyzeCV':
        return this.executeAnalyzeCV(parameters, context);
      default:
        throw new Error(`Unknown resume function: ${functionName}`);
    }
  }

  private async executeJob(job: ProcessingJob): Promise<unknown> {
    // Route based on job type
    switch (job.type) {
      case 'cv-processing':
        return this.executeCVProcessingJob(job);
      case 'feature-generation':
        return this.executeFeatureGenerationJob(job);
      case 'template-application':
        return this.executeTemplateApplicationJob(job);
      case 'data-extraction':
        return this.executeDataExtractionJob(job);
      case 'analysis':
        return this.executeAnalysisJob(job);
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  // Job execution implementations
  private async executeCVProcessingJob(job: ProcessingJob): Promise<unknown> {
    // Placeholder for CV processing logic
    console.warn('Executing CV processing job:', job.id);
    return { status: 'completed', jobId: job.id };
  }

  private async executeFeatureGenerationJob(job: ProcessingJob): Promise<unknown> {
    // Placeholder for feature generation logic
    console.warn('Executing feature generation job:', job.id);
    return { status: 'completed', jobId: job.id };
  }

  private async executeTemplateApplicationJob(job: ProcessingJob): Promise<unknown> {
    // Placeholder for template application logic
    console.warn('Executing template application job:', job.id);
    return { status: 'completed', jobId: job.id };
  }

  private async executeDataExtractionJob(job: ProcessingJob): Promise<unknown> {
    // Placeholder for data extraction logic
    console.warn('Executing data extraction job:', job.id);
    return { status: 'completed', jobId: job.id };
  }

  private async executeAnalysisJob(job: ProcessingJob): Promise<unknown> {
    // Placeholder for analysis logic
    console.warn('Executing analysis job:', job.id);
    return { status: 'completed', jobId: job.id };
  }

  // Resume function implementations
  private async executeProcessCV(parameters: Record<string, unknown>, context: any): Promise<unknown> {
    // Placeholder for resumable CV processing
    console.warn('Resuming CV processing from checkpoint:', context.checkpointId);
    return { status: 'resumed', context };
  }

  private async executeGenerateFeature(parameters: Record<string, unknown>, context: any): Promise<unknown> {
    // Placeholder for resumable feature generation
    console.warn('Resuming feature generation from checkpoint:', context.checkpointId);
    return { status: 'resumed', context };
  }

  private async executeAnalyzeCV(parameters: Record<string, unknown>, context: any): Promise<unknown> {
    // Placeholder for resumable CV analysis
    console.warn('Resuming CV analysis from checkpoint:', context.checkpointId);
    return { status: 'resumed', context };
  }

  // =====================================================================================
  // UTILITY METHODS
  // =====================================================================================

  private generateCheckpointId(): string {
    return `checkpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractDependencies(parameters: Record<string, unknown>): string[] {
    // Extract dependency information from parameters
    const deps = parameters.dependencies;
    return Array.isArray(deps) ? deps.filter(d => typeof d === 'string') : [];
  }

  private canSkipCheckpoint(stepId: CVStep, functionName: string): boolean {
    // Define which checkpoints can be skipped
    const skippableOperations = ['generatePodcast', 'generateVideoIntroduction'];
    return skippableOperations.includes(functionName);
  }

  private calculatePriority(stepId: CVStep, functionName: string): number {
    // Assign priority based on step and function
    const stepPriorities = {
      upload: 10,
      processing: 9,
      analysis: 8,
      features: 7,
      templates: 6,
      preview: 5,
      results: 4,
      keywords: 3,
      completed: 1
    };

    const basePriority = stepPriorities[stepId] || 5;
    
    // Adjust based on function type
    if (functionName.includes('critical')) return basePriority + 5;
    if (functionName.includes('optional')) return basePriority - 2;
    
    return basePriority;
  }

  private calculateRetryDelay(retryCount: number): number {
    // Exponential backoff: 2^retryCount * 1000ms, capped at 30 seconds
    return Math.min(Math.pow(2, retryCount) * 1000, 30000);
  }

  private async saveCheckpointToSession(sessionId: string, checkpoint: ProcessingCheckpoint): Promise<void> {
    const session = await this.enhancedSessionManager.getEnhancedSession(sessionId);
    if (!session) return;

    session.processingCheckpoints.push(checkpoint);
    await (this.enhancedSessionManager as any).saveEnhancedSession(session);
  }

  private async updateCheckpointInSession(checkpointId: string, checkpoint: ProcessingCheckpoint): Promise<void> {
    // Find session containing this checkpoint
    for (const [sessionId, queue] of this.processingQueues) {
      const session = await this.enhancedSessionManager.getEnhancedSession(sessionId);
      if (!session) continue;

      const index = session.processingCheckpoints.findIndex(cp => cp.id === checkpointId);
      if (index !== -1) {
        session.processingCheckpoints[index] = checkpoint;
        await (this.enhancedSessionManager as any).saveEnhancedSession(session);
        break;
      }
    }
  }

  private async updateSessionCheckpoints(sessionId: string, checkpoints: ProcessingCheckpoint[]): Promise<void> {
    const session = await this.enhancedSessionManager.getEnhancedSession(sessionId);
    if (!session) return;

    session.processingCheckpoints = checkpoints;
    await (this.enhancedSessionManager as any).saveEnhancedSession(session);
  }

  private setupCheckpointCleanup(): void {
    // Clean up completed checkpoints every hour
    setInterval(() => {
      this.cleanupOldCheckpoints();
    }, 60 * 60 * 1000);
  }

  private async cleanupOldCheckpoints(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    for (const [checkpointId, checkpoint] of this.activeCheckpoints) {
      if (checkpoint.state === 'completed' && checkpoint.timestamp < cutoffTime) {
        this.activeCheckpoints.delete(checkpointId);
      }
    }
  }
}

export default ProcessingCheckpointManager;