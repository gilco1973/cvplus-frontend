/**
 * Shared Providers Index
 *
 * Export all shared React providers that are used across multiple microservices.
 * These are wrapper components that provide global state and context.
 */

// Re-export providers from core-ui via the main index to avoid module resolution issues
// Providers are available through the main shared index and direct microservice imports