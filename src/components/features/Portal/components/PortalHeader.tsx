import React from 'react';
import {
  User,
  Menu,
  X,
  Home,
  Briefcase,
  MessageCircle,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  Monitor as SystemIcon,
  Settings
} from 'lucide-react';
import { PortalConfig } from '../../../../types/portal-types';

interface PortalHeaderProps {
  portalConfig: PortalConfig;
  layoutConfig?: any;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  activeSection: string;
  currentTheme: 'light' | 'dark' | 'auto';
  previewMode: 'desktop' | 'tablet' | 'mobile';
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  mode: 'public' | 'private' | 'preview';
  themeClasses: {
    background: string;
    text: string;
    secondary: string;
    border: string;
    card: string;
  };
  onNavigationClick: (sectionId: string) => void;
  onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
}

const DEFAULT_NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, href: '#home' },
  { id: 'about', label: 'About', icon: User, href: '#about' },
  { id: 'experience', label: 'Experience', icon: Briefcase, href: '#experience' },
  { id: 'contact', label: 'Contact', icon: MessageCircle, href: '#contact' }
];

const THEME_OPTIONS = {
  light: { name: 'Light', icon: Sun },
  dark: { name: 'Dark', icon: Moon },
  auto: { name: 'System', icon: SystemIcon }
};

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  portalConfig,
  layoutConfig,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  activeSection,
  currentTheme,
  previewMode,
  setPreviewMode,
  mode,
  themeClasses,
  onNavigationClick,
  onThemeChange
}) => {
  return (
    <header className={`${themeClasses.card} ${themeClasses.border} border-b sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            {layoutConfig?.header?.showAvatar && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              {layoutConfig?.header?.showName && (
                <h1 className="text-lg font-semibold">{portalConfig.name}</h1>
              )}
              {layoutConfig?.header?.showTitle && portalConfig.description && (
                <p className={`text-sm ${themeClasses.secondary}`}>{portalConfig.description}</p>
              )}
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {DEFAULT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigationClick(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : `${themeClasses.secondary} hover:text-blue-600`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Preview Mode Toggle */}
            {mode === 'preview' && (
              <div className="hidden md:flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {[{ mode: 'desktop', icon: Monitor }, { mode: 'tablet', icon: null }, { mode: 'mobile', icon: Smartphone }].map(({ mode: previewModeOption, icon: Icon }) => (
                  <button
                    key={previewModeOption}
                    onClick={() => setPreviewMode(previewModeOption as any)}
                    className={`p-2 rounded ${previewMode === previewModeOption ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
            
            {/* Theme Toggle */}
            <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {Object.entries(THEME_OPTIONS).map(([key, theme]) => {
                const Icon = theme.icon;
                return (
                  <button
                    key={key}
                    onClick={() => onThemeChange(key as any)}
                    className={`p-2 rounded transition-colors ${
                      currentTheme === key ? 'bg-white dark:bg-gray-600 shadow' : ''
                    }`}
                    title={theme.name}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
            
            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isSettingsOpen ? 'bg-blue-100 text-blue-700' : `${themeClasses.secondary} hover:text-blue-600`
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {/* Mobile Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${themeClasses.secondary} hover:text-blue-600`}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className={`md:hidden ${themeClasses.border} border-t`}>
          <div className="px-4 py-3 space-y-2">
            {DEFAULT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigationClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : `${themeClasses.secondary} hover:text-blue-600`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};