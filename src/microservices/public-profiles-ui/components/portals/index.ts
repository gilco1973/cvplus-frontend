// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore
/**
 * Portal Components Export
 * 
 * Central export file for all portal-related components
  */

export { PortalChatInterface } from './PortalChatInterface';

// Re-export types for convenience
export type {
  PortalChatInterfaceProps,
  PortalLayoutProps,
  PortalDeploymentStatusProps,
  PortalSectionsProps,
  PortalQRIntegrationProps
} from '../../../types/portal-component-props';

export type {
  PortalConfig,
  ChatConfig,
  ChatMessage,
  PortalError,
  RAGSourceDocument
} from '../../../types/portal-types';
