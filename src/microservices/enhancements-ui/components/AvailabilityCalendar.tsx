/**
 * Availability Calendar Component
 *
 * Professional meeting scheduling calendar with Google Calendar integration,
 * automated email notifications, and comprehensive booking management.
 *
 * @author Gil Klainert
 * @version 3.0.0 - Migrated to Enhancements Module
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, CheckCircle } from 'lucide-react';

export interface AvailabilityCalendarProps {
  /** Professional name for meeting booking */
  professionalName: string;
  /** Professional email for notifications */
  professionalEmail: string;
  /** Additional CSS classes for styling */
  className?: string;
  /** Optional custom time slots */
  customTimeSlots?: TimeSlot[];
  /** Optional custom duration options */
  customDurationOptions?: DurationOption[];
  /** Callback for successful booking */
  onBookingSuccess?: (bookingDetails: BookingDetails) => void;
  /** Callback for booking errors */
  onBookingError?: (error: string) => void;
}

export interface TimeSlot {
  time: string;
  display: string;
  available?: boolean;
}

export interface DurationOption {
  duration: number;
  title: string;
  description: string;
  color?: string;
}

export interface BookingDetails {
  professionalName: string;
  professionalEmail: string;
  selectedDate: Date;
  selectedTime: string;
  duration: number;
  attendeeEmail: string;
  attendeeName: string;
  meetingType: string;
}

const defaultTimeSlots: TimeSlot[] = [
  { time: '09:00', display: '9:00 AM', available: true },
  { time: '10:00', display: '10:00 AM', available: true },
  { time: '11:00', display: '11:00 AM', available: true },
  { time: '14:00', display: '2:00 PM', available: true },
  { time: '15:00', display: '3:00 PM', available: true },
  { time: '16:00', display: '4:00 PM', available: true },
];

const defaultDurationOptions: DurationOption[] = [
  {
    duration: 15,
    title: 'Quick Chat',
    description: '15-minute informal discussion',
    color: 'bg-green-600'
  },
  {
    duration: 30,
    title: 'Project Discussion',
    description: '30-minute focused meeting',
    color: 'bg-blue-600'
  },
  {
    duration: 60,
    title: 'Consultation',
    description: '60-minute comprehensive session',
    color: 'bg-purple-600'
  },
];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Professional availability calendar with comprehensive booking features.
 *
 * Features:
 * - Interactive calendar with weekday availability
 * - Flexible time slot and duration selection
 * - Google Calendar integration
 * - Automated email notifications
 * - Professional contact form
 * - Responsive design with accessibility support
 *
 * Usage:
 * ```tsx
 * <AvailabilityCalendar
 *   professionalName="John Doe"
 *   professionalEmail="john@example.com"
 *   onBookingSuccess={(details) => console.log('Booked:', details)}
 * />
 * ```
 */
export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  professionalName,
  professionalEmail,
  className = '',
  customTimeSlots,
  customDurationOptions,
  onBookingSuccess,
  onBookingError
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [attendeeEmail, setAttendeeEmail] = useState<string>('');
  const [attendeeName, setAttendeeName] = useState<string>('');
  const [showContactForm, setShowContactForm] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [pendingMailtoLink, setPendingMailtoLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Use custom options or defaults
  const timeSlots = customTimeSlots || defaultTimeSlots;
  const durationOptions = customDurationOptions || defaultDurationOptions;

  const isWeekday = (date: Date): boolean => {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday = 1, Friday = 5
  };

  const isAvailable = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && isWeekday(date);
  };

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateCalendarDays = (): JSX.Element[] => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: JSX.Element[] = [];

    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);

      const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();
      const isSelected = selectedDate && cellDate.toDateString() === selectedDate.toDateString();
      const available = isAvailable(cellDate);

      days.push(
        <button
          key={i}
          onClick={() => available ? handleDateSelect(cellDate) : undefined}
          disabled={!available}
          aria-label={`${cellDate.getDate()} ${monthNames[cellDate.getMonth()]} ${cellDate.getFullYear()}${available ? ' - Available' : ' - Not available'}`}
          className={`
            aspect-square flex items-center justify-center text-sm rounded transition-all
            ${!isCurrentMonth ? 'text-gray-500 opacity-50' : ''}
            ${available ? 'hover:bg-white/20 cursor-pointer bg-green-500/20 border border-green-500/40' : 'opacity-40 cursor-not-allowed'}
            ${isSelected ? 'bg-blue-600 text-white font-semibold shadow-lg' : ''}
          `}
        >
          {cellDate.getDate()}
        </button>
      );
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(new Date(date));
    setSelectedTime(null);
    setSelectedDuration(null);
    setShowContactForm(false);
    setAttendeeEmail('');
    setAttendeeName('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setSelectedDuration(null);
    setShowContactForm(false);
    setAttendeeEmail('');
    setAttendeeName('');
  };

  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
    setShowContactForm(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedDuration || !attendeeEmail) return;

    if (!validateEmail(attendeeEmail)) {
      const errorMessage = 'Please enter a valid email address.';
      onBookingError?.(errorMessage);
      alert(errorMessage);
      return;
    }

    setIsLoading(true);

    try {
      const selectedDurationOption = durationOptions.find(opt => opt.duration === selectedDuration);
      const meetingType = selectedDurationOption?.title || 'Meeting';
      const finalAttendeeName = attendeeName.trim() || attendeeEmail.split('@')[0];

      // Create start and end times
      const [hours, minutes] = selectedTime.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const endTime = new Date(startTime.getTime() + selectedDuration * 60 * 1000);

      const formatDateForCalendar = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const eventTitle = `${meetingType} with ${professionalName}`;
      const eventDescription = `Professional meeting scheduled through CVPlus.

Meeting Type: ${meetingType}
Duration: ${selectedDuration} minutes
Date: ${formatDateForDisplay(selectedDate)}
Time: ${startTime.toLocaleTimeString()}
Requested by: ${finalAttendeeName} (${attendeeEmail})

This meeting was requested through the availability calendar on the professional profile.`;

      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(eventTitle)}` +
        `&dates=${formatDateForCalendar(startTime)}/${formatDateForCalendar(endTime)}` +
        `&details=${encodeURIComponent(eventDescription)}` +
        `&add=${encodeURIComponent(`${professionalEmail},${attendeeEmail}`)}` +
        `&sf=true&output=xml`;

      // Open Google Calendar in new tab
      window.open(calendarUrl, '_blank');

      // Create email notification
      const emailSubject = `Meeting Request: ${meetingType} - ${selectedDuration} minutes`;
      const emailBody = `Hello ${professionalName},

