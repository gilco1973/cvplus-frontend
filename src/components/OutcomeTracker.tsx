/**
 * Outcome Tracker Component
 * 
 * Frontend component for tracking user job application outcomes.
 * Integrates with Firebase functions to collect ML training data.
 */

import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

// Define types locally since they're not available elsewhere
interface UserOutcome {
  id?: string;
  outcomeId?: string;
  applicationData: {
    applicationDate: Date;
    jobTitle: string;
    company: string;
    industry: string;
    location: string;
    applicationMethod: string;
    currency: string;
    jobDescription?: string;
    salaryPosted?: {
      min?: number;
      max?: number;
      currency: string;
    };
  };
  finalResult?: {
    status?: string;
  };
  cvData?: {
    cvVersion?: string;
    atsScore?: number;
    optimizationsApplied?: string[];
  };
}

interface OutcomeEvent {
  eventType: string;
  stage: string;
}

interface OutcomeTrackerProps {
  className?: string;
  onOutcomeTracked?: (outcomeId: string) => void;
}

interface UserStats {
  totalApplications: number;
  hired: number;
  pending: number;
  successRate: number;
  averageTimeToResult: number;
  averageAtsScore: number;
}

interface StatsResponse {
  success: boolean;
  data: UserStats;
}

interface OutcomeResponse {
  success: boolean;
  outcomeId: string;
}

interface ApplicationFormData {
  jobTitle: string;
  company: string;
  industry: string;
  location: string;
  applicationMethod: 'direct' | 'job_board' | 'recruiter' | 'referral' | 'cold_outreach';
  jobDescription?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
}

interface OutcomeUpdateData {
  eventType: OutcomeEvent['eventType'];
  stage: OutcomeEvent['stage'];
  details?: string;
  finalStatus?: string;
  salaryOffered?: number;
  feedback?: string;
}

