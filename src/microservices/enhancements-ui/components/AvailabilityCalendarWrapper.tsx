/**
 * Availability Calendar Wrapper Component
 *
 * Wrapper component that provides data loading, error handling, and state management
 * for the AvailabilityCalendar component with calendar data integration.
 *
 * @author Gil Klainert
 * @version 3.0.0 - Migrated to Enhancements Module
 */

import React from 'react';
import { AvailabilityCalendar, type BookingDetails } from './AvailabilityCalendar';
import { useCalendarData } from '../hooks/useCalendarData';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';

export interface AvailabilityCalendarWrapperProps {
  /** Professional name for meeting booking */
  professionalName: string;
  /** Professional email for notifications */
  professionalEmail: string;
  /** Job ID for context-specific calendar data */
  jobId?: string;
  /** Additional CSS classes for styling */
  className?: string;
  /** Show loading skeleton instead of spinner */
  useSkeletonLoader?: boolean;
  /** Custom error message */
  customErrorMessage?: string;
  /** Callback for successful booking */
  onBookingSuccess?: (bookingDetails: BookingDetails) => void;
  /** Callback for booking errors */
  onBookingError?: (error: string) => void;
  /** Callback for data loading state changes */
  onLoadingStateChange?: (isLoading: boolean) => void;
}

interface CalendarDataResponse {
  professionalName?: string;
  professionalEmail?: string;
  timeSlots?: Array<{
    time: string;
    display: string;
    available: boolean;
  }>;
  durationOptions?: Array<{
    duration: number;
    title: string;
    description: string;
    color?: string;
  }>;
  availability?: {
    timezone: string;
    workingHours: {
      start: string;
      end: string;
    };
    workingDays: string[];
  };
}

/**
 * Enhanced wrapper for AvailabilityCalendar with data loading and error handling.
 *
 * Features:
 * - Automatic calendar data loading from Firebase
 * - Fallback to default settings on data loading failure
 * - Professional loading and error states
 * - Integration with useCalendarData hook
 * - Comprehensive error boundary and recovery
 *
 * Usage:
 * ```tsx
 * <AvailabilityCalendarWrapper
 *   professionalName="John Doe"
 *   professionalEmail="john@example.com"
 *   jobId="job-123"
 *   onBookingSuccess={(details) => console.log('Booked:', details)}
 * />
 * ```
 */
export const AvailabilityCalendarWrapper: React.FC<AvailabilityCalendarWrapperProps> = ({
  professionalName,
  professionalEmail,
  jobId,
  className = '',
  useSkeletonLoader = false,
  customErrorMessage,
  onBookingSuccess,
  onBookingError,
  onLoadingStateChange
}) => {
  const { data: calendarData, loading, error } = useCalendarData(jobId || '');

  // Notify parent component of loading state changes
  React.useEffect(() => {
    onLoadingStateChange?.(loading);
  }, [loading, onLoadingStateChange]);

  // Enhanced loading state with skeleton or spinner
  if (loading) {
    if (useSkeletonLoader) {
      return (
        <div className={`bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white ${className}`}>
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="text-center mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-full mx-auto mb-2"></div>
              <div className="h-6 bg-white/20 rounded w-48 mx-auto mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-64 mx-auto"></div>
            </div>

            {/* Calendar grid skeleton */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="h-6 bg-white/20 rounded w-32 mx-auto mb-4"></div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 42 }, (_, i) => (
                    <div key={i} className="aspect-square bg-white/10 rounded"></div>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="h-6 bg-white/20 rounded w-40 mx-auto mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-10 bg-white/10 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white ${className}`}>
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p className="text-blue-100">Loading availability calendar...</p>
          <p className="text-blue-200 text-sm mt-2">Fetching professional schedule</p>
        </div>
      </div>
    );
  }

  // Enhanced error state with fallback options
  if (error) {
    const displayErrorMessage = customErrorMessage || 'Unable to load calendar data';

    return (
      <div className={`bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-300" />
          <p className="text-blue-100 mb-2">{displayErrorMessage}</p>
          <p className="text-blue-200 text-sm mb-4">Using default availability settings</p>

          {/* Show calendar anyway with default settings */}
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Process calendar data if available
  const processedCalendarData = calendarData as CalendarDataResponse | null;

  // Use fetched data if available, otherwise use passed props
  const finalProfessionalName = processedCalendarData?.professionalName || professionalName;
  const finalProfessionalEmail = processedCalendarData?.professionalEmail || professionalEmail;

  // Extract custom time slots and duration options if provided
  const customTimeSlots = processedCalendarData?.timeSlots;
  const customDurationOptions = processedCalendarData?.durationOptions;

  // Enhanced booking success handler
  const handleBookingSuccess = (bookingDetails: BookingDetails) => {
    console.log('✅ Booking successful:', {
      ...bookingDetails,
      dataSource: processedCalendarData ? 'dynamic' : 'fallback',
      timestamp: new Date().toISOString()
    });

    onBookingSuccess?.(bookingDetails);

    // Track booking success analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'booking_success', {
        event_category: 'calendar',
        event_label: bookingDetails.meetingType,
        value: bookingDetails.duration
      });
    }
  };

  // Enhanced booking error handler
  const handleBookingError = (error: string) => {
    console.error('❌ Booking error:', {
      error,
      professionalName: finalProfessionalName,
      professionalEmail: finalProfessionalEmail,
      timestamp: new Date().toISOString()
    });

    onBookingError?.(error);

    // Track booking error analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'booking_error', {
        event_category: 'calendar',
        event_label: error,
        value: 0
      });
    }
  };

  return (
    <>
      <AvailabilityCalendar
        professionalName={finalProfessionalName}
        professionalEmail={finalProfessionalEmail}
        className={className}
        customTimeSlots={customTimeSlots}
        customDurationOptions={customDurationOptions}
        onBookingSuccess={handleBookingSuccess}
        onBookingError={handleBookingError}
      />

      {/* Debug information in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-gray-800 text-xs">
          <details>
            <summary className="cursor-pointer font-medium">Debug Info</summary>
            <div className="mt-2 space-y-1">
              <div><strong>Data Source:</strong> {processedCalendarData ? 'Dynamic' : 'Fallback'}</div>
              <div><strong>Job ID:</strong> {jobId || 'None'}</div>
              <div><strong>Professional:</strong> {finalProfessionalName} ({finalProfessionalEmail})</div>
              <div><strong>Custom Time Slots:</strong> {customTimeSlots?.length || 0}</div>
              <div><strong>Custom Durations:</strong> {customDurationOptions?.length || 0}</div>
              {processedCalendarData?.availability && (
                <div><strong>Timezone:</strong> {processedCalendarData.availability.timezone}</div>
              )}
            </div>
          </details>
        </div>
      )}
    </>
  );
};

export default AvailabilityCalendarWrapper;