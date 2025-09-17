import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, CheckCircle, Clock, Users, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CalendarPermissionsProps {
  onPermissionsGranted?: () => void;
  showAsCard?: boolean;
}

export const CalendarPermissions: React.FC<CalendarPermissionsProps> = ({ 
  onPermissionsGranted,
  showAsCard = true 
}) => {
  const { user, hasCalendarPermissions, requestCalendarPermissions } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermissions = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    try {
      setIsRequesting(true);
      await requestCalendarPermissions();
      toast.success('Calendar permissions granted! You can now sync career milestones.');
      onPermissionsGranted?.();
    } catch {
      toast.error('Failed to grant calendar permissions. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const benefits = [
    {
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      title: 'Career Milestone Tracking',
      description: 'Automatically create calendar events for work anniversaries and achievements'
    },
    {
      icon: <Clock className="w-5 h-5 text-green-400" />,
      title: 'Smart Reminders',
      description: 'Get notified about skill updates and CV refresh opportunities'
    },
    {
      icon: <Users className="w-5 h-5 text-purple-400" />,
      title: 'Meeting Availability',
      description: 'Enable meeting scheduling for networking and interview opportunities'
    }
  ];

  if (!user) {
    return null;
  }

  const content = (
    <div className="space-y-4">
      {hasCalendarPermissions ? (
        <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-700 rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-green-400">Calendar Integration Active</h3>
            <p className="text-sm text-green-300">Your career milestones will be synced to your calendar.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-400 mb-2">Enable Calendar Integration</h3>
              <p className="text-sm text-blue-300 mb-3">
                Grant calendar permissions to unlock powerful timeline features and meeting scheduling.
              </p>
              <button
                onClick={handleRequestPermissions}
                disabled={isRequesting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isRequesting ? 'Requesting...' : 'Grant Calendar Access'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-300">What you'll get:</h4>
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                {benefit.icon}
                <div>
                  <h5 className="font-medium text-gray-200 text-sm">{benefit.title}</h5>
                  <p className="text-xs text-gray-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-400 bg-gray-800 p-3 rounded-lg">
            <strong>Privacy:</strong> We only access your calendar to create events related to your career milestones. 
            You can revoke permissions at any time through your Google account settings.
          </div>
        </>
      )}
    </div>
  );

  if (!showAsCard) {
    return content;
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-6 h-6 text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-100">Calendar Integration</h2>
      </div>
      {content}
    </div>
  );
};