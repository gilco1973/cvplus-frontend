/**
 * ContactForm Types
 * Type definitions for the Contact Form feature
 */

import { CVFeatureProps } from '../../../types/cv-features';

export interface ContactFormData {
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  company?: string;
  subject: string;
  message: string;
}

// Alias for backward compatibility
export type ContactSubmission = ContactFormData;

export interface ContactFormProps extends CVFeatureProps {
  contactName?: string;
  customization?: {
    title?: string;
    buttonText?: string;
    theme?: 'light' | 'dark' | 'auto';
    showCompanyField?: boolean;
    showPhoneField?: boolean;
    maxRetries?: number;
  };
}

export interface ContactFormErrors {
  [key: string]: string;
}

export interface SubjectOption {
  value: string;
  label: string;
}

export const SUBJECT_OPTIONS: SubjectOption[] = [
  { value: 'job-opportunity', label: 'Job Opportunity' },
  { value: 'freelance-project', label: 'Freelance Project' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'networking', label: 'Networking' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'other', label: 'Other' }
];

export type SubmissionStatus = 'idle' | 'success' | 'error';

export interface ContactFormFieldsProps {
  formData: ContactFormData;
  errors: ContactFormErrors;
  onChange: (field: keyof ContactFormData, value: string) => void;
  onClearError: (field: string) => void;
  showCompanyField?: boolean;
  showPhoneField?: boolean;
}

export interface ContactFormHeaderProps {
  title: string;
  contactName: string;
  mode: 'public' | 'private' | 'preview';
}

export interface ContactFormStatusProps {
  status: SubmissionStatus;
  errorMessage: string;
  retryCount: number;
  maxRetries: number;
  contactName: string;
  onRetry: () => void;
}