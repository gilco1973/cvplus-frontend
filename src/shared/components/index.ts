/**
 * Shared Components Index
 *
 * Export all shared UI components that are used across multiple microservices.
 * These are truly cross-cutting components from core-ui microservice.
 *
 * Note: Components are accessed directly from core-ui microservice via the shared index
 * to avoid circular import issues and maintain clean module boundaries.
 */

// Core components are re-exported through the main shared index
// Microservices should import from '@cvplus/frontend/shared' to access common components
// Direct component imports should use the microservice-specific paths when needed