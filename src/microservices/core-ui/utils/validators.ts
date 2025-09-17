// Validation utilities for common input types

export const validators = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone number validation (US format)
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9]?[\s.-]?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/;
    return phoneRegex.test(phone);
  },

  // URL validation
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Password strength validation
  validatePassword: (password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } => {
    const errors: string[] = [];
    let score = 0;

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  },

  // Credit card validation (Luhn algorithm)
  isValidCreditCard: (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');

    if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    let sum = 0;
    let shouldDouble = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  },

  // Required field validation
  isRequired: (value: string | number | boolean | null | undefined): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    return true;
  },

  // Minimum length validation
  hasMinLength: (value: string, minLength: number): boolean => {
    return value.length >= minLength;
  },

  // Maximum length validation
  hasMaxLength: (value: string, maxLength: number): boolean => {
    return value.length <= maxLength;
  },

  // Number range validation
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  // File type validation
  isValidFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },

  // File size validation
  isValidFileSize: (file: File, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  },

  // Date validation
  isValidDate: (date: string | Date): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  },

  // Future date validation
  isFutureDate: (date: string | Date): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return validators.isValidDate(dateObj) && dateObj > new Date();
  },

  // Past date validation
  isPastDate: (date: string | Date): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return validators.isValidDate(dateObj) && dateObj < new Date();
  },

  // Age validation (18+)
  isValidAge: (birthDate: string | Date): boolean => {
    const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    if (!validators.isValidDate(birthDateObj)) return false;

    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  }
};