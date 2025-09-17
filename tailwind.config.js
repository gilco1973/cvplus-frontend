/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Explicitly include all microservices for comprehensive scanning
    "./src/microservices/**/*.{js,ts,jsx,tsx}",
    "./src/microservices/auth-ui/**/*.{js,ts,jsx,tsx}",
    "./src/microservices/cv-processing-ui/**/*.{js,ts,jsx,tsx}",
    "./src/microservices/multimedia-ui/**/*.{js,ts,jsx,tsx}",
    "./src/microservices/analytics-ui/**/*.{js,ts,jsx,tsx}",
    "./src/microservices/premium-ui/**/*.{js,ts,jsx,tsx}",
    "./src/microservices/public-profiles-ui/**/*.{js,ts,jsx,tsx}",
    "./src/microservices/admin-ui/**/*.{js,ts,jsx,tsx}",
    "./src/microservices/workflow-ui/**/*.{js,ts,jsx,tsx}",
    "./src/microservices/payments-ui/**/*.{js,ts,jsx,tsx}",
    "./src/microservices/core-ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // CVPlus Design System Colors
      colors: {
        // Legacy Shadcn/ui colors (maintained for compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // CVPlus Primary Brand Colors (Cyan-Blue Theme)
        primary: {
          DEFAULT: "#22d3ee", // CVPlus Primary Cyan
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          foreground: "#ffffff",
        },
        
        // CVPlus Secondary Brand Colors (Blue)
        secondary: {
          DEFAULT: "#3b82f6", // CVPlus Secondary Blue
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          foreground: "#ffffff",
        },
        
        // Neutral Colors (Optimized for dark theme)
        neutral: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937", // Card backgrounds
          900: "#111827", // Main background
        },
        
        // Semantic Colors
        success: {
          DEFAULT: "#10b981",
          50: "#ecfdf5",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        warning: {
          DEFAULT: "#f59e0b",
          50: "#fffbeb",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        error: {
          DEFAULT: "#ef4444",
          50: "#fef2f2",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        info: {
          DEFAULT: "#3b82f6",
          50: "#eff6ff",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        
        // Legacy colors for backward compatibility
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#374151",
          foreground: "#9ca3af",
        },
        accent: {
          DEFAULT: "#22d3ee",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#1f2937",
          foreground: "#f3f4f6",
        },
        card: {
          DEFAULT: "#1f2937",
          foreground: "#f3f4f6",
        },
      },
      
      // Typography Scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      
      // Spacing System (8px grid)
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Border Radius System
      borderRadius: {
        lg: "0.75rem", // 12px - CVPlus standard
        md: "0.5rem",  // 8px
        sm: "0.375rem", // 6px
        xl: "1rem",     // 16px
        '2xl': "1.5rem", // 24px
      },
      
      // Box Shadow System
      boxShadow: {
        'glow': '0 0 30px rgba(34, 211, 238, 0.5)',
        'glow-lg': '0 0 50px rgba(34, 211, 238, 0.3)',
      },
      
      // Animation Keyframes
      keyframes: {
        // Legacy Shadcn animations
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        
        // CVPlus custom animations
        'blob': {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        'fadeInUp': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'scaleIn': {
          'from': {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      
      // Animation Classes
      animation: {
        // Legacy
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        
        // CVPlus animations
        'blob': 'blob 7s infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },
      
      // Background Images for Gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%)',
        'gradient-hero': 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
        'gradient-accent': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // RTL support plugin
    function({ addUtilities, addBase, theme }) {
      // Add RTL base styles
      addBase({
        '[dir="rtl"]': {
          textAlign: 'right',
        },
        '[dir="rtl"] .rtl\\:text-left': {
          textAlign: 'left',
        },
        '[dir="rtl"] .rtl\\:text-right': {
          textAlign: 'right',
        },
      });

      // Add RTL-specific utilities
      addUtilities({
        // RTL margin and padding utilities
        '.rtl\\:ml-0': { '[dir="rtl"] &': { marginLeft: '0' } },
        '.rtl\\:mr-0': { '[dir="rtl"] &': { marginRight: '0' } },
        '.rtl\\:ml-auto': { '[dir="rtl"] &': { marginLeft: 'auto' } },
        '.rtl\\:mr-auto': { '[dir="rtl"] &': { marginRight: 'auto' } },
        '.rtl\\:pl-0': { '[dir="rtl"] &': { paddingLeft: '0' } },
        '.rtl\\:pr-0': { '[dir="rtl"] &': { paddingRight: '0' } },
        
        // RTL flex direction utilities
        '.rtl\\:flex-row-reverse': { '[dir="rtl"] &': { flexDirection: 'row-reverse' } },
        
        // RTL text alignment
        '.rtl\\:text-left': { '[dir="rtl"] &': { textAlign: 'left' } },
        '.rtl\\:text-right': { '[dir="rtl"] &': { textAlign: 'right' } },
        
        // RTL border utilities
        '.rtl\\:border-l-0': { '[dir="rtl"] &': { borderLeftWidth: '0' } },
        '.rtl\\:border-r': { '[dir="rtl"] &': { borderRightWidth: '1px' } },
        '.rtl\\:border-l': { '[dir="rtl"] &': { borderLeftWidth: '1px' } },
        '.rtl\\:border-r-0': { '[dir="rtl"] &': { borderRightWidth: '0' } },
        
        // RTL positioning
        '.rtl\\:left-0': { '[dir="rtl"] &': { left: '0' } },
        '.rtl\\:right-0': { '[dir="rtl"] &': { right: '0' } },
        '.rtl\\:left-auto': { '[dir="rtl"] &': { left: 'auto' } },
        '.rtl\\:right-auto': { '[dir="rtl"] &': { right: 'auto' } },
        
        // RTL transform utilities for icons and elements
        '.rtl\\:scale-x-flip': { '[dir="rtl"] &': { transform: 'scaleX(-1)' } },
      });
    }
  ],
}