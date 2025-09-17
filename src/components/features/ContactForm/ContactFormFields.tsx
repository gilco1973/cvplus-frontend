import React from 'react';
import { User, Mail, Building, Phone, MessageSquare } from 'lucide-react';
import { ContactFormData, ContactFormErrors, SubjectOption } from './types';
import { useTranslation } from '../../../hooks/useTranslation';

interface ContactFormFieldsProps {
  formData: ContactFormData;
  errors: ContactFormErrors;
  onChange: (field: keyof ContactFormData, value: string) => void;
  onClearError: (field: string) => void;
  showCompanyField?: boolean;
  showPhoneField?: boolean;
}

export const ContactFormFields: React.FC<ContactFormFieldsProps> = ({
  formData,
  errors,
  onChange,
  onClearError,
  showCompanyField = true,
  showPhoneField = true
}) => {
  const { t } = useTranslation();

  const SUBJECT_OPTIONS: SubjectOption[] = [
    { value: 'job-opportunity', label: t('forms.contactForm.fields.subject.options.jobOpportunity') },
    { value: 'collaboration', label: t('forms.contactForm.fields.subject.options.collaboration') },
    { value: 'consultation', label: t('forms.contactForm.fields.subject.options.consultation') },
    { value: 'general-inquiry', label: t('forms.contactForm.fields.subject.options.generalInquiry') },
    { value: 'other', label: t('forms.contactForm.fields.subject.options.other') }
  ];
  const handleInputChange = (field: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(field, e.target.value);
    if (errors[field]) {
      onClearError(field);
    }
  };

  return (
    <div className="space-y-4">
      {/* Name Field */}
      <div>
        <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('forms.contactForm.fields.name.label')} *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            id="senderName"
            value={formData.senderName}
            onChange={handleInputChange('senderName')}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.senderName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('forms.contactForm.fields.name.placeholder')}
            aria-describedby={errors.senderName ? 'name-error' : undefined}
          />
        </div>
        {errors.senderName && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {errors.senderName}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1">
          {t('forms.contactForm.fields.email.label')} *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="email"
            id="senderEmail"
            value={formData.senderEmail}
            onChange={handleInputChange('senderEmail')}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.senderEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('forms.contactForm.fields.email.placeholder')}
            aria-describedby={errors.senderEmail ? 'email-error' : undefined}
          />
        </div>
        {errors.senderEmail && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {errors.senderEmail}
          </p>
        )}
      </div>

      {/* Phone Field (optional) */}
      {showPhoneField && (
        <div>
          <label htmlFor="senderPhone" className="block text-sm font-medium text-gray-700 mb-1">
            {t('forms.contactForm.fields.phone.label')}
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="tel"
              id="senderPhone"
              value={formData.senderPhone || ''}
              onChange={handleInputChange('senderPhone')}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.senderPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('forms.contactForm.fields.phone.placeholder')}
              aria-describedby={errors.senderPhone ? 'phone-error' : undefined}
            />
          </div>
          {errors.senderPhone && (
            <p id="phone-error" className="mt-1 text-sm text-red-600">
              {errors.senderPhone}
            </p>
          )}
        </div>
      )}

      {/* Company Field (optional) */}
      {showCompanyField && (
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            {t('forms.contactForm.fields.company.label')}
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              id="company"
              value={formData.company || ''}
              onChange={handleInputChange('company')}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('forms.contactForm.fields.company.placeholder')}
            />
          </div>
        </div>
      )}

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          {t('forms.contactForm.fields.subject.label')} *
        </label>
        <select
          id="subject"
          value={formData.subject}
          onChange={handleInputChange('subject')}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.subject ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
        >
          <option value="">{t('forms.contactForm.fields.subject.placeholder')}</option>
          {SUBJECT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.subject && (
          <p id="subject-error" className="mt-1 text-sm text-red-600">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          {t('forms.contactForm.fields.message.label')} *
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <textarea
            id="message"
            value={formData.message}
            onChange={handleInputChange('message')}
            rows={4}
            maxLength={1000}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('forms.contactForm.fields.message.placeholder')}
            aria-describedby={errors.message ? 'message-error' : 'message-counter'}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          {errors.message ? (
            <p id="message-error" className="text-sm text-red-600">
              {errors.message}
            </p>
          ) : (
            <div />
          )}
          <p id="message-counter" className="text-sm text-gray-500">
            {t('forms.contactForm.fields.message.counter', { current: formData.message.length, max: 1000 })}
          </p>
        </div>
      </div>
    </div>
  );
};
