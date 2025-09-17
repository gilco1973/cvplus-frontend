/**
 * User Journey Tracker Service Placeholder
 *
 * This is a placeholder implementation for the admin module to maintain independence.
 */

export interface UserJourneyData {
  sessionId: string;
  userId?: string;
  steps: JourneyStep[];
  duration: number;
  completed: boolean;
}

export interface JourneyStep {
  stepId: string;
  timestamp: Date;
  action: string;
  page: string;
  duration: number;
}

class UserJourneyTrackerService {
  async trackStep(stepData: Partial<JourneyStep>): Promise<void> {
    console.log('Tracking journey step:', stepData);
  }

  async getJourneyData(sessionId: string): Promise<UserJourneyData | null> {
    return {
      sessionId,
      steps: [],
      duration: 0,
      completed: false
    };
  }

  async getActiveJourneys(): Promise<UserJourneyData[]> {
    return [];
  }
}

export default new UserJourneyTrackerService();