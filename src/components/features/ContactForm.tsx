import React, { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { CVFeatureProps } from '../../types/cv-features';
import { FeatureWrapper } from './Common/FeatureWrapper';
import { ErrorBoundary } from './Common/ErrorBoundary';
import { useFirebaseFunction } from '../../hooks/useFeatureData';
import { ContactFormFields } from './ContactForm/ContactFormFields';
import { ContactFormHeader } from './ContactForm/ContactFormHeader';
import { ContactFormStatus } from './ContactForm/ContactFormStatus';
import { useContactFormValidation } from './ContactForm/useContactFormValidation';
import { useTranslation } from '../../hooks/useTranslation';

import { ContactFormProps, ContactFormData } from './ContactForm/types';

export const ContactForm: React.FC<ContactFormProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization = {},
  onUpdate,
  onError,
  className = '',
  mode = 'private'
}) => {
  const { t } = useTranslation();
  const contactName = data?.contactName || t('forms.contactForm.defaultContactName', { defaultValue: 'the CV owner' });
  const {
    title = t('forms.contactForm.title'),
    buttonText = t('forms.contactForm.buttons.send'),
    showCompanyField = true,
    showPhoneField = true,
    maxRetries = 3
  } = customization;

  const [formData, setFormData] = useState<ContactFormData>({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    company: '',
    subject: '',
    message: ''
  });

  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Use Firebase Function hook
  const { callFunction, loading: isSubmitting, error: functionError } = useFirebaseFunction();
  
  // Use validation hook
  const { errors, validateForm, clearError } = useContactFormValidation();

  const handleInputChange = useCallback((field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    clearError(field);

    // Reset submission status when form is modified
    if (submissionStatus !== 'idle') {
      setSubmissionStatus('idle');
    }
  }, [clearError, submissionStatus]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    setSubmissionStatus('idle');

    try {
      // Prepare the payload for Firebase Functions
      const payload = {
        profileId,
        jobId,
        ...formData
      };

      console.log('Submitting contact form with Firebase Functions...', { profileId, jobId });
      
      // Call Firebase Functions using hook
      const result = await callFunction('submitContactForm', payload);
      
      console.log('Contact form submission successful:', result);
      
      // Reset form and show success
      setSubmissionStatus('success');
      const submittedData = { ...formData }; // Store before reset
      setFormData({
        senderName: '',
        senderEmail: '',
        senderPhone: '',
        company: '',
        subject: '',
        message: ''
      });
      setRetryCount(0);
      toast.success(t('forms.contactForm.status.success'));
      onUpdate?.(submittedData);
      
    } catch (error) {
      console.error('Contact form error:', error);
      
      const errorMsg = error instanceof Error ? error.message : t('forms.contactForm.status.error');
      
      setErrorMessage(errorMsg);
      setSubmissionStatus('error');
      setRetryCount(prev => prev + 1);
      toast.error(errorMsg);
      onError?.(error instanceof Error ? error : new Error(errorMsg));
    }
  }, [formData, validateForm, profileId, jobId, callFunction, onUpdate, onError]);
  
  // Enhanced retry mechanism
  const handleRetry = useCallback(() => {
    setSubmissionStatus('idle');
    setErrorMessage('');
    // Re-trigger form submission
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }, []);

  if (!isEnabled) {
    return null;
  }

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title={title}
        description={`Contact form for ${contactName}`}
        isLoading={isSubmitting}
        error={functionError}
        onRetry={handleRetry}
      >
        <div className="space-y-6">
          <ContactFormHeader 
            title={title}
            contactName={contactName}
            mode={mode}
          />
          
          <form 
            ref={formRef} 
            onSubmit={handleSubmit} 
            className="max-w-2xl mx-auto space-y-6"
            role="form"
            aria-label={`Contact form for ${contactName}`}
          >
            <ContactFormFields
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              onClearError={clearError}
              showCompanyField={showCompanyField}
              showPhoneField={showPhoneField}
            />

            {/* Submit Button */}
            <div className="form-actions text-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !formData.senderName || !formData.senderEmail || !formData.message}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-1 disabled:translate-y-0 transition-all duration-200 min-w-[200px]"
                aria-describedby={isSubmitting ? 'submitting-status' : undefined}
              >
                {isSubmitting ? (
                  <>
                    <div 
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" 
                      aria-hidden="true"
                    />
                    <span id="submitting-status">{t('forms.contactForm.buttons.sending')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" aria-hidden="true" />
                    {buttonText}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Status Display */}
          <ContactFormStatus 
            status={submissionStatus} 
            error={errorMessage || functionError?.message}
            retryCount={retryCount}
            maxRetries={maxRetries}
            onRetry={handleRetry}
          />
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};