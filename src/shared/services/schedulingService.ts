import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

interface SchedulingRequestData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message?: string;
}

interface SchedulingResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export class SchedulingService {
  private static sendSchedulingEmailFunction = httpsCallable<SchedulingRequestData, SchedulingResponse>(
    functions,
    'sendSchedulingEmail'
  );

  static async submitSchedulingRequest(data: SchedulingRequestData): Promise<SchedulingResponse> {
    try {
      console.warn('Submitting scheduling request:', data);
      
      const result = await this.sendSchedulingEmailFunction(data);
      
      console.warn('Scheduling request submitted successfully:', result.data);
      return result.data;
      
    } catch (error: any) {
      console.error('Error submitting scheduling request:', error);
      
      // Handle different types of errors
      if (error.code === 'functions/invalid-argument') {
        throw new Error('Please check that all required fields are filled out correctly.');
      } else if (error.code === 'functions/unauthenticated') {
        throw new Error('You must be logged in to schedule a call.');
      } else if (error.code === 'functions/permission-denied') {
        throw new Error('You do not have permission to schedule calls.');
      } else if (error.code === 'functions/internal') {
        throw new Error('There was a problem sending your request. Please try again later.');
      } else {
        throw new Error('Failed to submit scheduling request. Please try again.');
      }
    }
  }

  static validateSchedulingData(data: SchedulingRequestData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Name validation
    if (!data.name?.trim()) {
      errors.push('Name is required');
    } else if (data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    // Email validation
    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.push('Please enter a valid email address');
      }
    }

    // Phone validation
    if (!data.phone?.trim()) {
      errors.push('Phone number is required');
    } else {
      const cleanPhone = data.phone.replace(/[\s\-()]/g, '');
      if (cleanPhone.length < 10) {
        errors.push('Phone number must be at least 10 digits');
      }
    }

    // Date validation
    if (!data.date) {
      errors.push('Date is required');
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.push('Date cannot be in the past');
      }
      
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      if (selectedDate > maxDate) {
        errors.push('Date cannot be more than 30 days in the future');
      }
    }

    // Time validation
    if (!data.time?.trim()) {
      errors.push('Time is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}