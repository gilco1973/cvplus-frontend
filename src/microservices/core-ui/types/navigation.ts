// Navigation-related types for core-ui microservice

export interface NavigationState {
  currentRoute: string;
  breadcrumbs: BreadcrumbItem[];
  sidebarCollapsed: boolean;
  activeModule: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
  active: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
  permissions?: string[];
  activePatterns?: string[];
}

export interface SidebarSection {
  id: string;
  title: string;
  items: NavigationItem[];
  collapsible: boolean;
  defaultExpanded: boolean;
}

export interface MobileMenuState {
  isOpen: boolean;
  activeSection?: string;
}

export interface NavigationConfig {
  main: SidebarSection[];
  mobile: NavigationItem[];
  footer: NavigationItem[];
  quickActions: NavigationItem[];
}