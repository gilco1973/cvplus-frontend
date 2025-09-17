// Custom hook for navigation state management
import { useState, useCallback, useEffect } from 'react';
import { EventBus, EventTypes } from '../services/EventBus';
import type { NavigationState, BreadcrumbItem } from '../types/navigation';

const initialNavigationState: NavigationState = {
  currentRoute: '/',
  breadcrumbs: [],
  sidebarCollapsed: false,
  activeModule: 'core-ui'
};

export function useNavigation() {
  const [navigationState, setNavigationState] = useState<NavigationState>(initialNavigationState);

  // Load navigation state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('cvplus-navigation');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setNavigationState(prev => ({ ...prev, ...parsedState }));
      } catch (error) {
        console.warn('Failed to parse saved navigation state:', error);
      }
    }
  }, []);

  // Save navigation state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cvplus-navigation', JSON.stringify(navigationState));

    // Emit navigation change event for other microservices
    EventBus.emit({
      type: EventTypes.NAVIGATION_CHANGED,
      source: 'core-ui',
      target: 'all',
      payload: navigationState
    });
  }, [navigationState]);

  const setCurrentRoute = useCallback((route: string) => {
    setNavigationState(prev => ({ ...prev, currentRoute: route }));
  }, []);

  const setBreadcrumbs = useCallback((breadcrumbs: BreadcrumbItem[]) => {
    setNavigationState(prev => ({ ...prev, breadcrumbs }));
  }, []);

  const addBreadcrumb = useCallback((breadcrumb: Omit<BreadcrumbItem, 'active'>) => {
    setNavigationState(prev => ({
      ...prev,
      breadcrumbs: [
        ...prev.breadcrumbs.map(b => ({ ...b, active: false })),
        { ...breadcrumb, active: true }
      ]
    }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setNavigationState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setNavigationState(prev => ({ ...prev, sidebarCollapsed: collapsed }));
  }, []);

  const setActiveModule = useCallback((module: string) => {
    setNavigationState(prev => ({ ...prev, activeModule: module }));
  }, []);

  const navigateToModule = useCallback((module: string, route?: string) => {
    setNavigationState(prev => ({
      ...prev,
      activeModule: module,
      currentRoute: route || `/${module}`,
      breadcrumbs: route ? [
        { label: 'Home', href: '/', active: false },
        { label: module, href: `/${module}`, active: true }
      ] : []
    }));
  }, []);

  return {
    navigationState,
    setCurrentRoute,
    setBreadcrumbs,
    addBreadcrumb,
    toggleSidebar,
    setSidebarCollapsed,
    setActiveModule,
    navigateToModule
  };
}