export const OutcomeTracker: React.FC<OutcomeTrackerProps> = ({
  className = '',
  onOutcomeTracked
}) => {
  const [activeTab, setActiveTab] = useState<'track' | 'update' | 'stats'>('track');
  const [loading, setLoading] = useState(false);
  const [outcomes, setOutcomes] = useState<UserOutcome[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);

  // Form states
  const [applicationForm, setApplicationForm] = useState<ApplicationFormData>({
    jobTitle: '',
    company: '',
    industry: 'Technology',
    location: '',
    applicationMethod: 'direct',
    currency: 'USD'
  });

  const [updateForm, setUpdateForm] = useState<OutcomeUpdateData>({
    eventType: 'application_viewed',
    stage: 'application'
  });

  const [selectedOutcome, setSelectedOutcome] = useState<string>('');

  useEffect(() => {
    loadUserOutcomes();
    loadUserStats();
  }, []);

  const loadUserOutcomes = async () => {
    try {
      // Load user's tracked outcomes from Firestore
      // Implementation would query user_outcomes collection
      setOutcomes([]);
    } catch (error) {
      console.error('Failed to load outcomes:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const getUserStats = httpsCallable(functions, 'getUserOutcomeStats');
      const result = await getUserStats();
      const data = result.data as StatsResponse;
      
      if (data?.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleTrackApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trackOutcome = httpsCallable(functions, 'trackUserOutcome');
      
      const outcomeData: Partial<UserOutcome> = {
        applicationData: {
          applicationDate: new Date(),
          jobTitle: applicationForm.jobTitle,
          company: applicationForm.company,
          industry: applicationForm.industry,
          location: applicationForm.location,
          applicationMethod: applicationForm.applicationMethod,
          currency: applicationForm.currency,
          jobDescription: applicationForm.jobDescription,
          salaryPosted: (applicationForm.salaryMin || applicationForm.salaryMax) ? {
            min: applicationForm.salaryMin,
            max: applicationForm.salaryMax,
            currency: applicationForm.currency
          } : undefined
        },
        cvData: {
          cvVersion: 'current', // Would get from current CV state
          atsScore: 85, // Would get from latest analysis
          optimizationsApplied: [] // Would get from applied optimizations
        }
      };

      const result = await trackOutcome({
        ...outcomeData,
        sessionId: Date.now().toString()
      });

      const data = result.data as OutcomeResponse;
      if (data?.success) {
        setApplicationForm({
          jobTitle: '',
          company: '',
          industry: 'Technology',
          location: '',
          applicationMethod: 'direct',
          currency: 'USD'
        });
        
        await loadUserOutcomes();
        onOutcomeTracked?.(data.outcomeId);
        
        showNotification('Application tracked successfully! We\'ll follow up to track your progress.', 'success');
      }
    } catch (error) {
      console.error('Failed to track application:', error);
      showNotification('Failed to track application. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutcome) return;

    setLoading(true);

    try {
      const updateOutcome = httpsCallable(functions, 'updateUserOutcome');
      
      const updateData: {
        outcomeId: string;
        sessionId: string;
        event?: {
          eventType: string;
          stage: string;
          details?: string;
        };
        finalResult?: {
          status: string;
          salaryOffered?: number;
          feedback?: string;
        };
      } = {
        outcomeId: selectedOutcome,
        sessionId: Date.now().toString()
      };

      // Add event data
      if (updateForm.eventType && updateForm.stage) {
        updateData.event = {
          eventType: updateForm.eventType,
          stage: updateForm.stage,
          details: updateForm.details
        };
      }

      // Add final result if outcome is complete
      if (updateForm.finalStatus && ['hired', 'rejected', 'withdrawn'].includes(updateForm.finalStatus)) {
        updateData.finalResult = {
          status: updateForm.finalStatus,
          salaryOffered: updateForm.salaryOffered,
          feedback: updateForm.feedback
        };
      }

      const result = await updateOutcome(updateData);
      const data = result.data as OutcomeResponse;

      if (data?.success) {
        setUpdateForm({
          eventType: 'application_viewed',
          stage: 'application'
        });
        setSelectedOutcome('');
        
        await loadUserOutcomes();
        showNotification('Outcome updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to update outcome:', error);
      showNotification('Failed to update outcome. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Implementation would show toast notification
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('track')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'track'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Track Application
          </button>
          <button
            onClick={() => setActiveTab('update')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'update'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Update Status
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'stats'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Stats
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'track' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Track New Job Application
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Track your job applications to help us improve our success predictions and provide you with personalized insights.
            </p>

            <form onSubmit={handleTrackApplication} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicationForm.jobTitle}
                    onChange={(e) => setApplicationForm({ ...applicationForm, jobTitle: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicationForm.company}
                    onChange={(e) => setApplicationForm({ ...applicationForm, company: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Google"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    value={applicationForm.industry}
                    onChange={(e) => setApplicationForm({ ...applicationForm, industry: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Education">Education</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Legal">Legal</option>
                    <option value="Manufacturing">Manufacturing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={applicationForm.location}
                    onChange={(e) => setApplicationForm({ ...applicationForm, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Method
                  </label>
                  <select
                    value={applicationForm.applicationMethod}
                    onChange={(e) => setApplicationForm({ ...applicationForm, applicationMethod: e.target.value as ApplicationFormData['applicationMethod'] })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="direct">Company Website</option>
                    <option value="job_board">Job Board (LinkedIn, Indeed, etc.)</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="referral">Referral</option>
                    <option value="cold_outreach">Cold Outreach</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Range (Optional)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={applicationForm.salaryMin || ''}
                      onChange={(e) => setApplicationForm({ ...applicationForm, salaryMin: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={applicationForm.salaryMax || ''}
                      onChange={(e) => setApplicationForm({ ...applicationForm, salaryMax: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Max"
                    />
                    <select
                      value={applicationForm.currency}
                      onChange={(e) => setApplicationForm({ ...applicationForm, currency: e.target.value })}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description (Optional)
                </label>
                <textarea
                  rows={4}
                  value={applicationForm.jobDescription || ''}
                  onChange={(e) => setApplicationForm({ ...applicationForm, jobDescription: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste the job description here to help improve our matching algorithms..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {loading ? 'Tracking Application...' : 'Track Application'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'update' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Application Status
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Keep us updated on your application progress to help improve our predictions.
            </p>

            <form onSubmit={handleUpdateOutcome} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Application
                </label>
                <select
                  value={selectedOutcome}
                  onChange={(e) => setSelectedOutcome(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose an application...</option>
                  {outcomes.map((outcome) => (
                    <option key={outcome.outcomeId} value={outcome.outcomeId}>
                      {outcome.applicationData.jobTitle} at {outcome.applicationData.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={updateForm.eventType}
                    onChange={(e) => setUpdateForm({ ...updateForm, eventType: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="application_viewed">Application Viewed</option>
                    <option value="phone_screening">Phone Screening</option>
                    <option value="technical_interview">Technical Interview</option>
                    <option value="onsite_interview">Onsite Interview</option>
                    <option value="final_interview">Final Interview</option>
                    <option value="reference_check">Reference Check</option>
                    <option value="offer_received">Offer Received</option>
                    <option value="offer_accepted">Offer Accepted</option>
                    <option value="offer_declined">Offer Declined</option>
                    <option value="rejection_received">Rejection Received</option>
                    <option value="no_response">No Response</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage
                  </label>
                  <select
                    value={updateForm.stage}
                    onChange={(e) => setUpdateForm({ ...updateForm, stage: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="application">Application</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="decision">Decision</option>
                    <option value="offer">Offer</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {updateForm.eventType === 'offer_received' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Offered (Optional)
                  </label>
                  <input
                    type="number"
                    value={updateForm.salaryOffered || ''}
                    onChange={(e) => setUpdateForm({ ...updateForm, salaryOffered: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 120000"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={updateForm.details || ''}
                  onChange={(e) => setUpdateForm({ ...updateForm, details: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional details about this update..."
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedOutcome}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Application Statistics
            </h3>

            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
                  <div className="text-sm text-gray-600">Hired</div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {(stats.successRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {stats.averageTimeToResult.toFixed(0)} days
                  </div>
                  <div className="text-sm text-gray-600">Avg. Time to Result</div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.averageAtsScore.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg. ATS Score</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading statistics...</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutcomeTracker;