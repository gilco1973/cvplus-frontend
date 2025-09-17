import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { designSystem } from '../../config/designSystem';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'error';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    label,
    error,
    helperText,
    icon: Icon,
    iconPosition = 'left',
    variant = 'default',
    fullWidth = true,
    className = '',
    id,
    ...props
  },
  ref
) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);
  const currentVariant = hasError ? 'error' : variant;
  
  // Get classes from design system
  const baseClasses = designSystem.components.form.input.base;
  const focusClasses = currentVariant === 'error' 
    ? designSystem.components.form.input.error 
    : designSystem.components.form.input.focus;
  const disabledClasses = props.disabled ? designSystem.components.form.input.disabled : '';
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={designSystem.components.form.label}
        >
          {label}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
          </div>
        )}
        
        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          className={`
            ${baseClasses}
            ${focusClasses}
            ${disabledClasses}
            ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${hasError ? 'border-error-500' : ''}
            ${className}
          `.trim()}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : 
            helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        
        {/* Right Icon */}
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p 
          id={`${inputId}-error`}
          className="mt-1 text-sm text-error-400"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {/* Helper Text */}
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-neutral-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Export as default
export default Input;