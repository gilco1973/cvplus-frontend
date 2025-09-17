/**
 * Integration Service
 * Handles calendar, portfolio, QR codes, social media, and public profile integrations
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';

export class IntegrationService {
  // Calendar Integration
  static async generateCalendarEvents(jobId: string) {
    const calendarFunction = httpsCallable(functions, 'generateCalendarEvents');
    const result = await calendarFunction({ jobId });
    return result.data;
  }

  static async syncToGoogleCalendar(jobId: string, accessToken?: string) {
    const syncFunction = httpsCallable(functions, 'syncToGoogleCalendar');
    const result = await syncFunction({ jobId, accessToken });
    return result.data;
  }

  static async syncToOutlook(jobId: string, accessToken?: string) {
    const syncFunction = httpsCallable(functions, 'syncToOutlook');
    const result = await syncFunction({ jobId, accessToken });
    return result.data;
  }

  static async downloadICalFile(jobId: string) {
    const downloadFunction = httpsCallable(functions, 'downloadICalFile');
    const result = await downloadFunction({ jobId });
    return result.data;
  }

  static async handleCalendarCallback(provider: 'google' | 'outlook', code: string, state: string) {
    const callbackFunction = httpsCallable(functions, 'handleCalendarCallback');
    const result = await callbackFunction({ provider, code, state });
    return result.data;
  }

  // Portfolio Gallery
  static async generatePortfolioGallery(jobId: string) {
    const generateFunction = httpsCallable(functions, 'generatePortfolioGallery');
    const result = await generateFunction({ jobId });
    return result.data;
  }

  static async updatePortfolioItem(jobId: string, itemId: string, updates: unknown) {
    const updateFunction = httpsCallable(functions, 'updatePortfolioItem');
    const result = await updateFunction({ jobId, itemId, updates });
    return result.data;
  }

  static async addPortfolioItem(jobId: string, item: unknown) {
    const addFunction = httpsCallable(functions, 'addPortfolioItem');
    const result = await addFunction({ jobId, item });
    return result.data;
  }

  static async deletePortfolioItem(jobId: string, itemId: string) {
    const deleteFunction = httpsCallable(functions, 'deletePortfolioItem');
    const result = await deleteFunction({ jobId, itemId });
    return result.data;
  }

  static async uploadPortfolioMedia(jobId: string, itemId: string, file: File) {
    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
    });
    reader.readAsDataURL(file);
    
    const mediaData = await base64Promise;
    
    const uploadFunction = httpsCallable(functions, 'uploadPortfolioMedia');
    const result = await uploadFunction({
      jobId,
      itemId,
      mediaData,
      mediaType: file.type,
      fileName: file.name
    });
    return result.data;
  }

  static async generateShareablePortfolio(jobId: string, customDomain?: string) {
    const shareFunction = httpsCallable(functions, 'generateShareablePortfolio');
    const result = await shareFunction({ jobId, customDomain });
    return result.data;
  }

  // QR Code Management
  static async generateQRCode(jobId: string, config: unknown) {
    const generateFunction = httpsCallable(functions, 'generateQRCode');
    const result = await generateFunction({ jobId, config });
    return result.data;
  }

  static async trackQRCodeScan(qrCodeId: string, scanData: unknown) {
    const trackFunction = httpsCallable(functions, 'trackQRCodeScan');
    const result = await trackFunction({ qrCodeId, scanData });
    return result.data;
  }

  static async getQRCodes(jobId: string) {
    const getFunction = httpsCallable(functions, 'getQRCodes');
    const result = await getFunction({ jobId });
    return result.data;
  }

  static async updateQRCode(jobId: string, qrCodeId: string, updates: unknown) {
    const updateFunction = httpsCallable(functions, 'updateQRCode');
    const result = await updateFunction({ jobId, qrCodeId, updates });
    return result.data;
  }

  static async deleteQRCode(jobId: string, qrCodeId: string) {
    const deleteFunction = httpsCallable(functions, 'deleteQRCode');
    const result = await deleteFunction({ jobId, qrCodeId });
    return result.data;
  }

  static async getQRAnalytics(jobId: string, qrCodeId?: string) {
    const analyticsFunction = httpsCallable(functions, 'getQRAnalytics');
    const result = await analyticsFunction({ jobId, qrCodeId });
    return result.data;
  }

  static async getQRTemplates() {
    const templatesFunction = httpsCallable(functions, 'getQRTemplates');
    const result = await templatesFunction({});
    return result.data;
  }

  // Social Media Integration
  static async generateSocialMediaIntegration(jobId: string) {
    const generateFunction = httpsCallable(functions, 'generateSocialMediaIntegration');
    const result = await generateFunction({ jobId });
    return result.data;
  }

  static async addSocialProfile(jobId: string, profile: unknown) {
    const addFunction = httpsCallable(functions, 'addSocialProfile');
    const result = await addFunction({ jobId, profile });
    return result.data;
  }

  static async updateSocialProfile(jobId: string, profileId: string, updates: unknown) {
    const updateFunction = httpsCallable(functions, 'updateSocialProfile');
    const result = await updateFunction({ jobId, profileId, updates });
    return result.data;
  }

  static async removeSocialProfile(jobId: string, profileId: string) {
    const removeFunction = httpsCallable(functions, 'removeSocialProfile');
    const result = await removeFunction({ jobId, profileId });
    return result.data;
  }

  static async trackSocialClick(jobId: string, platform: string, metadata?: unknown) {
    const trackFunction = httpsCallable(functions, 'trackSocialClick');
    const result = await trackFunction({ jobId, platform, metadata });
    return result.data;
  }

  static async getSocialAnalytics(jobId: string) {
    const analyticsFunction = httpsCallable(functions, 'getSocialAnalytics');
    const result = await analyticsFunction({ jobId });
    return result.data;
  }

  static async updateSocialDisplaySettings(jobId: string, displaySettings: unknown) {
    const updateFunction = httpsCallable(functions, 'updateSocialDisplaySettings');
    const result = await updateFunction({ jobId, displaySettings });
    return result.data;
  }
}