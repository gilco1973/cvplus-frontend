/**
 * Profile Service
 * Handles public profiles, contact forms, QR tracking, and RAG chat functionality
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';

export class ProfileService {
  // Public Profile Management
  static async createPublicProfile(jobId: string) {
    const createProfileFunction = httpsCallable(functions, 'createPublicProfile');
    const result = await createProfileFunction({ jobId });
    return result.data;
  }

  static async getPublicProfile(slug: string) {
    const getProfileFunction = httpsCallable(functions, 'getPublicProfile');
    const result = await getProfileFunction({ slug });
    return result.data;
  }

  static async updatePublicProfileSettings(jobId: string, settings: unknown) {
    const updateSettingsFunction = httpsCallable(functions, 'updatePublicProfileSettings');
    const result = await updateSettingsFunction({
      jobId,
      settings
    });
    return result.data;
  }

  // Contact Form Management
  static async submitContactForm(
    jobId: string, 
    senderName: string, 
    senderEmail: string, 
    message: string,
    senderPhone?: string,
    company?: string
  ) {
    const submitFormFunction = httpsCallable(functions, 'submitContactForm');
    const result = await submitFormFunction({
      jobId,
      senderName,
      senderEmail,
      message,
      senderPhone,
      company
    });
    return result.data;
  }

  // QR Tracking
  static async trackQRScan(jobId: string, metadata?: unknown) {
    const trackScanFunction = httpsCallable(functions, 'trackQRScan');
    const result = await trackScanFunction({
      jobId,
      metadata
    });
    return result.data;
  }

  // RAG Chat System
  static async initializeRAG(jobId: string, systemPrompt?: string, personality?: string) {
    const initRAGFunction = httpsCallable(functions, 'initializeRAG');
    const result = await initRAGFunction({
      jobId,
      systemPrompt,
      personality
    });
    return result.data;
  }

  static async startChatSession(jobId: string, visitorId?: string, metadata?: unknown) {
    const startChatFunction = httpsCallable(functions, 'startChatSession');
    const result = await startChatFunction({
      jobId,
      visitorId,
      metadata
    });
    return result.data;
  }

  static async sendChatMessage(sessionId: string, message: string) {
    const sendMessageFunction = httpsCallable(functions, 'sendChatMessage');
    const result = await sendMessageFunction({
      sessionId,
      message
    });
    return result.data;
  }

  static async endChatSession(sessionId: string, rating?: number, feedback?: string) {
    const endChatFunction = httpsCallable(functions, 'endChatSession');
    const result = await endChatFunction({
      sessionId,
      rating,
      feedback
    });
    return result.data;
  }

  static async getChatAnalytics(jobId: string) {
    const analyticsFunction = httpsCallable(functions, 'getChatAnalytics');
    const result = await analyticsFunction({ jobId });
    return result.data;
  }
}