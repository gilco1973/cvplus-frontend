import { useState, useEffect } from 'react';
import { doc, getDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface CalendarData {
  type: string;
  professionalName: string;
  professionalEmail: string;
  availableHours: {
    start: string;
    end: string;
    timezone: string;
  };
  workDays: string[];
  timeSlots: Array<{
    time: string;
    display: string;
  }>;
  meetingTypes: Array<{
    duration: number;
    title: string;
    description: string;
  }>;
  responseTime: string;
}

export const useCalendarData = (jobId: string) => {
  const { user } = useAuth();
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!user || !jobId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch calendar data from Firestore subcollection
        const calendarDocRef = doc(collection(doc(db, 'jobs', jobId), 'featureData'), 'availability-calendar');
        const calendarDoc = await getDoc(calendarDocRef);

        if (calendarDoc.exists()) {
          const calendarData = calendarDoc.data();
          if (calendarData.data) {
            setData(calendarData.data as CalendarData);
          } else {
            setError('Calendar data not found in document');
          }
        } else {
          // Document doesn't exist, use default values based on user info
          setData(null);
        }
      } catch (err) {
        console.error('Error fetching calendar data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch calendar data');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [user, jobId]);

  return { data, loading, error };
};
