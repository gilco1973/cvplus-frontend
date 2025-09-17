// Formatting utilities for common data types

export const formatters = {
  // Date formatting
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
  },

  // Relative time formatting (e.g., "2 hours ago")
  formatRelativeTime: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatters.formatDate(dateObj);
  },

  // Number formatting
  formatNumber: (number: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat('en-US', options).format(number);
  },

  // Currency formatting
  formatCurrency: (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  },

  // Percentage formatting
  formatPercentage: (value: number, decimals = 1): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  // File size formatting
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Phone number formatting
  formatPhoneNumber: (phoneNumber: string): string => {
    const cleaned = phoneNumber.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }

    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
    }

    return phoneNumber; // Return original if not standard format
  },

  // Truncate text with ellipsis
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // Capitalize first letter
  capitalizeFirst: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  // Convert camelCase to Title Case
  camelToTitle: (text: string): string => {
    return text
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  },

  // Format duration in ms to human readable
  formatDuration: (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
};