// Mobile Navigation Components Export
export { Header } from '../Header';
export { Breadcrumb } from '../Breadcrumb';
export { generateBreadcrumbs } from '../../utils/breadcrumbs';
export { MobileBottomNav, MobileBottomNavSpacer } from '../MobileBottomNav';
export { MobilePageWrapper, MobileGestureWrapper } from '../MobilePageWrapper';
export { MobileFeatureSelection } from '../MobileFeatureSelection';
export { ResponsiveStepIndicator, CompactStepIndicator } from '../ResponsiveStepIndicator';
export { 
  MobilePageLayout,
  CVAnalysisPageLayout,
  CVPreviewPageLayout,
  ProcessingPageLayout,
  HomePageLayout
} from '../MobilePageLayout';

// Hooks
export { 
  useSwipeGestures, 
  useStepNavigation, 
  usePullToRefresh 
} from '../../hooks/useSwipeGestures';

// Types
export interface MobileNavigationProps {
  currentStep?: string;
  jobId?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  variant?: 'default' | 'dark';
  disabled?: boolean;
  isLoading?: boolean;
}

export interface GestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouchmove?: boolean;
  disabled?: boolean;
}