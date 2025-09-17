import React from 'react';

interface LogoProps {
  className?: string;
  showSlogan?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'white' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  showSlogan = false,
  size = 'medium',
  variant = 'default'
}) => {
  const sizeMap = {
    small: { height: 'h-10', textSize: 'text-xl' },
    medium: { height: 'h-12', textSize: 'text-2xl' },
    large: { height: 'h-16', textSize: 'text-3xl' }
  };

  const { height, textSize } = sizeMap[size];

  const getTextClasses = () => {
    switch (variant) {
      case 'white':
        return {
          main: 'text-white',
          slogan: 'text-gray-200'
        };
      case 'dark':
        return {
          main: 'text-gray-900',
          slogan: 'text-gray-600'
        };
      default:
        return {
          main: 'text-blue-600',
          slogan: 'text-gray-500'
        };
    }
  };

  const textClasses = getTextClasses();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/images/2.png"
        alt="CVPlus Logo"
        className={`${height} w-auto object-contain`}
      />
      <div className="flex flex-col">
        <span className={`font-bold ${textClasses.main} ${textSize}`}>CVPlus</span>
        {showSlogan && (
          <span className={`text-xs ${textClasses.slogan}`}>From Paper to Powerful: Your CV, Reinvented</span>
        )}
      </div>
    </div>
  );
};

export default Logo;