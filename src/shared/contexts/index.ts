/**
 * Shared Contexts Index
 *
 * Export all shared React contexts that are used across multiple microservices.
 * These are global state management contexts for cross-cutting concerns.
 */

// Re-export contexts from core-ui via the main index to avoid module resolution issues
// Contexts are available through the main shared index and direct microservice imports