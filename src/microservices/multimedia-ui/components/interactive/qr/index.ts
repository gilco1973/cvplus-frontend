// @ts-ignore - Export conflicts// QR Code Components
export { DynamicQRCode } from './DynamicQRCode';
export { EnhancedQRCode } from './EnhancedQRCode';
export { QRCustomizer } from './QRCustomizer';

// Types
export type {
  QRCodeTemplate,
  QRCodeConfig,
  QRCodeCustomization,
  QRCodeOptions,
  QRCodeAnalytics,
  EnhancedQRCodeData,
  QRCodeProps
} from './types';

// Utilities
export {
  generateQROptions,
  isValidUrl,
  generateVCard,
  applyStyleModifications,
  addLogoToCanvas,
  copyCanvasToClipboard,
  downloadCanvas,
  shareCanvas,
  parseDeviceInfo
} from './utils';