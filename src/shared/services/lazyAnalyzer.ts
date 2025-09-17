/**
 * Lazy CVAnalyzer - Bundle Size Optimized
 * 
 * This module provides lazy-loaded CVAnalyzer functions to avoid static imports
 * and improve bundle splitting.
 */

let cvAnalyzerModule: typeof import('./cv/CVAnalyzer') | null = null;

async function getCVAnalyzer() {
  if (!cvAnalyzerModule) {
    cvAnalyzerModule = await import('./cv/CVAnalyzer');
  }
  return cvAnalyzerModule.CVAnalyzer;
}

export const analyzeAchievements = async (...args: Parameters<typeof import('./cv/CVAnalyzer').CVAnalyzer.analyzeAchievements>) => {
  const CVAnalyzer = await getCVAnalyzer();
  return CVAnalyzer.analyzeAchievements(...args);
};

export const generateAchievementShowcase = async (...args: Parameters<typeof import('./cv/CVAnalyzer').CVAnalyzer.generateAchievementShowcase>) => {
  const CVAnalyzer = await getCVAnalyzer();
  return CVAnalyzer.generateAchievementShowcase(...args);
};