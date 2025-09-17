/**
 * Shared Services Index
 *
 * Export all shared services that are used across multiple microservices.
 * These are common API clients, utilities, and business logic.
 */

// Re-export services from core-ui via the main index to avoid module resolution issues
// Services including EventBus and NotificationService are available through the main shared index