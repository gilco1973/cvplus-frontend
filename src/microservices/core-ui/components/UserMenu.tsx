import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, HelpCircle, Crown, Settings, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
  variant?: 'default' | 'white' | 'dark';
  size?: 'default' | 'small';
}

// Hook to manage subscription data - simplified implementation for core-ui
const useSubscription = () => {
  const [subscription, setSubscription] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLifetimePremium, setIsLifetimePremium] = React.useState(false);

  // This would normally connect to the premium microservice
  // For now, return default values
  return {
    subscription,
    isLifetimePremium,
    isLoading
  };
};

export const UserMenu: React.FC<UserMenuProps> = ({ variant = 'default', size = 'default' }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const { subscription, isLifetimePremium, isLoading: premiumLoading } = useSubscription();

  if (!user) return null;

  const displayName = user.displayName || user.email || 'Anonymous User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getTextClasses = () => {
    switch (variant) {
      case 'white':
        return 'text-white hover:text-blue-200';
      case 'dark':
        return 'text-gray-700 hover:text-blue-600';
      default:
        return 'text-gray-600 hover:text-blue-600';
    }
  };

  const getDropdownClasses = () => {
    switch (variant) {
      case 'white':
      case 'default':
        return 'bg-white border-gray-200 text-gray-900';
      case 'dark':
        return 'bg-gray-800 border-gray-700 text-gray-100';
      default:
        return 'bg-white border-gray-200 text-gray-900';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 transition font-medium ${getTextClasses()}`}
      >
        <div className={`relative bg-blue-600 text-white rounded-full flex items-center justify-center font-medium ${
          size === 'small' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
        }`}>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName}
              className={size === 'small' ? 'w-6 h-6 rounded-full' : 'w-8 h-8 rounded-full'}
            />
          ) : (
            initials
          )}
          {/* Premium Badge */}
          {isLifetimePremium && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <Crown className="w-2 h-2 text-yellow-900" />
            </div>
          )}
        </div>
        {size !== 'small' && (
          <div className="hidden sm:block">
            <span className="text-sm font-medium">{displayName}</span>
            {isLifetimePremium && (
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-yellow-600 font-medium">Premium</span>
              </div>
            )}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 z-20 border ${getDropdownClasses()}`}>
            <div className={`px-4 py-2 border-b ${variant === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${variant === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{displayName}</p>
                  {user.email && (
                    <p className={`text-xs ${variant === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                  )}
                </div>
                {isLifetimePremium && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-md">
                    <Crown className="w-3 h-3 text-yellow-700" />
                    <span className="text-xs font-medium text-yellow-800">Premium</span>
                  </div>
                )}
              </div>
              {/* Premium Status Loading */}
              {premiumLoading && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="w-3 h-3 border border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500">Checking premium status...</span>
                </div>
              )}
            </div>
            {/* Premium Account Management */}
            {isLifetimePremium && (
              <button
                onClick={() => {
                  navigate('/pricing');
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                  variant === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                Premium Account
              </button>
            )}

            {/* Upgrade to Premium (for non-premium users) */}
            {!isLifetimePremium && !premiumLoading && (
              <button
                onClick={() => {
                  navigate('/pricing');
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border-l-2 border-yellow-400 ${
                  variant === 'dark'
                    ? 'text-yellow-800'
                    : 'text-yellow-800'
                }`}
              >
                <Crown className="w-4 h-4 text-yellow-600" />
                Upgrade to Premium
              </button>
            )}

            <button
              onClick={() => {
                navigate('/faq');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                variant === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Help & FAQ
            </button>
            <button
              onClick={async () => {
                await signOut();
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                variant === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;