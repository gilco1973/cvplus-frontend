// Legacy compatibility layer - imports the new modular CVPreview
// This maintains backward compatibility while using the refactored code

export { CVPreview } from './cv-preview/CVPreview';

// Re-export types for backward compatibility
export type { CVPreviewProps } from '../types/cv-preview';