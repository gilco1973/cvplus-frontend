// Theme-related types for core-ui microservice

export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  fontFamily: string;
  customizations: ThemeCustomization[];
}

export interface ThemeCustomization {
  property: string;
  value: string;
  scope: 'global' | 'component';
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  DEFAULT: string;
  foreground: string;
}

export interface BreakpointConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface SpacingConfig {
  [key: string]: string;
}

export interface TypographyConfig {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: {
    [key: string]: [string, { lineHeight: string }];
  };
}