import React from 'react';
import { designSystem } from '../../config/designSystem';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  'aria-label'?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hover = false,
  'aria-label': ariaLabel,
  ...props
}) => {
  // Get component classes from design system
  const baseClasses = designSystem.components.card.base;
  const variantClasses = designSystem.components.card.variants[variant];
  const paddingClasses = designSystem.components.card.padding[padding];
  
  // Add hover effects if specified
  const hoverClasses = hover ? designSystem.animations.classes.hoverLift : '';
  
  // Determine if card should be interactive
  const isInteractive = onClick || variant === 'interactive';
  const interactiveClasses = isInteractive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500' : '';
  
  const Component = isInteractive ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variantClasses}
        ${paddingClasses}
        ${hoverClasses}
        ${interactiveClasses}
        ${className}
      `.trim()}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Component>
  );
};

// Card Header Component
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

// Card Content Component
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`${className}`}>
    {children}
  </div>
);

// Card Footer Component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`mt-4 pt-4 border-t border-neutral-700 ${className}`}>
    {children}
  </div>
);

// Card Title Component
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
}

export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '',
  level = 2
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  const getLevelClasses = () => {
    switch (level) {
      case 1: return 'text-2xl font-bold text-neutral-100';
      case 2: return 'text-xl font-semibold text-neutral-100';
      case 3: return 'text-lg font-semibold text-neutral-100';
      default: return 'text-xl font-semibold text-neutral-100';
    }
  };
  
  return (
    <Component className={`${getLevelClasses()} ${className}`}>
      {children}
    </Component>
  );
};

// Card Description Component
interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ 
  children, 
  className = '' 
}) => (
  <p className={`text-neutral-400 ${className}`}>
    {children}
  </p>
);

// Export all components
export {
  Card as default,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
};