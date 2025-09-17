// @ts-ignore
/**
 * Type definitions for interactive multimedia components
  */

export interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  fgColor?: string;
  bgColor?: string;
  onGenerated?: (dataUrl: string) => void;
}

export interface DynamicElementProps {
  data: Record<string, unknown>;
  template: string;
  updateInterval?: number;
  onUpdate?: (data: Record<string, unknown>) => void;
}

export interface InteractiveControlProps {
  actions: ActionConfig[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  disabled?: boolean;
  className?: string;
}

export interface InteractionConfig {
  enabled: boolean;
  gestures?: GestureConfig;
  keyboard?: KeyboardConfig;
  mouse?: MouseConfig;
}

export interface ActionConfig {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
}

export interface GestureConfig {
  swipe?: boolean;
  pinch?: boolean;
  tap?: boolean;
}

export interface KeyboardConfig {
  shortcuts: KeyboardShortcut[];
}

export interface MouseConfig {
  doubleClick?: boolean;
  rightClick?: boolean;
  hover?: boolean;
}

export interface KeyboardShortcut {
  key: string;
  modifiers?: string[];
  action: () => void;
}