// @ts-ignore - Export conflictsimport { QRCodeOptions, QRCodeTemplate } from './types';

/**
 * Generate QR code options from template and customization
  */
export const generateQROptions = (
  template: QRCodeTemplate,
  customization?: {
    size?: number;
    backgroundColor?: string;
    foregroundColor?: string;
  }
): QRCodeOptions => {
  return {
    width: customization?.size || template.style.width,
    margin: template.style.margin,
    color: {
      dark: customization?.foregroundColor || template.style.foregroundColor,
      light: customization?.backgroundColor || template.style.backgroundColor
    },
    errorCorrectionLevel: template.style.errorCorrectionLevel
  };
};

/**
 * Validate URL for QR code generation
  */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith('mailto:') || url.startsWith('tel:');
  }
};

/**
 * Generate vCard data for contact QR codes
  */
export const generateVCard = (contactData: {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  organization?: string;
}): string => {
  const vCard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    contactData.name ? `FN:${contactData.name}` : '',
    contactData.organization ? `ORG:${contactData.organization}` : '',
    contactData.email ? `EMAIL:${contactData.email}` : '',
    contactData.phone ? `TEL:${contactData.phone}` : '',
    contactData.website ? `URL:${contactData.website}` : '',
    'END:VCARD'
  ].filter(line => line).join('\n');
  
  return vCard;
};

/**
 * Apply style modifications to QR code canvas
  */
export const applyStyleModifications = (
  canvas: HTMLCanvasElement,
  style: 'square' | 'rounded' | 'circular'
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (style === 'square') return; // No modifications needed

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create temporary canvas for styled version
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  tempCtx.save();
  tempCtx.beginPath();
  
  if (style === 'circular') {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    tempCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  } else if (style === 'rounded') {
    const borderRadius = 20;
    const x = 10;
    const y = 10;
    const width = canvas.width - 20;
    const height = canvas.height - 20;
    
    tempCtx.moveTo(x + borderRadius, y);
    tempCtx.lineTo(x + width - borderRadius, y);
    tempCtx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
    tempCtx.lineTo(x + width, y + height - borderRadius);
    tempCtx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
    tempCtx.lineTo(x + borderRadius, y + height);
    tempCtx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
    tempCtx.lineTo(x, y + borderRadius);
    tempCtx.quadraticCurveTo(x, y, x + borderRadius, y);
  }
  
  tempCtx.clip();
  tempCtx.putImageData(imageData, 0, 0);
  tempCtx.restore();

  // Copy styled version back to main canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(tempCanvas, 0, 0);
};

/**
 * Add logo to QR code canvas
  */
export const addLogoToCanvas = async (
  canvas: HTMLCanvasElement,
  logoUrl: string,
  backgroundColor: string = '#FFFFFF'
): Promise<void> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const logo = new Image();
  logo.crossOrigin = 'anonymous';
  
  await new Promise((resolve, reject) => {
    logo.onload = resolve;
    logo.onerror = reject;
    logo.src = logoUrl;
  });

  // Calculate logo size (20% of QR code size)
  const logoSize = canvas.width * 0.2;
  const x = (canvas.width - logoSize) / 2;
  const y = (canvas.height - logoSize) / 2;

  // Draw white background for logo
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
  
  // Draw logo
  ctx.drawImage(logo, x, y, logoSize, logoSize);
};

/**
 * Copy canvas content to clipboard
  */
export const copyCanvasToClipboard = async (canvas: HTMLCanvasElement): Promise<void> => {
  const dataUrl = canvas.toDataURL('image/png');
  
  try {
    // Try to copy as blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
  } catch {
    // Fallback: copy data URL
    await navigator.clipboard.writeText(dataUrl);
  }
};

/**
 * Download canvas as image
  */
export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string): void => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Share canvas content using Web Share API
  */
export const shareCanvas = async (canvas: HTMLCanvasElement, title: string, text: string): Promise<void> => {
  if (!navigator.share) {
    throw new Error('Web Share API not supported');
  }

  const dataUrl = canvas.toDataURL('image/png');
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], `${title.toLowerCase().replace(/\s+/g, '-')}.png`, { type: 'image/png' });
  
  await navigator.share({
    title,
    text,
    files: [file]
  });
};

/**
 * Parse device information from user agent
  */
export const parseDeviceInfo = (userAgent: string) => {
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/.test(userAgent);
  
  let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';
  if (isMobile && !isTablet) deviceType = 'mobile';
  else if (isTablet) deviceType = 'tablet';
  else if (!isMobile) deviceType = 'desktop';
  
  let os = 'unknown';
  if (/Windows/.test(userAgent)) os = 'Windows';
  else if (/Mac/.test(userAgent)) os = 'macOS';
  else if (/Linux/.test(userAgent)) os = 'Linux';
  else if (/Android/.test(userAgent)) os = 'Android';
  else if (/iPhone|iPad/.test(userAgent)) os = 'iOS';
  
  let browser = 'unknown';
  if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) browser = 'Chrome';
  else if (/Firefox/.test(userAgent)) browser = 'Firefox';
  else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) browser = 'Safari';
  else if (/Edge/.test(userAgent)) browser = 'Edge';
  
  return { type: deviceType, os, browser };
};