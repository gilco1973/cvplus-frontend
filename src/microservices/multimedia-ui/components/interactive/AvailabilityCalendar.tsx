import React, { useState, useEffect } from 'react';
import { CVFeatureProps } from '../../../types/cv-features';
import { useFeatureData } from '../../../hooks/useFeatureData';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  type: 'interview' | 'consultation' | 'meeting' | 'call';
}

interface AvailabilityDay {
  date: string;
  dayOfWeek: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  specialNote?: string;
}

interface CalendarSettings {
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  bufferTime: number; // minutes between meetings
  maxAdvanceDays: number;
  allowWeekends: boolean;
  meetingTypes: string[];
  calendarUrl?: string;
}

interface AvailabilityCalendarProps extends CVFeatureProps {
  showTimezone?: boolean;
  showBookingForm?: boolean;
  allowDirectBooking?: boolean;
  integrationService?: 'calendly' | 'google' | 'outlook' | 'manual';
  defaultMeetingType?: string;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization,
  onUpdate,
  onError,
  className = '',
  mode = 'private',
  showTimezone = true,
  showBookingForm = true,
  allowDirectBooking = false,
  integrationService = 'manual',
  defaultMeetingType = 'interview'
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    company: '',
    meetingType: defaultMeetingType,
    notes: '',
    phone: ''
  });

  const {
    data: calendarData,
    loading,
    error,
    refetch
  } = useFeatureData(
    'getAvailabilityCalendar',
    { 
      jobId, 
      profileId, 
      month: currentMonth.toISOString().slice(0, 7),
      integrationService 
    },
    { enabled: isEnabled }
  );

  useEffect(() => {
    if (calendarData) {
      setAvailability(calendarData.availability || []);
      setSettings(calendarData.settings || null);
      onUpdate?.(calendarData);
    }
  }, [calendarData, onUpdate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAvailabilityForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return availability.find(av => av.date === dateString);
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedTimeSlot(slot);
    if (allowDirectBooking || showBookingForm) {
      setShowBookingModal(true);
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot) return;
    
    try {
      const response = await fetch('/api/bookInterview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          profileId,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          booking: bookingData,
          integrationService
        })
      });

      if (response.ok) {
        const result = await response.json();
        onUpdate?.({ 
          bookingConfirmed: true, 
          bookingId: result.bookingId,
          calendarEvent: result.calendarEvent 
        });
        setShowBookingModal(false);
        setSelectedDate(null);
        setSelectedTimeSlot(null);
        setBookingData({
          name: '',
          email: '',
          company: '',
          meetingType: defaultMeetingType,
          notes: '',
          phone: ''
        });
        // Refresh availability
        refetch();
      } else {
        throw new Error('Failed to book interview');
      }
    } catch (err) {
      onError?.(err as Error);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    
    if (settings) {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + settings.maxAdvanceDays);
      if (date > maxDate) return true;
      
      if (!settings.allowWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
        return true;
      }
    }
    
    return false;
  };

  const getDayAvailabilityStatus = (date: Date) => {
    if (isDateDisabled(date)) return 'disabled';
    
    const dayAvailability = getAvailabilityForDate(date);
    if (!dayAvailability) return 'no-data';
    if (!dayAvailability.isAvailable) return 'unavailable';
    
    const availableSlots = dayAvailability.timeSlots.filter(slot => slot.available);
    if (availableSlots.length === 0) return 'booked';
    if (availableSlots.length <= 2) return 'limited';
    
    return 'available';
  };

  const getDayStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'limited': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'booked': return 'bg-red-100 text-red-600';
      case 'unavailable': return 'bg-gray-100 text-gray-400';
      case 'disabled': return 'bg-gray-50 text-gray-300 cursor-not-allowed';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  if (loading) {
    return (
      <FeatureWrapper className={className} title="Interview Availability">
        <LoadingSpinner message="Loading calendar availability..." />
      </FeatureWrapper>
    );
  }

  if (error) {
    return (
      <FeatureWrapper className={className} title="Interview Availability">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          <p className="font-medium">Failed to Load Calendar</p>
          <p className="text-sm mt-1">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </FeatureWrapper>
    );
  }

  const monthDays = getDaysInMonth(currentMonth);
  const selectedDayAvailability = selectedDate ? availability.find(av => av.date === selectedDate) : null;

  return (
    <FeatureWrapper className={className} title="Schedule an Interview">
      <div className="space-y-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {currentMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </h3>
            {showTimezone && settings && (
              <p className="text-sm text-gray-600 mt-1">
                Timezone: {settings.timezone}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border rounded-lg overflow-hidden">
          {/* Week Header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {monthDays.map((date, index) => {
              if (!date) {
                return <div key={index} className="p-3 h-16" />;
              }

              const status = getDayAvailabilityStatus(date);
              const isSelected = selectedDate === date.toISOString().split('T')[0];
              
              return (
                <button className="animate-scale-in hover-scale"
                  key={index}
                  onClick={() => status !== 'disabled' && handleDateSelect(date)}
                  disabled={status === 'disabled'}
                  className={`relative p-3 h-16 border-r border-b text-sm transition-colors ${
                    isSelected 
                      ? 'bg-blue-500 text-white' 
                      : getDayStatusColor(status)
                  } ${status === 'disabled' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="font-medium">
                      {date.getDate()}
                    </span>
                    {status === 'available' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1" />
                    )}
                    {status === 'limited' && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>Limited slots</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>Fully booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <span>Unavailable</span>
          </div>
        </div>

        {/* Time Slots */}
        {selectedDayAvailability && (
          <div className="animate-fade-in bg-white border rounded-lg p-6"
          >
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Available Times - {new Date(selectedDate!).toLocaleDateString([], { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>

            {selectedDayAvailability.specialNote && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  📋 {selectedDayAvailability.specialNote}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedDayAvailability.timeSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeSlotSelect(slot)}
                  disabled={!slot.available}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    slot.available
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="text-center">
                    <div>{formatTime(slot.start)}</div>
                    <div className="text-xs opacity-75">
                      {slot.type}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedDayAvailability.timeSlots.every(slot => !slot.available) && (
              <div className="text-center py-8 text-gray-500">
                <p>No available time slots for this date.</p>
                <p className="text-sm mt-1">Please select another date.</p>
              </div>
            )}
          </div>
        )}

        {/* Integration Info */}
        {integrationService !== 'manual' && settings?.calendarUrl && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {integrationService === 'calendly' && (
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 14.616c-.184.906-.735 1.438-1.548 1.438-.369 0-.735-.184-1.012-.461L12 12.553l-3.008 3.04c-.277.277-.643.461-1.012.461-.813 0-1.364-.532-1.548-1.438-.092-.461.092-.922.369-1.199L9.84 12l-3.039-1.417c-.277-.277-.461-.738-.369-1.199.184-.906.735-1.438 1.548-1.438.369 0 .735.184 1.012.461L12 11.447l3.008-3.04c.277-.277.643-.461 1.012-.461.813 0 1.364.532 1.548 1.438.092.461-.092.922-.369 1.199L14.16 12l3.039 1.417c.277.277.461.738.369 1.199z"/>
                  </svg>
                )}
                {integrationService === 'google' && (
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
              </div>
              <div>
                <h5 className="font-medium text-gray-900">
                  {integrationService === 'calendly' ? 'Calendly Integration' : 
                   integrationService === 'google' ? 'Google Calendar Integration' : 
                   'Calendar Integration'}
                </h5>
                <p className="text-sm text-gray-600">
                  Bookings are automatically synced with my calendar
                </p>
              </div>
              <a
                href={settings.calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Open Calendar
              </a>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        <div>
          {showBookingModal && selectedTimeSlot && (
            <div className="animate-fade-in fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <div className="animate-fade-in">
                }
                }
                className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Book Interview
                  </h3>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📅 {new Date(selectedDate!).toLocaleDateString([], { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-blue-800">
                    🕒 {formatTime(selectedTimeSlot.start)} - {formatTime(selectedTimeSlot.end)}
                  </p>
                  <p className="text-sm text-blue-800">
                    📝 {selectedTimeSlot.type}
                  </p>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingData.name}
                      onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={bookingData.company}
                      onChange={(e) => setBookingData({...bookingData, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {settings?.meetingTypes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meeting Type
                      </label>
                      <select
                        value={bookingData.meetingType}
                        onChange={(e) => setBookingData({...bookingData, meetingType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {settings.meetingTypes.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any additional information about the interview..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleBookingSubmit}
                      disabled={!bookingData.name || !bookingData.email}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Book Interview
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </FeatureWrapper>
  );
};

export default AvailabilityCalendar;