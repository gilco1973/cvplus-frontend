/**
 * CVPlus Unified Design System
 * Comprehensive design tokens and component specifications
 * 
 * Theme: "Paper to Powerful" - Professional transformation with modern aesthetics
 * Primary Brand Colors: Cyan-Blue Gradient for transformation & power
 */

// =============================================================================
// COLOR PALETTE - UNIFIED BRAND COLORS
// =============================================================================

export const colors = {
  // Primary Brand Colors (Cyan-Blue Gradient Theme)
  primary: {
    50: '#ecfeff',   // Very light cyan
    100: '#cffafe',  // Light cyan
    200: '#a5f3fc',  // Lighter cyan
    300: '#67e8f9',  // Medium cyan
    400: '#22d3ee',  // CVPlus Primary Cyan
    500: '#06b6d4',  // Default primary
    600: '#0891b2',  // Darker cyan
    700: '#0e7490',  // Dark cyan
    800: '#155e75',  // Very dark cyan
    900: '#164e63',  // Darkest cyan
  },
  
  // Secondary Brand Colors (Blue for contrast)
  secondary: {
    50: '#eff6ff',   // Very light blue
    100: '#dbeafe',  // Light blue
    200: '#bfdbfe',  // Lighter blue
    300: '#93c5fd',  // Medium blue
    400: '#60a5fa',  // CVPlus Secondary Blue
    500: '#3b82f6',  // Default secondary
    600: '#2563eb',  // Darker blue
    700: '#1d4ed8',  // Dark blue
    800: '#1e40af',  // Very dark blue
    900: '#1e3a8a',  // Darkest blue
  },
  
  // Neutral Grays (Dark theme optimized)
  neutral: {
    50: '#f9fafb',   // Almost white
    100: '#f3f4f6',  // Very light gray
    200: '#e5e7eb',  // Light gray
    300: '#d1d5db',  // Medium light gray
    400: '#9ca3af',  // Medium gray
    500: '#6b7280',  // Default gray
    600: '#4b5563',  // Dark gray
    700: '#374151',  // Darker gray
    800: '#1f2937',  // Very dark gray (cards)
    900: '#111827',  // Darkest gray (backgrounds)
  },
  
  // Semantic Colors
  semantic: {
    success: {
      50: '#ecfdf5',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
    },
    warning: {
      50: '#fffbeb',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    info: {
      50: '#eff6ff',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },
  
  // Gradient Definitions
  gradients: {
    primary: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
    secondary: 'linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%)',
    hero: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
    card: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.8) 100%)',
    button: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
    accent: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  },
} as const;

// =============================================================================
// TYPOGRAPHY SYSTEM
// =============================================================================

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  
  fontSize: {
    // Mobile-first approach
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px - Default body
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px - H3
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px - H2
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - H1
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px - Display
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px - Hero
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px - Hero Large
    '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px - Hero XL
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Typography Usage Guidelines
  usage: {
    display: { size: '4xl', weight: 'bold', color: 'neutral.100' },
    h1: { size: '3xl', weight: 'bold', color: 'neutral.100' },
    h2: { size: '2xl', weight: 'semibold', color: 'neutral.100' },
    h3: { size: 'xl', weight: 'semibold', color: 'neutral.100' },
    body: { size: 'base', weight: 'normal', color: 'neutral.100' },
    bodyLarge: { size: 'lg', weight: 'normal', color: 'neutral.300' },
    small: { size: 'sm', weight: 'normal', color: 'neutral.400' },
    caption: { size: 'xs', weight: 'normal', color: 'neutral.500' },
    button: { size: 'sm', weight: 'semibold', color: 'white' },
    link: { size: 'base', weight: 'medium', color: 'primary.400' },
  },
} as const;

// =============================================================================
// SPACING SYSTEM (8px Grid)
// =============================================================================

export const spacing = {
  0: '0px',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px - Base unit
  3: '0.75rem', // 12px
  4: '1rem',    // 16px - Standard spacing
  5: '1.25rem', // 20px
  6: '1.5rem',  // 24px - Section spacing
  8: '2rem',    // 32px - Large spacing
  10: '2.5rem', // 40px
  12: '3rem',   // 48px - Hero spacing
  16: '4rem',   // 64px
  20: '5rem',   // 80px
  24: '6rem',   // 96px
  32: '8rem',   // 128px
} as const;

// =============================================================================
// COMPONENT SPECIFICATIONS
// =============================================================================

