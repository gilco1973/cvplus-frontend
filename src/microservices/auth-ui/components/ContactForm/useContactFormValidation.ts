/**
 * Contact Form Validation Hook
 * Handles form validation logic for the contact form
 */
import { useState, useCallback } from 'react';
import { ContactFormData, ContactFormErrors } from './types';

export const useContactFormValidation = () => {
  const [errors, setErrors] = useState<ContactFormErrors>({});

  const validateForm = useCallback((formData: ContactFormData): boolean => {
    const newErrors: ContactFormErrors = {};

    // Name validation
    if (!formData.senderName.trim()) {
      newErrors.senderName = 'Name is required';
    } else if (formData.senderName.trim().length < 2) {
      newErrors.senderName = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.senderEmail.trim()) {
      newErrors.senderEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.senderEmail)) {
      newErrors.senderEmail = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.senderPhone && formData.senderPhone.trim() && 
        !/^[+]?[\d\s()\-.]{10,}$/.test(formData.senderPhone.trim())) {
      newErrors.senderPhone = 'Please enter a valid phone number';
    }

    // Subject validation
    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = 'Message must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearError = useCallback((field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateForm,
    clearError,
    clearAllErrors
  };
};