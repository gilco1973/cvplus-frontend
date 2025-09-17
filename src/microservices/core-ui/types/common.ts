// Common types shared across all microservices

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  displayName: string;
  photoURL?: string;
  roles: UserRole[];
  premiumTier: PremiumTier;
  lastLogin: Date;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export type PremiumTier = 'free' | 'basic' | 'professional' | 'enterprise';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface MicroserviceEvent {
  type: string;
  source: string;
  target: string;
  payload: any;
  timestamp: Date;
}

export type EventHandler = (event: MicroserviceEvent) => void;