export const components = {
  // Button Component Variants
  button: {
    base: 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    
    variants: {
      primary: {
        default: 'bg-gradient-to-r from-primary-400 to-secondary-500 text-white shadow-lg hover:shadow-xl hover:from-primary-500 hover:to-secondary-600 focus:ring-primary-500 transform hover:-translate-y-0.5',
        loading: 'bg-gradient-to-r from-primary-400 to-secondary-500 text-white opacity-75 cursor-not-allowed',
        disabled: 'bg-neutral-600 text-neutral-400 cursor-not-allowed',
      },
      secondary: {
        default: 'border-2 border-primary-400 text-primary-400 hover:bg-primary-400 hover:text-white focus:ring-primary-400',
        loading: 'border-2 border-primary-400 text-primary-400 opacity-75 cursor-not-allowed',
        disabled: 'border-2 border-neutral-600 text-neutral-500 cursor-not-allowed',
      },
      ghost: {
        default: 'text-neutral-300 hover:text-primary-400 hover:bg-neutral-800 focus:ring-neutral-500',
        loading: 'text-neutral-400 opacity-75 cursor-not-allowed',
        disabled: 'text-neutral-600 cursor-not-allowed',
      },
      danger: {
        default: 'bg-semantic-error-500 text-white hover:bg-semantic-error-600 focus:ring-semantic-error-500 shadow-lg hover:shadow-xl',
        loading: 'bg-semantic-error-500 text-white opacity-75 cursor-not-allowed',
        disabled: 'bg-neutral-600 text-neutral-400 cursor-not-allowed',
      },
    },
    
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    },
  },
  
  // Navigation Component
  navigation: {
    header: {
      background: 'bg-neutral-800/80 backdrop-blur-md',
      border: 'border-b border-neutral-700',
      sticky: 'sticky top-0 z-50',
    },
    
    link: {
      base: 'font-medium transition-colors duration-200',
      default: 'text-neutral-300 hover:text-primary-400',
      active: 'text-primary-400',
      mobile: 'block px-4 py-2 text-base',
    },
    
    logo: {
      container: 'flex items-center gap-3',
      image: 'h-10 w-auto object-contain', // Consistent logo size
      text: 'font-bold text-xl text-white',
    },
  },
  
  // Card Component
  card: {
    base: 'rounded-xl border border-neutral-700 transition-all duration-200',
    variants: {
      default: 'bg-neutral-800/50 backdrop-blur-sm',
      elevated: 'bg-neutral-800 shadow-lg',
      interactive: 'bg-neutral-800/50 backdrop-blur-sm hover:border-primary-500/50 hover:shadow-lg cursor-pointer',
      glass: 'bg-neutral-800/30 backdrop-blur-md border-neutral-600/30',
    },
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  
  // Form Elements
  form: {
    input: {
      base: 'w-full px-4 py-3 bg-neutral-700 border border-neutral-600 text-neutral-100 rounded-lg transition-colors duration-200 placeholder-neutral-400',
      focus: 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
      error: 'border-semantic-error-500 focus:ring-semantic-error-500',
      disabled: 'bg-neutral-800 text-neutral-500 cursor-not-allowed',
    },
    
    label: 'block text-sm font-medium text-neutral-300 mb-2',
    
    textarea: {
      base: 'w-full px-4 py-3 bg-neutral-700 border border-neutral-600 text-neutral-100 rounded-lg resize-none placeholder-neutral-400 transition-colors duration-200',
      focus: 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    },
    
    select: {
      base: 'w-full px-4 py-3 bg-neutral-700 border border-neutral-600 text-neutral-100 rounded-lg transition-colors duration-200',
      focus: 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    },
  },
  
  // Modal/Dialog
  modal: {
    overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
    container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    content: 'bg-neutral-800 rounded-xl border border-neutral-700 shadow-2xl max-w-md w-full p-6',
    header: 'flex items-center justify-between mb-4',
    title: 'text-xl font-semibold text-neutral-100',
    closeButton: 'text-neutral-400 hover:text-neutral-200 transition-colors',
  },
  
  // Loading States
  loading: {
    spinner: 'animate-spin rounded-full border-2 border-neutral-600 border-t-primary-400',
    skeleton: 'animate-pulse bg-neutral-700 rounded',
    text: 'text-neutral-400',
  },
  
  // Status Indicators
  status: {
    success: 'bg-semantic-success-500/10 border border-semantic-success-500/20 text-semantic-success-400',
    warning: 'bg-semantic-warning-500/10 border border-semantic-warning-500/20 text-semantic-warning-400',
    error: 'bg-semantic-error-500/10 border border-semantic-error-500/20 text-semantic-error-400',
    info: 'bg-semantic-info-500/10 border border-semantic-info-500/20 text-semantic-info-400',
  },
} as const;

// =============================================================================
// ANIMATION SYSTEM
// =============================================================================

