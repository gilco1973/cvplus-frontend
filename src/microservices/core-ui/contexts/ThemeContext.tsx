// Theme context for managing application-wide theme state
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ThemeConfig } from '../types/theme';
import { EventBus, EventTypes } from '../services/EventBus';

interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

const defaultTheme: ThemeConfig = {
  mode: 'dark',
  primaryColor: '#22d3ee',
  fontFamily: 'Inter, sans-serif',
  customizations: []
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Partial<ThemeConfig>;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig>({
    ...defaultTheme,
    ...initialTheme
  });

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('cvplus-theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setThemeState(prev => ({ ...prev, ...parsedTheme }));
      } catch (error) {
        console.warn('Failed to parse saved theme:', error);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Set dark/light mode
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set CSS custom properties for theme
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--font-family', theme.fontFamily);

    // Apply custom theme properties
    theme.customizations.forEach(({ property, value }) => {
      root.style.setProperty(`--${property}`, value);
    });

    // Save to localStorage
    localStorage.setItem('cvplus-theme', JSON.stringify(theme));

    // Emit theme change event for other microservices
    EventBus.emit({
      type: EventTypes.THEME_CHANGED,
      source: 'core-ui',
      target: 'all',
      payload: theme
    });
  }, [theme]);

  const setTheme = (updates: Partial<ThemeConfig>) => {
    setThemeState(prev => ({ ...prev, ...updates }));
  };

  const toggleDarkMode = () => {
    setTheme({ mode: theme.mode === 'dark' ? 'light' : 'dark' });
  };

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleDarkMode,
    isDarkMode: theme.mode === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}