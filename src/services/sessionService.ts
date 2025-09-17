// SessionService - High-level session operations and queries
import { 
  collection, 
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  DocumentData,
  Query,
  CollectionReference
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import SessionManager from './sessionManager';
import type {
  SessionState,
  SessionSearchCriteria,
  SessionMetrics,
  ResumeSessionOptions,
  CVStep
} from '../types/session';

export class SessionService {
  private sessionManager: SessionManager;

  constructor() {
    this.sessionManager = SessionManager.getInstance();
  }

  // High-level session operations
  public async findResumableSessions(userId?: string): Promise<SessionState[]> {
    const criteria: SessionSearchCriteria = {
      userId: userId || auth.currentUser?.uid,
      status: ['draft', 'in_progress', 'paused'],
      canResume: true,
      orderBy: 'lastActiveAt',
      orderDirection: 'desc',
      limit: 10
    };

    return this.searchSessions(criteria);
  }

  public async searchSessions(criteria: SessionSearchCriteria): Promise<SessionState[]> {
    const sessions: SessionState[] = [];
    
    // Search in Firestore if user is authenticated
    if (auth.currentUser) {
      const firestoreSessions = await this.searchFirestoreSessions(criteria);
      sessions.push(...firestoreSessions);
    }

    // Search in localStorage
    const localSessions = this.searchLocalSessions(criteria);
    sessions.push(...localSessions);

    // Remove duplicates and apply criteria
    const uniqueSessions = this.deduplicateSessions(sessions);
    return this.applyCriteria(uniqueSessions, criteria);
  }

  private async searchFirestoreSessions(criteria: SessionSearchCriteria): Promise<SessionState[]> {
    if (!auth.currentUser) return [];

    try {
      const collectionRef = collection(db, 'users', auth.currentUser.uid, 'sessions');
      let q: Query<DocumentData> = collectionRef as Query<DocumentData>;
      
      // Apply filters
      if (criteria.status?.length) {
        q = query(q, where('status', 'in', criteria.status));
      }
      
      if (criteria.canResume !== undefined) {
        q = query(q, where('canResume', '==', criteria.canResume));
      }

      if (criteria.hasJobId !== undefined) {
        if (criteria.hasJobId) {
          q = query(q, where('jobId', '!=', null));
        } else {
          q = query(q, where('jobId', '==', null));
        }
      }

      // Apply ordering
      if (criteria.orderBy) {
        const direction = criteria.orderDirection || 'desc';
        q = query(q, orderBy(criteria.orderBy, direction));
      }

      // Apply limit
      if (criteria.limit) {
        q = query(q, firestoreLimit(criteria.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        // Type assertion with proper object type check
        const sessionData = (data && typeof data === 'object') ? data as Record<string, any> : {};
        return {
          ...sessionData,
          sessionId: doc.id,
          createdAt: sessionData.createdAt?.toDate() || new Date(),
          lastActiveAt: sessionData.lastActiveAt?.toDate() || new Date(),
          lastSyncAt: sessionData.lastSyncAt?.toDate()
        };
      }) as SessionState[];
    } catch (error) {
      console.error('Error searching Firestore sessions:', error);
      return [];
    }
  }

  private searchLocalSessions(criteria: SessionSearchCriteria): SessionState[] {
    // Suppress unused parameter warning  
    void criteria;
    const sessions: SessionState[] = [];
    
    try {
      // Get all session keys from localStorage
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('cvplus_session_')
      );

      for (const key of keys) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const session = JSON.parse(data);
            sessions.push({
              ...session,
              createdAt: new Date(session.createdAt),
              lastActiveAt: new Date(session.lastActiveAt),
              lastSyncAt: session.lastSyncAt ? new Date(session.lastSyncAt) : undefined
            });
          }
        } catch (error) {
          console.warn(`Error parsing session ${key}:`, error);
        }
      }
    } catch (error) {
      console.error('Error searching local sessions:', error);
    }

    return sessions;
  }

  private deduplicateSessions(sessions: SessionState[]): SessionState[] {
    const seen = new Set<string>();
    return sessions.filter(session => {
      if (seen.has(session.sessionId)) {
        return false;
      }
      seen.add(session.sessionId);
      return true;
    });
  }

  private applyCriteria(sessions: SessionState[], criteria: SessionSearchCriteria): SessionState[] {
    let filtered = sessions;

    // Filter by userId
    if (criteria.userId) {
      filtered = filtered.filter(session => session.userId === criteria.userId);
    }

    // Filter by status
    if (criteria.status?.length) {
      filtered = filtered.filter(session => criteria.status!.includes(session.status));
    }

    // Filter by date range
    if (criteria.dateRange) {
      filtered = filtered.filter(session => {
        const sessionDate = session.createdAt;
        return sessionDate >= criteria.dateRange!.from && 
               sessionDate <= criteria.dateRange!.to;
      });
    }

    // Filter by steps
    if (criteria.steps?.length) {
      filtered = filtered.filter(session => 
        criteria.steps!.some(step => 
          session.completedSteps.includes(step) || session.currentStep === step
        )
      );
    }

    // Filter by hasJobId
    if (criteria.hasJobId !== undefined) {
      filtered = filtered.filter(session => 
        criteria.hasJobId ? !!session.jobId : !session.jobId
      );
    }

    // Filter by canResume
    if (criteria.canResume !== undefined) {
      filtered = filtered.filter(session => session.canResume === criteria.canResume);
    }

    // Apply ordering
    if (criteria.orderBy) {
      const direction = criteria.orderDirection || 'desc';
      filtered.sort((a, b) => {
        const aValue = a[criteria.orderBy!];
        const bValue = b[criteria.orderBy!];
        
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (criteria.limit) {
      filtered = filtered.slice(0, criteria.limit);
    }

    return filtered;
  }

  // Resume session with options
  public async resumeSessionWithOptions(
    sessionId: string, 
    options?: Partial<ResumeSessionOptions>
  ): Promise<{ session: SessionState; resumeUrl: string }> {
    const defaultOptions: ResumeSessionOptions = {
      navigateToStep: true,
      restoreFormData: true,
      showConfirmationDialog: false,
      mergeWithCurrentState: false,
      clearOldSession: false,
      showProgressIndicator: true,
      animateTransitions: true
    };

    const finalOptions = { ...defaultOptions, ...(options || {}) };
    
    // Resume the session
    const session = await this.sessionManager.resumeSession(sessionId);
    if (!session) {
      throw new Error('Failed to resume session');
    }

    // Generate resume URL based on current step
    const resumeUrl = this.generateResumeUrl(session);

    // Clear old session if requested
    if (finalOptions.clearOldSession && session.jobId) {
      await this.sessionManager.deleteSession(sessionId);
    }

    return { session, resumeUrl };
  }

  private generateResumeUrl(session: SessionState): string {
    const baseUrl = window.location.origin;
    
    switch (session.currentStep) {
      case 'upload':
        return `${baseUrl}/`;
      case 'processing':
        return `${baseUrl}/process/${session.jobId || session.sessionId}`;
      case 'analysis':
        return `${baseUrl}/analysis/${session.jobId || session.sessionId}`;
      case 'features':
        return `${baseUrl}/features/${session.jobId || session.sessionId}`;
      case 'templates':
        return `${baseUrl}/templates/${session.jobId || session.sessionId}`;
      case 'preview':
        return `${baseUrl}/preview/${session.jobId || session.sessionId}`;
      case 'results':
        return `${baseUrl}/results/${session.jobId || session.sessionId}`;
      case 'keywords':
        return `${baseUrl}/keywords/${session.jobId || session.sessionId}`;
      default:
        return `${baseUrl}/`;
    }
  }

  // Session cleanup operations
  public async cleanupExpiredSessions(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredSessions = await this.searchSessions({
      dateRange: { from: new Date(0), to: thirtyDaysAgo },
      orderBy: 'lastActiveAt',
      orderDirection: 'asc'
    });

    let cleanedCount = 0;
    for (const session of expiredSessions) {
      const deleted = await this.sessionManager.deleteSession(session.sessionId);
      if (deleted) cleanedCount++;
    }

    return cleanedCount;
  }

  public async getSessionMetrics(): Promise<SessionMetrics> {
    const allSessions = await this.searchSessions({
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });

    const now = Date.now();
    // Suppress unused variable warning
    void now;
    const totalSessions = allSessions.length;
    const completedSessions = allSessions.filter(s => s.status === 'completed').length;
    const resumedSessions = allSessions.filter(s => s.completedSteps.length > 1).length;

    // Calculate average session duration
    const sessionsWithDuration = allSessions.filter(s => s.lastActiveAt && s.createdAt);
    const totalDuration = sessionsWithDuration.reduce((sum, session) => {
      return sum + (session.lastActiveAt.getTime() - session.createdAt.getTime());
    }, 0);
    const averageSessionDuration = sessionsWithDuration.length > 0 
      ? totalDuration / sessionsWithDuration.length 
      : 0;

    // Calculate average steps completed
    const totalStepsCompleted = allSessions.reduce((sum, session) => 
      sum + session.completedSteps.length, 0
    );
    const averageStepsCompleted = totalSessions > 0 
      ? totalStepsCompleted / totalSessions 
      : 0;

    // Find most common exit step
    const exitStepCounts = allSessions.reduce((counts, session) => {
      if (session.status !== 'completed') {
        counts[session.currentStep] = (counts[session.currentStep] || 0) + 1;
      }
      return counts;
    }, {} as Record<CVStep, number>);

    const mostCommonExitStep = Object.entries(exitStepCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as CVStep || 'upload';

    // Find most resumed step
    const resumeStepCounts = allSessions.reduce((counts, session) => {
      if (session.completedSteps.length > 0) {
        const resumedFrom = session.completedSteps[session.completedSteps.length - 1];
        counts[resumedFrom] = (counts[resumedFrom] || 0) + 1;
      }
      return counts;
    }, {} as Record<CVStep, number>);

    const mostResumedStep = Object.entries(resumeStepCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as CVStep || 'upload';

    return {
      totalSessions,
      completedSessions,
      resumedSessions,
      averageSessionDuration,
      averageStepsCompleted,
      syncSuccessRate: 95, // Placeholder - would be calculated from actual sync data
      errorRate: 5, // Placeholder - would be calculated from actual error data
      mostCommonExitStep,
      mostResumedStep
    };
  }

  // Quick session operations
  public async createQuickSession(jobId?: string): Promise<string> {
    const session = await this.sessionManager.createSession({
      quickCreate: true
    });

    if (jobId) {
      await this.sessionManager.updateSession(session.sessionId, { jobId });
    }

    return session.sessionId;
  }

  public async linkSessionToJob(sessionId: string, jobId: string): Promise<boolean> {
    const updated = await this.sessionManager.updateSession(sessionId, { jobId });
    return !!updated;
  }
}

export default SessionService;