export const animations = {
  // Transition Durations
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  // Easing Functions
  easing: {
    linear: 'linear',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Common Animation Classes
  classes: {
    fadeIn: 'animate-fade-in',
    fadeInUp: 'animate-fade-in-up',
    scaleIn: 'animate-scale-in',
    slideInRight: 'animate-slide-in-right',
    bounceIn: 'animate-bounce-in',
    hoverLift: 'hover-lift',
    hoverGlow: 'hover-glow',
    float: 'animate-float',
  },
} as const;

// =============================================================================
// LAYOUT SYSTEM
// =============================================================================

export const layout = {
  // Container Widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
  },
  
  // Responsive Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Common Layout Patterns
  patterns: {
    heroSection: 'py-20 px-4 sm:px-6 lg:px-8',
    section: 'py-16 px-4 sm:px-6 lg:px-8',
    container: 'max-w-7xl mx-auto',
    grid: {
      responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      features: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8',
      cards: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6',
    },
  },
  
  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1020,
    banner: 1030,
    overlay: 1040,
    modal: 1050,
    popover: 1060,
    skipLink: 1070,
    tooltip: 1080,
  },
} as const;

// =============================================================================
// ACCESSIBILITY STANDARDS
// =============================================================================

export const accessibility = {
  // Focus Ring Standards
  focusRing: {
    default: 'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900',
    inset: 'focus:ring-2 focus:ring-primary-500 focus:ring-inset',
  },
  
  // Color Contrast Requirements
  contrast: {
    // All combinations meet WCAG 2.1 AA standards
    text: {
      primary: 'text-neutral-100', // White on dark backgrounds
      secondary: 'text-neutral-300',
      muted: 'text-neutral-400',
    },
    links: {
      default: 'text-primary-400',
      hover: 'text-primary-300',
      visited: 'text-primary-500',
    },
  },
  
  // Screen Reader Support
  srOnly: 'sr-only',
  
  // Keyboard Navigation
  keyboard: {
    interactive: 'focus:outline-none focus:ring-2 focus:ring-primary-500',
    skip: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black p-2 rounded',
  },
} as const;

// =============================================================================
// BRAND GUIDELINES
// =============================================================================

export const brand = {
  // Brand Values
  values: {
    transformation: 'From Paper to Powerful',
    innovation: 'AI-Powered CV Enhancement',
    professionalism: 'Enterprise-Ready Quality',
    accessibility: 'Inclusive Design for All',
  },
  
  // Logo Usage
  logo: {
    // Consistent sizing across components
    sizes: {
      small: 'h-8',   // Navigation, mobile
      medium: 'h-10', // Header, default
      large: 'h-12',  // Hero sections
    },
    variants: {
      white: 'Logo with white text',
      dark: 'Logo with dark text', 
      default: 'Logo with brand colors',
    },
  },
  
  // Voice & Tone
  voice: {
    professional: 'Authoritative yet approachable',
    innovative: 'Cutting-edge but reliable',
    supportive: 'Helpful and encouraging',
    confident: 'Expert guidance with humility',
  },
  
  // Visual Style Guidelines
  style: {
    cornerRadius: {
      sm: '0.375rem',  // 6px
      default: '0.5rem',    // 8px
      lg: '0.75rem',   // 12px
      xl: '1rem',      // 16px
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
      default: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 25px rgba(0, 0, 0, 0.2)',
      xl: '0 20px 40px rgba(0, 0, 0, 0.3)',
      glow: '0 0 30px rgba(34, 211, 238, 0.5)',
    },
  },
} as const;

// =============================================================================
// USAGE GUIDELINES
// =============================================================================

export const usage = {
  // Color Usage Rules
  colors: {
    primary: 'Use for CTAs, active states, and key interactive elements',
    secondary: 'Use for supporting actions and secondary information',
    neutral: 'Use for text, borders, and background elements',
    semantic: 'Use only for their specific meanings (success, error, etc.)',
  },
  
  // Typography Hierarchy
  typography: {
    hierarchy: 'Follow consistent heading order (h1 → h2 → h3)',
    contrast: 'Ensure 4.5:1 contrast ratio minimum for text',
    lineLength: 'Keep line length between 45-75 characters for readability',
  },
  
  // Component Guidelines
  components: {
    buttons: 'Use primary for main actions, secondary for alternatives',
    cards: 'Use interactive variant for clickable cards only',
    forms: 'Always include proper labels and error states',
    navigation: 'Maintain consistent active states across pages',
  },
} as const;

// Export design system as default
export const designSystem = {
  colors,
  typography,
  spacing,
  components,
  animations,
  layout,
  accessibility,
  brand,
  usage,
} as const;

export default designSystem;