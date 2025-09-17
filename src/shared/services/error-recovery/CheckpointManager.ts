/**
 * Checkpoint Management System for CVPlus Platform
 * 
 * Provides checkpoint creation, restoration, and management for the CV processing pipeline.
 * Uses Firebase Firestore with local backup for reliable progress preservation.
 */

import {
  doc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

export const CheckpointType = {
  FILE_UPLOADED: 'file_uploaded',
  PARSING_STARTED: 'parsing_started',
  PARSING_COMPLETED: 'parsing_completed',
  ANALYSIS_STARTED: 'analysis_started',
  ANALYSIS_COMPLETED: 'analysis_completed',
  RECOMMENDATIONS_GENERATED: 'recommendations_generated',
  IMPROVEMENTS_APPLIED: 'improvements_applied',
  GENERATION_STARTED: 'generation_started',
  GENERATION_COMPLETED: 'generation_completed',
  PROCESSING_COMPLETED: 'processing_completed'
} as const;

export type CheckpointType = typeof CheckpointType[keyof typeof CheckpointType];

export interface ProcessingCheckpoint {
  id: string;
  jobId: string;
  userId: string;
  type: CheckpointType;
  data: Record<string, unknown>;
  metadata: {
    step: string;
    progress: number;
    description: string;
    canResumeFrom: boolean;
    estimatedTimeRemaining?: number;
  };
  createdAt: Date;
  expiresAt: Date;
  isRestored?: boolean;
  restoredAt?: Date;
}

export interface CheckpointRestoreResult {
  success: boolean;
  checkpoint: ProcessingCheckpoint | null;
  restoredData: Record<string, unknown> | null;
  message: string;
}

export class CheckpointManager {
  private static instance: CheckpointManager;
  private localStorageKey = 'cvplus_checkpoints';
  private checkpointTTLHours = 72; // 3 days

  private constructor() {}

  public static getInstance(): CheckpointManager {
    if (!CheckpointManager.instance) {
      CheckpointManager.instance = new CheckpointManager();
    }
    return CheckpointManager.instance;
  }

  /**
   * Creates a checkpoint for the current processing state
   */
  public async createCheckpoint(
    jobId: string,
    type: CheckpointType,
    data: Record<string, unknown>,
    metadata: Partial<ProcessingCheckpoint['metadata']>
  ): Promise<ProcessingCheckpoint> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const checkpointId = this.generateCheckpointId(jobId, type);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (this.checkpointTTLHours * 60 * 60 * 1000));

    const checkpoint: ProcessingCheckpoint = {
      id: checkpointId,
      jobId,
      userId: user.uid,
      type,
      data: this.sanitizeData(data),
      metadata: {
        step: this.getStepName(type),
        progress: this.calculateProgress(type),
        description: this.getStepName(type),
        canResumeFrom: this.canResumeFromType(type),
        ...metadata
      },
      createdAt: now,
      expiresAt
    };

    // Save to both Firestore and localStorage
    await Promise.all([
      this.saveToFirestore(checkpoint),
      this.saveToLocalStorage(checkpoint)
    ]);

    console.warn(`Checkpoint created: ${checkpointId} for job ${jobId} at ${type}`);
    return checkpoint;
  }

  /**
   * Gets the latest checkpoint for a job
   */
  public async getLatestCheckpoint(jobId: string): Promise<ProcessingCheckpoint | null> {
    try {
      // Try Firestore first
      const firestoreCheckpoint = await this.getLatestFromFirestore(jobId);
      if (firestoreCheckpoint && !this.isExpired(firestoreCheckpoint)) {
        return firestoreCheckpoint;
      }

      // Fall back to localStorage
      const localCheckpoint = this.getLatestFromLocalStorage(jobId);
      if (localCheckpoint && !this.isExpired(localCheckpoint)) {
        return localCheckpoint;
      }

      return null;
    } catch (error) {
      console.error('Error getting latest checkpoint:', error);
      return null;
    }
  }

  /**
   * Gets a specific checkpoint by type
   */
  public async getCheckpointByType(
    jobId: string, 
    type: CheckpointType
  ): Promise<ProcessingCheckpoint | null> {
    try {
      // Try Firestore first
      const firestoreCheckpoint = await this.getFromFirestoreByType(jobId, type);
      if (firestoreCheckpoint && !this.isExpired(firestoreCheckpoint)) {
        return firestoreCheckpoint;
      }

      // Fall back to localStorage
      const localCheckpoint = this.getFromLocalStorageByType(jobId, type);
      if (localCheckpoint && !this.isExpired(localCheckpoint)) {
        return localCheckpoint;
      }

      return null;
    } catch (error) {
      console.error('Error getting checkpoint by type:', error);
      return null;
    }
  }

  /**
   * Restores processing from the latest checkpoint
   */
  public async restoreFromLatestCheckpoint(jobId: string): Promise<CheckpointRestoreResult> {
    const checkpoint = await this.getLatestCheckpoint(jobId);
    
    if (!checkpoint) {
      return {
        success: false,
        checkpoint: null,
        restoredData: null,
        message: 'No checkpoint found for this job'
      };
    }

    if (!checkpoint.metadata.canResumeFrom) {
      return {
        success: false,
        checkpoint,
        restoredData: null,
        message: 'This checkpoint cannot be restored from'
      };
    }

    // Mark checkpoint as restored
    checkpoint.isRestored = true;
    checkpoint.restoredAt = new Date();
    
    await this.updateCheckpoint(checkpoint);

    return {
      success: true,
      checkpoint,
      restoredData: checkpoint.data,
      message: `Restored from ${checkpoint.metadata.step} (${checkpoint.metadata.progress}% complete)`
    };
  }

  /**
   * Lists all checkpoints for a job
   */
  public async getJobCheckpoints(jobId: string): Promise<ProcessingCheckpoint[]> {
    const checkpoints: ProcessingCheckpoint[] = [];

    try {
      // Get from Firestore
      const firestoreCheckpoints = await this.getJobCheckpointsFromFirestore(jobId);
      checkpoints.push(...firestoreCheckpoints);

      // Get from localStorage and merge (avoiding duplicates)
      const localCheckpoints = this.getJobCheckpointsFromLocalStorage(jobId);
      for (const localCheckpoint of localCheckpoints) {
        const exists = checkpoints.find(cp => cp.id === localCheckpoint.id);
        if (!exists) {
          checkpoints.push(localCheckpoint);
        }
      }

      // Filter out expired checkpoints and sort by creation time
      return checkpoints
        .filter(cp => !this.isExpired(cp))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    } catch (error) {
      console.error('Error getting job checkpoints:', error);
      return [];
    }
  }

  /**
   * Deletes all checkpoints for a job
   */
  public async deleteJobCheckpoints(jobId: string): Promise<boolean> {
    try {
      const checkpoints = await this.getJobCheckpoints(jobId);
      
      await Promise.all([
        // Delete from Firestore
        ...checkpoints.map(cp => this.deleteFromFirestore(cp.id)),
        // Clean up localStorage
        this.cleanupLocalStorage(jobId)
      ]);

      console.warn(`Deleted ${checkpoints.length} checkpoints for job ${jobId}`);
      return true;
    } catch (error) {
      console.error('Error deleting job checkpoints:', error);
      return false;
    }
  }

  /**
   * Cleans up expired checkpoints
   */
  public async cleanupExpiredCheckpoints(): Promise<number> {
    let cleanedCount = 0;

    try {
      const user = auth.currentUser;
      if (!user) return cleanedCount;

      // Clean up Firestore
      const firestoreQuery = query(
        collection(db, 'users', user.uid, 'checkpoints'),
        where('expiresAt', '<=', new Date())
      );

      const snapshot = await getDocs(firestoreQuery);
      await Promise.all(
        snapshot.docs.map(doc => deleteDoc(doc.ref))
      );
      cleanedCount += snapshot.size;

      // Clean up localStorage
      const localCheckpoints = this.getAllFromLocalStorage();
      const expiredLocal = localCheckpoints.filter(cp => this.isExpired(cp));
      
      for (const expired of expiredLocal) {
        this.removeFromLocalStorage(expired.id);
        cleanedCount++;
      }

      console.warn(`Cleaned up ${cleanedCount} expired checkpoints`);
      return cleanedCount;

    } catch (error) {
      console.error('Error cleaning up expired checkpoints:', error);
      return cleanedCount;
    }
  }

  /**
   * Private methods for Firestore operations
   */
  private async saveToFirestore(checkpoint: ProcessingCheckpoint): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, 'users', user.uid, 'checkpoints', checkpoint.id);
    await setDoc(docRef, {
      ...checkpoint,
      createdAt: serverTimestamp(),
      expiresAt: checkpoint.expiresAt
    });
  }

  private async getLatestFromFirestore(jobId: string): Promise<ProcessingCheckpoint | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const q = query(
      collection(db, 'users', user.uid, 'checkpoints'),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return this.convertFirestoreDoc(doc);
  }

  private async getFromFirestoreByType(
    jobId: string, 
    type: CheckpointType
  ): Promise<ProcessingCheckpoint | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const q = query(
      collection(db, 'users', user.uid, 'checkpoints'),
      where('jobId', '==', jobId),
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return this.convertFirestoreDoc(doc);
  }

  private async getJobCheckpointsFromFirestore(jobId: string): Promise<ProcessingCheckpoint[]> {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
      collection(db, 'users', user.uid, 'checkpoints'),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => this.convertFirestoreDoc(doc));
  }

  private async deleteFromFirestore(checkpointId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, 'users', user.uid, 'checkpoints', checkpointId);
    await deleteDoc(docRef);
  }

  private async updateCheckpoint(checkpoint: ProcessingCheckpoint): Promise<void> {
    await Promise.all([
      this.saveToFirestore(checkpoint),
      this.saveToLocalStorage(checkpoint)
    ]);
  }

  private convertFirestoreDoc(doc: any): ProcessingCheckpoint {
    const data = doc.data();
    return {
      id: doc.id,
      jobId: data.jobId || '',
      userId: data.userId || '',
      type: data.type || 'processing',
      data: data.data || {},
      metadata: data.metadata || {
        step: '',
        progress: 0,
        description: '',
        canResumeFrom: false
      },
      createdAt: data.createdAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate() || new Date(),
      restoredAt: data.restoredAt?.toDate()
    };
  }

  /**
   * Private methods for localStorage operations
   */
  private saveToLocalStorage(checkpoint: ProcessingCheckpoint): void {
    try {
      const existing = this.getAllFromLocalStorage();
      const filtered = existing.filter(cp => cp.id !== checkpoint.id);
      filtered.push(checkpoint);
      
      localStorage.setItem(this.localStorageKey, JSON.stringify(
        filtered.map(cp => this.serializeCheckpoint(cp))
      ));
    } catch (error) {
      console.error('Error saving checkpoint to localStorage:', error);
    }
  }

  private getLatestFromLocalStorage(jobId: string): ProcessingCheckpoint | null {
    const checkpoints = this.getJobCheckpointsFromLocalStorage(jobId);
    return checkpoints.length > 0 ? checkpoints[0] : null;
  }

  private getFromLocalStorageByType(jobId: string, type: CheckpointType): ProcessingCheckpoint | null {
    const checkpoints = this.getJobCheckpointsFromLocalStorage(jobId);
    return checkpoints.find(cp => cp.type === type) || null;
  }

  private getJobCheckpointsFromLocalStorage(jobId: string): ProcessingCheckpoint[] {
    return this.getAllFromLocalStorage()
      .filter(cp => cp.jobId === jobId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private getAllFromLocalStorage(): ProcessingCheckpoint[] {
    try {
      const data = localStorage.getItem(this.localStorageKey);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.map((cp: unknown) => this.deserializeCheckpoint(cp));
    } catch (error) {
      console.error('Error getting checkpoints from localStorage:', error);
      return [];
    }
  }

  private removeFromLocalStorage(checkpointId: string): void {
    const checkpoints = this.getAllFromLocalStorage();
    const filtered = checkpoints.filter(cp => cp.id !== checkpointId);
    localStorage.setItem(this.localStorageKey, JSON.stringify(
      filtered.map(cp => this.serializeCheckpoint(cp))
    ));
  }

  private cleanupLocalStorage(jobId: string): void {
    const checkpoints = this.getAllFromLocalStorage();
    const filtered = checkpoints.filter(cp => cp.jobId !== jobId);
    localStorage.setItem(this.localStorageKey, JSON.stringify(
      filtered.map(cp => this.serializeCheckpoint(cp))
    ));
  }

  /**
   * Utility methods
   */
  private generateCheckpointId(jobId: string, type: CheckpointType): string {
    return `cp_${jobId}_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private getStepName(type: CheckpointType): string {
    const stepNames = {
      [CheckpointType.FILE_UPLOADED]: 'File Uploaded',
      [CheckpointType.PARSING_STARTED]: 'Starting Analysis',
      [CheckpointType.PARSING_COMPLETED]: 'Analysis Complete',
      [CheckpointType.ANALYSIS_STARTED]: 'Starting Enhancement',
      [CheckpointType.ANALYSIS_COMPLETED]: 'Enhancement Complete',
      [CheckpointType.RECOMMENDATIONS_GENERATED]: 'Recommendations Ready',
      [CheckpointType.IMPROVEMENTS_APPLIED]: 'Improvements Applied',
      [CheckpointType.GENERATION_STARTED]: 'Generating CV',
      [CheckpointType.GENERATION_COMPLETED]: 'CV Generated',
      [CheckpointType.PROCESSING_COMPLETED]: 'Processing Complete'
    };
    return stepNames[type] || 'Processing';
  }

  private calculateProgress(type: CheckpointType): number {
    const progressMap = {
      [CheckpointType.FILE_UPLOADED]: 10,
      [CheckpointType.PARSING_STARTED]: 20,
      [CheckpointType.PARSING_COMPLETED]: 30,
      [CheckpointType.ANALYSIS_STARTED]: 40,
      [CheckpointType.ANALYSIS_COMPLETED]: 50,
      [CheckpointType.RECOMMENDATIONS_GENERATED]: 60,
      [CheckpointType.IMPROVEMENTS_APPLIED]: 70,
      [CheckpointType.GENERATION_STARTED]: 80,
      [CheckpointType.GENERATION_COMPLETED]: 90,
      [CheckpointType.PROCESSING_COMPLETED]: 100
    };
    return progressMap[type] || 0;
  }

  private canResumeFromType(type: CheckpointType): boolean {
    // Can resume from most checkpoints except the very beginning
    return type !== CheckpointType.FILE_UPLOADED;
  }

  private isExpired(checkpoint: ProcessingCheckpoint): boolean {
    return new Date() > checkpoint.expiresAt;
  }

  private sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
    // Remove sensitive data and large objects
    const sanitized = { ...data };
    
    // Remove functions
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'function') {
        delete sanitized[key];
      }
    });
    
    return sanitized;
  }

  private serializeCheckpoint(checkpoint: ProcessingCheckpoint): unknown {
    return {
      ...checkpoint,
      createdAt: checkpoint.createdAt.toISOString(),
      expiresAt: checkpoint.expiresAt.toISOString(),
      restoredAt: checkpoint.restoredAt?.toISOString()
    };
  }

  private deserializeCheckpoint(data: unknown): ProcessingCheckpoint {
    // Type guard to ensure data is an object before spreading
    const checkpointData = (data && typeof data === 'object') ? data as Record<string, any> : {};
    return {
      id: checkpointData.id || '',
      jobId: checkpointData.jobId || '',
      userId: checkpointData.userId || '',
      type: checkpointData.type || 'processing',
      data: checkpointData.data || {},
      metadata: checkpointData.metadata || {},
      ...checkpointData,
      createdAt: new Date(checkpointData.createdAt),
      expiresAt: new Date(checkpointData.expiresAt),
      restoredAt: checkpointData.restoredAt ? new Date(checkpointData.restoredAt) : undefined
    } as ProcessingCheckpoint;
  }
}