import React from 'react';
import { LucideIcon } from 'lucide-react';
import { designSystem } from '../../config/designSystem';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  'aria-label'?: string;
}

// Loading spinner component
const LoadingSpinner: React.FC<{ size: string }> = ({ size }) => (
  <svg
    className={`animate-spin ${size} text-current`}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  'aria-label': ariaLabel,
  ...props
}) => {
  // Get component classes from design system
  const baseClasses = designSystem.components.button.base;
  const sizeClasses = designSystem.components.button.sizes[size];
  const variantClasses = loading 
    ? designSystem.components.button.variants[variant].loading
    : disabled 
    ? designSystem.components.button.variants[variant].disabled
    : designSystem.components.button.variants[variant].default;

  // Determine icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-5 h-5';
      case 'xl': return 'w-6 h-6';
      default: return 'w-4 h-4';
    }
  };

  const iconSize = getIconSize();
  const spinnerSize = getIconSize();

  // Handle click events
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses}
        ${variantClasses}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {/* Loading state */}
      {loading ? (
        <>
          <LoadingSpinner size={spinnerSize} />
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        <>
          {/* Left icon */}
          {Icon && iconPosition === 'left' && (
            <Icon className={`${iconSize} ${children ? 'mr-2' : ''}`} aria-hidden="true" />
          )}
          
          {/* Button content */}
          {children}
          
          {/* Right icon */}
          {Icon && iconPosition === 'right' && (
            <Icon className={`${iconSize} ${children ? 'ml-2' : ''}`} aria-hidden="true" />
          )}
        </>
      )}
    </button>
  );
};

// Export as default
export default Button;