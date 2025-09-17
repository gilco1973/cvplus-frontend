/**
 * Core Web Vitals Service Placeholder
 *
 * This is a placeholder implementation for the admin module to maintain independence.
  */

export interface WebVitalsMetrics {
  cls: number;
  fid: number;
  lcp: number;
  fcp: number;
  ttfb: number;
}

class CoreWebVitalsService {
  async getMetrics(): Promise<WebVitalsMetrics> {
    return {
      cls: 0.1,
      fid: 50,
      lcp: 2500,
      fcp: 1800,
      ttfb: 200
    };
  }

  async trackMetric(name: string, value: number): Promise<void> {
    console.log(`Tracking metric ${name}: ${value}`);
  }
}

export default new CoreWebVitalsService();