I would like to schedule a ${selectedDuration}-minute ${meetingType.toLowerCase()} with you.

Meeting Details:
- Type: ${meetingType}
- Duration: ${selectedDuration} minutes
- Preferred date: ${formatDateForDisplay(selectedDate)}
- Preferred time: ${startTime.toLocaleTimeString()}

My contact information:
- Name: ${finalAttendeeName}
- Email: ${attendeeEmail}

I've also created a Google Calendar event that you can accept or suggest alternative times.

Best regards,
${finalAttendeeName}`;

      const mailtoLink = `mailto:${professionalEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // Store booking details for callback
      const bookingDetails: BookingDetails = {
        professionalName,
        professionalEmail,
        selectedDate,
        selectedTime,
        duration: selectedDuration,
        attendeeEmail,
        attendeeName: finalAttendeeName,
        meetingType
      };

      // Show success dialog and store mailto link
      setPendingMailtoLink(mailtoLink);
      setShowSuccessDialog(true);
      onBookingSuccess?.(bookingDetails);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      console.error('❌ Booking error:', error);
      onBookingError?.(errorMessage);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = () => {
    window.open(pendingMailtoLink, '_blank');
    setShowSuccessDialog(false);
    setPendingMailtoLink('');
  };

  const handleSkipEmail = () => {
    setShowSuccessDialog(false);
    setPendingMailtoLink('');
  };

  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSuccessDialog) {
        handleSkipEmail();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showSuccessDialog]);

  const canBookMeeting = selectedDate && selectedTime && selectedDuration && attendeeEmail && showContactForm && !isLoading;

  return (
    <div className={`bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Calendar className="w-7 h-7" />
          <h2 className="text-2xl font-bold">Schedule a Meeting</h2>
        </div>
        <p className="text-blue-100">
          Book time with {professionalName} for collaboration opportunities
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar Widget */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Previous month"
            >
              ←
            </button>
            <h3 className="font-semibold text-lg">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Next month"
            >
              →
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium py-2 opacity-70">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays()}
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          {/* Selected Date Display */}
          <div className="text-center mb-4">
            <div className="text-lg font-semibold bg-white/20 rounded-lg py-2 px-4">
              {selectedDate ? formatDateForDisplay(selectedDate) : 'Select a date'}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="mb-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Available Times
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.filter(slot => slot.available !== false).map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => handleTimeSelect(slot.time)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      selectedTime === slot.time
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {slot.display}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration Options */}
          {selectedTime && (
            <div className="mb-4">
              <h4 className="font-semibold mb-3">Meeting Duration</h4>
              <div className="space-y-2">
                {durationOptions.map((option) => (
                  <button
                    key={option.duration}
                    onClick={() => handleDurationSelect(option.duration)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedDuration === option.duration
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    <div className="font-semibold">{option.title}</div>
                    <div className="text-sm opacity-80">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information Form */}
          {showContactForm && (
            <div className="mb-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="attendeeEmail">
                    Email Address *
                  </label>
                  <input
                    id="attendeeEmail"
                    type="email"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                    aria-describedby="email-help"
                  />
                  <div id="email-help" className="text-xs text-blue-200 mt-1">
                    We'll use this to send you meeting confirmations
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="attendeeName">
                    Full Name (optional)
                  </label>
                  <input
                    id="attendeeName"
                    type="text"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Book Meeting Button */}
          {canBookMeeting && (
            <button
              onClick={handleBooking}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Meeting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Book Meeting
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Availability Notice */}
      <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
        <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
          <div>
            <strong>Available:</strong> Monday-Friday, 9 AM - 4 PM (Local Time)
          </div>
          <div>
            <strong>Response Time:</strong> Within 24 hours
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 max-w-md mx-4 text-gray-900">
            <div className="text-center">
              <div className="mb-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Calendar Event Created!
              </h3>
              <p className="text-gray-700 mb-6">
                Your Google Calendar event has been created successfully. Would you also like to send an email notification to {professionalName} to ensure they see your meeting request?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSendEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </button>
                <button
                  onClick={handleSkipEmail}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-all"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;