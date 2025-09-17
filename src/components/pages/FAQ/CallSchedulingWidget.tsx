import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, Phone, X, Send, User, Mail, AlertCircle } from 'lucide-react';
import { SchedulingService } from '../../../services/schedulingService';
import toast from 'react-hot-toast';

interface CallSchedulingWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallSchedulingWidget: React.FC<CallSchedulingWidgetProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: ''
  });

  // Generate time slots (9 AM to 6 PM)
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Get maximum date (30 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email address is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return 'Phone number is required';
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (!phoneRegex.test(cleanPhone)) return 'Please enter a valid phone number';
    if (cleanPhone.length < 10) return 'Phone number must be at least 10 digits';
    return '';
  };

  const validateDate = (date: string): string => {
    if (!date) return 'Please select a preferred date';
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return 'Date cannot be in the past';
    if (selectedDate > maxDate) return 'Date cannot be more than 30 days in the future';
    return '';
  };

  const validateTime = (time: string): string => {
    if (!time) return 'Please select a preferred time';
    return '';
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name': return validateName(value);
      case 'email': return validateEmail(value);
      case 'phone': return validatePhone(value);
      case 'date': return validateDate(value);
      case 'time': return validateTime(value);
      default: return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const errors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      date: validateDate(formData.date),
      time: validateTime(formData.time)
    };

    setFieldErrors(errors);

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit scheduling request directly to backend
      const response = await SchedulingService.submitSchedulingRequest({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        date: formData.date,
        time: formData.time,
        message: formData.message.trim() || undefined
      });

      console.log('Scheduling request sent successfully:', response);
      toast.success('Scheduling request sent! Check your email for confirmation.');

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          message: ''
        });
      }, 3000);

    } catch (error) {
      console.error('Error submitting scheduling request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send scheduling request';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.phone && formData.date && formData.time && 
    !Object.values(fieldErrors).some(error => error !== '');

  // Error display component
  const ErrorMessage: React.FC<{ error: string }> = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  };

  if (!isOpen) return null;

  const modalContent = submitSuccess ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-auto text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-green-400 mb-2">Request Sent!</h3>
          <p className="text-gray-300">
            Your call scheduling request has been sent successfully! You'll receive a confirmation email shortly, and our team will contact you within 24 hours to confirm your appointment.
          </p>
        </div>
      </div>
  ) : (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Schedule a Call</h2>
              <p className="text-sm text-gray-400">Book a time that works for you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                  fieldErrors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-600 focus:ring-green-400'
                }`}
                placeholder="Enter your full name"
              />
              <ErrorMessage error={fieldErrors.name} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                  fieldErrors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-600 focus:ring-green-400'
                }`}
                placeholder="Enter your email"
              />
              <ErrorMessage error={fieldErrors.email} />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                fieldErrors.phone ? 'border-red-500 focus:ring-red-400' : 'border-gray-600 focus:ring-green-400'
              }`}
              placeholder="Enter your phone number"
            />
            <ErrorMessage error={fieldErrors.phone} />
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Preferred Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min={today}
                max={maxDateString}
                required
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent ${
                  fieldErrors.date ? 'border-red-500 focus:ring-red-400' : 'border-gray-600 focus:ring-green-400'
                }`}
              />
              <ErrorMessage error={fieldErrors.date} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Preferred Time *
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent ${
                  fieldErrors.time ? 'border-red-500 focus:ring-red-400' : 'border-gray-600 focus:ring-green-400'
                }`}
              >
                <option value="">Select a time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>
                    {time} ({time < '12:00' ? 'AM' : 'PM'})
                  </option>
                ))}
              </select>
              <ErrorMessage error={fieldErrors.time} />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              placeholder="Tell us what you'd like to discuss..."
            />
          </div>

          {/* Support Hours Info */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Support Hours</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Monday - Friday: 9:00 AM - 6:00 PM EST</div>
              <div>Saturday - Sunday: 10:00 AM - 4:00 PM EST</div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Schedule Call
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};