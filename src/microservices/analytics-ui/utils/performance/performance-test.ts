/**
 * Performance Test Suite for Template System
 * Validates memory leak fixes and performance improvements
 */

import { OptimizedTemplateGenerator } from '../cv-preview/optimized-template-generator';
import { enhancedCacheManager } from '../cv-preview/enhanced-cache-manager';
import { memoryMonitor } from './memory-monitor';
import { performanceMetrics } from './performance-metrics';
import type { CVTemplate, CVParsedData, TemplateGenerationOptions } from '../../types/cv-templates';

export interface PerformanceTestResult {
  testName: string;
  success: boolean;
  metrics: {
    avgGenerationTime: number;
    maxGenerationTime: number;
    minGenerationTime: number;
    memoryGrowth: number;
    cacheHitRate: number;
    errorCount: number;
    totalTests: number;
  };
  issues: string[];
  recommendations: string[];
}

export class PerformanceTestSuite {
  private testData: CVParsedData;
  private testTemplate: CVTemplate;

  constructor() {
    this.initializeTestData();
  }

  /**
   * Initialize test data
   */
  private initializeTestData(): void {
    this.testData = {
      personal: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        location: 'New York, NY',
        summary: 'Experienced software developer with 5+ years in full-stack development.',
        portfolio: 'https://johndoe.dev'
      },
      experience: [
        {
          position: 'Senior Software Developer',
          company: 'Tech Corp',
          startDate: '2020-01',
          endDate: 'Present',
          description: 'Led development of React applications with TypeScript and Node.js backend.',
          location: 'New York, NY'
        },
        {
          position: 'Software Developer',
          company: 'StartupXYZ',
          startDate: '2018-06',
          endDate: '2019-12',
          description: 'Developed web applications using modern JavaScript frameworks.',
          location: 'San Francisco, CA'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of Technology',
          startDate: '2014-09',
          endDate: '2018-05',
          gpa: '3.8',
          location: 'Boston, MA'
        }
      ],
      skills: [
        { name: 'JavaScript', level: 'Advanced' },
        { name: 'TypeScript', level: 'Advanced' },
        { name: 'React', level: 'Advanced' },
        { name: 'Node.js', level: 'Intermediate' },
        { name: 'Python', level: 'Intermediate' }
      ]
    };

    this.testTemplate = {
      id: 'test-template',
      name: 'Performance Test Template',
      category: 'professional',
      metadata: {
        version: '1.0.0',
        updated: Date.now()
      },
      styling: {
        colorPalette: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#f59e0b',
          background: '#ffffff',
          surface: '#f8fafc',
          text: {
            primary: '#1e293b',
            secondary: '#64748b'
          },
          border: '#e2e8f0'
        },
        typography: {
          headings: {
            fontFamily: 'Inter, system-ui, sans-serif'
          },
          body: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5'
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem'
        }
      },
      features: ['heavy-processing']
    };
  }

  /**
   * Run complete performance test suite
   */
  async runPerformanceTests(): Promise<PerformanceTestResult[]> {
    console.warn('🧪 Starting Performance Test Suite');
    
    const results: PerformanceTestResult[] = [];
    
    // Initialize systems
    await OptimizedTemplateGenerator.initialize();
    memoryMonitor.start();
    
    try {
      // Test 1: Memory Leak Detection
      results.push(await this.testMemoryLeaks());
      
      // Test 2: Generation Performance
      results.push(await this.testGenerationPerformance());
      
      // Test 3: Cache Efficiency
      results.push(await this.testCacheEfficiency());
      
      // Test 4: Concurrent Generation
      results.push(await this.testConcurrentGeneration());
      
      // Test 5: Large Data Handling
      results.push(await this.testLargeDataHandling());
      
    } finally {
      // Cleanup
      OptimizedTemplateGenerator.cleanup();
      memoryMonitor.stop();
    }
    
    console.warn('✅ Performance Test Suite Completed');
    return results;
  }

  /**
   * Test for memory leaks in template generation
   */
  async testMemoryLeaks(): Promise<PerformanceTestResult> {
    console.warn('🧠 Testing Memory Leak Prevention...');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Clear caches and take initial memory snapshot
    enhancedCacheManager.clearAll();
    performanceMetrics.clear();
    
    const initialMemory = memoryMonitor.getCurrentSnapshot();
    const generationTimes: number[] = [];
    let errorCount = 0;
    
    // Generate templates repeatedly to test for memory leaks
    const iterations = 50;
    
    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = performance.now();
        
        // Generate template with different options each time
        await OptimizedTemplateGenerator.generateHTML(
          this.testTemplate,
          this.testData,
          {
            enableOptimizations: i % 2 === 0,
            compress: i % 3 === 0,
            useWebWorkers: i % 4 === 0
          }
        );
        
        const endTime = performance.now();
        generationTimes.push(endTime - startTime);
        
        // Force garbage collection every 10 iterations if available
        if (i % 10 === 0 && (window as any).gc) {
          (window as any).gc();
        }
        
      } catch (error) {
        errorCount++;
        console.error(`Generation ${i} failed:`, error);
      }
    }
    
    // Take final memory snapshot
    const finalMemory = memoryMonitor.getCurrentSnapshot();
    const memoryGrowth = finalMemory 
      ? (finalMemory.usedJSHeapSize - (initialMemory?.usedJSHeapSize || 0)) / (1024 * 1024)
      : 0;
    
    // Analyze results
    const avgGenerationTime = generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length;
    const maxGenerationTime = Math.max(...generationTimes);
    const minGenerationTime = Math.min(...generationTimes);
    
    // Check for memory leaks
    if (memoryGrowth > 50) { // More than 50MB growth
      issues.push(`Potential memory leak detected: ${memoryGrowth.toFixed(2)}MB growth`);
    }
    
    // Check for performance degradation
    const lastTenAvg = generationTimes.slice(-10).reduce((a, b) => a + b, 0) / 10;
    const firstTenAvg = generationTimes.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    
    if (lastTenAvg > firstTenAvg * 1.5) {
      issues.push(`Performance degradation detected: ${((lastTenAvg / firstTenAvg - 1) * 100).toFixed(1)}% slower`);
    }
    
    // Generate recommendations
    if (memoryGrowth > 20) {
      recommendations.push('Consider implementing more aggressive cache cleanup');
    }
    
    if (avgGenerationTime > 2000) {
      recommendations.push('Template generation time exceeds 2s target');
    }
    
    if (errorCount > 0) {
      recommendations.push(`${errorCount} generation errors occurred - investigate error handling`);
    }
    
    return {
      testName: 'Memory Leak Detection',
      success: memoryGrowth < 50 && errorCount === 0,
      metrics: {
        avgGenerationTime,
        maxGenerationTime,
        minGenerationTime,
        memoryGrowth,
        cacheHitRate: 0, // Not applicable for this test
        errorCount,
        totalTests: iterations
      },
      issues,
      recommendations
    };
  }

  /**
   * Test template generation performance
   */
  async testGenerationPerformance(): Promise<PerformanceTestResult> {
    console.warn('⚡ Testing Generation Performance...');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    const generationTimes: number[] = [];
    let errorCount = 0;
    
    // Test different template configurations
    const testConfigs = [
      { useWebWorkers: false, enableOptimizations: false },
      { useWebWorkers: false, enableOptimizations: true },
      { useWebWorkers: true, enableOptimizations: false },
      { useWebWorkers: true, enableOptimizations: true }
    ];
    
    for (const config of testConfigs) {
      for (let i = 0; i < 10; i++) {
        try {
          const startTime = performance.now();
          
          await OptimizedTemplateGenerator.generateHTML(
            this.testTemplate,
            this.testData,
            config
          );
          
          const endTime = performance.now();
          generationTimes.push(endTime - startTime);
          
        } catch (error) {
          errorCount++;
          console.error('Generation failed:', error);
        }
      }
    }
    
    const avgGenerationTime = generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length;
    const maxGenerationTime = Math.max(...generationTimes);
    const minGenerationTime = Math.min(...generationTimes);
    
    // Performance targets
    const TARGET_AVG_TIME = 2000; // 2 seconds
    const TARGET_MAX_TIME = 5000; // 5 seconds
    
    if (avgGenerationTime > TARGET_AVG_TIME) {
      issues.push(`Average generation time ${avgGenerationTime.toFixed(0)}ms exceeds target ${TARGET_AVG_TIME}ms`);
    }
    
    if (maxGenerationTime > TARGET_MAX_TIME) {
      issues.push(`Maximum generation time ${maxGenerationTime.toFixed(0)}ms exceeds target ${TARGET_MAX_TIME}ms`);
    }
    
    // Generate recommendations
    if (avgGenerationTime > TARGET_AVG_TIME) {
      recommendations.push('Consider optimizing template generation algorithms');
    }
    
    if (maxGenerationTime > avgGenerationTime * 3) {
      recommendations.push('High variance in generation times - investigate bottlenecks');
    }
    
    return {
      testName: 'Generation Performance',
      success: avgGenerationTime <= TARGET_AVG_TIME && maxGenerationTime <= TARGET_MAX_TIME && errorCount === 0,
      metrics: {
        avgGenerationTime,
        maxGenerationTime,
        minGenerationTime,
        memoryGrowth: 0, // Not measured in this test
        cacheHitRate: 0, // Not measured in this test
        errorCount,
        totalTests: generationTimes.length
      },
      issues,
      recommendations
    };
  }

  /**
   * Test cache efficiency
   */
  async testCacheEfficiency(): Promise<PerformanceTestResult> {
    console.warn('💾 Testing Cache Efficiency...');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Clear cache and reset metrics
    enhancedCacheManager.clearAll();
    performanceMetrics.clear();
    
    const generationTimes: number[] = [];
    let errorCount = 0;
    let cacheHits = 0;
    let totalRequests = 0;
    
    // Generate same template multiple times to test caching
    for (let i = 0; i < 20; i++) {
      try {
        const startTime = performance.now();
        
        await OptimizedTemplateGenerator.generateHTML(
          this.testTemplate,
          this.testData,
          { enableOptimizations: true }
        );
        
        const endTime = performance.now();
        generationTimes.push(endTime - startTime);
        totalRequests++;
        
        // After first generation, subsequent should be cache hits
        if (i > 0 && endTime - startTime < 50) { // Under 50ms suggests cache hit
          cacheHits++;
        }
        
      } catch (error) {
        errorCount++;
        console.error('Cache test generation failed:', error);
      }
    }
    
    const cacheHitRate = totalRequests > 1 ? cacheHits / (totalRequests - 1) : 0;
    const avgGenerationTime = generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length;
    const maxGenerationTime = Math.max(...generationTimes);
    const minGenerationTime = Math.min(...generationTimes);
    
    // Cache efficiency targets
    const TARGET_CACHE_HIT_RATE = 0.9; // 90%
    
    if (cacheHitRate < TARGET_CACHE_HIT_RATE) {
      issues.push(`Cache hit rate ${(cacheHitRate * 100).toFixed(1)}% below target ${TARGET_CACHE_HIT_RATE * 100}%`);
    }
    
    // Check cache performance improvement
    const firstGenTime = generationTimes[0];
    const avgCachedTime = generationTimes.slice(1).reduce((a, b) => a + b, 0) / (generationTimes.length - 1);
    const speedImprovement = firstGenTime > 0 ? (firstGenTime - avgCachedTime) / firstGenTime : 0;
    
    if (speedImprovement < 0.5) { // Less than 50% improvement
      issues.push(`Cache provides only ${(speedImprovement * 100).toFixed(1)}% speed improvement`);
    }
    
    // Generate recommendations
    if (cacheHitRate < TARGET_CACHE_HIT_RATE) {
      recommendations.push('Improve cache key generation or cache invalidation logic');
    }
    
    if (speedImprovement < 0.8) {
      recommendations.push('Optimize cache retrieval performance');
    }
    
    return {
      testName: 'Cache Efficiency',
      success: cacheHitRate >= TARGET_CACHE_HIT_RATE && errorCount === 0,
      metrics: {
        avgGenerationTime,
        maxGenerationTime,
        minGenerationTime,
        memoryGrowth: 0, // Not measured in this test
        cacheHitRate,
        errorCount,
        totalTests: totalRequests
      },
      issues,
      recommendations
    };
  }

  /**
   * Test concurrent template generation
   */
  async testConcurrentGeneration(): Promise<PerformanceTestResult> {
    console.warn('🔄 Testing Concurrent Generation...');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    const generationTimes: number[] = [];
    let errorCount = 0;
    
    // Generate multiple templates concurrently
    const concurrentRequests = 10;
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      const promise = (async () => {
        try {
          const startTime = performance.now();
          
          await OptimizedTemplateGenerator.generateHTML(
            { ...this.testTemplate, id: `test-template-${i}` },
            this.testData,
            { useWebWorkers: true, enableOptimizations: true }
          );
          
          const endTime = performance.now();
          generationTimes.push(endTime - startTime);
          
        } catch (error) {
          errorCount++;
          console.error(`Concurrent generation ${i} failed:`, error);
        }
      })();
      
      promises.push(promise);
    }
    
    const startTime = performance.now();
    await Promise.all(promises);
    const totalTime = performance.now() - startTime;
    
    const avgGenerationTime = generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length;
    const maxGenerationTime = Math.max(...generationTimes);
    const minGenerationTime = Math.min(...generationTimes);
    
    // Check if concurrent generation is efficient
    const avgSequentialTime = avgGenerationTime * concurrentRequests;
    const concurrencyBenefit = (avgSequentialTime - totalTime) / avgSequentialTime;
    
    if (concurrencyBenefit < 0.3) { // Less than 30% improvement
      issues.push(`Concurrent generation provides only ${(concurrencyBenefit * 100).toFixed(1)}% benefit`);
    }
    
    if (errorCount > 0) {
      issues.push(`${errorCount} errors occurred during concurrent generation`);
    }
    
    // Generate recommendations
    if (concurrencyBenefit < 0.5) {
      recommendations.push('Optimize Web Worker utilization for better concurrency');
    }
    
    if (errorCount > 0) {
      recommendations.push('Improve error handling and resource management for concurrent operations');
    }
    
    return {
      testName: 'Concurrent Generation',
      success: concurrencyBenefit >= 0.3 && errorCount === 0,
      metrics: {
        avgGenerationTime,
        maxGenerationTime,
        minGenerationTime,
        memoryGrowth: 0, // Not measured in this test
        cacheHitRate: 0, // Not measured in this test
        errorCount,
        totalTests: concurrentRequests
      },
      issues,
      recommendations
    };
  }

  /**
   * Test handling of large CV data
   */
  async testLargeDataHandling(): Promise<PerformanceTestResult> {
    console.warn('📊 Testing Large Data Handling...');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    const generationTimes: number[] = [];
    let errorCount = 0;
    
    // Create large test data
    const largeTestData: CVParsedData = {
      ...this.testData,
      experience: Array(20).fill(null).map((_, i) => ({
        position: `Position ${i + 1}`,
        company: `Company ${i + 1}`,
        startDate: '2020-01',
        endDate: i === 0 ? 'Present' : '2021-12',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10),
        location: 'Location'
      })),
      education: Array(5).fill(null).map((_, i) => ({
        degree: `Degree ${i + 1}`,
        institution: `Institution ${i + 1}`,
        startDate: '2015-09',
        endDate: '2019-05',
        gpa: '3.8',
        location: 'Location'
      })),
      skills: Array(50).fill(null).map((_, i) => ({
        name: `Skill ${i + 1}`,
        level: 'Advanced'
      }))
    };
    
    // Test with large data
    for (let i = 0; i < 5; i++) {
      try {
        const startTime = performance.now();
        
        await OptimizedTemplateGenerator.generateHTML(
          this.testTemplate,
          largeTestData,
          { enableOptimizations: true, compress: true }
        );
        
        const endTime = performance.now();
        generationTimes.push(endTime - startTime);
        
      } catch (error) {
        errorCount++;
        console.error(`Large data generation ${i} failed:`, error);
      }
    }
    
    const avgGenerationTime = generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length;
    const maxGenerationTime = Math.max(...generationTimes);
    const minGenerationTime = Math.min(...generationTimes);
    
    // Performance targets for large data
    const TARGET_LARGE_DATA_TIME = 5000; // 5 seconds
    
    if (avgGenerationTime > TARGET_LARGE_DATA_TIME) {
      issues.push(`Large data generation time ${avgGenerationTime.toFixed(0)}ms exceeds target ${TARGET_LARGE_DATA_TIME}ms`);
    }
    
    if (errorCount > 0) {
      issues.push(`${errorCount} errors occurred with large data`);
    }
    
    // Generate recommendations
    if (avgGenerationTime > TARGET_LARGE_DATA_TIME) {
      recommendations.push('Implement data pagination or virtualization for large datasets');
    }
    
    if (maxGenerationTime > avgGenerationTime * 2) {
      recommendations.push('Inconsistent performance with large data - optimize memory management');
    }
    
    return {
      testName: 'Large Data Handling',
      success: avgGenerationTime <= TARGET_LARGE_DATA_TIME && errorCount === 0,
      metrics: {
        avgGenerationTime,
        maxGenerationTime,
        minGenerationTime,
        memoryGrowth: 0, // Not measured in this test
        cacheHitRate: 0, // Not measured in this test
        errorCount,
        totalTests: generationTimes.length
      },
      issues,
      recommendations
    };
  }

  /**
   * Generate performance test report
   */
  generateReport(results: PerformanceTestResult[]): string {
    const overallSuccess = results.every(result => result.success);
    const totalIssues = results.reduce((sum, result) => sum + result.issues.length, 0);
    
    let report = `
# Template Performance Test Report

**Generated**: ${new Date().toISOString()}
**Overall Status**: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}
**Total Issues**: ${totalIssues}

## Summary

`;

    results.forEach(result => {
      report += `
### ${result.testName}
- **Status**: ${result.success ? '✅ PASS' : '❌ FAIL'}
- **Average Generation Time**: ${result.metrics.avgGenerationTime.toFixed(0)}ms
- **Max Generation Time**: ${result.metrics.maxGenerationTime.toFixed(0)}ms
- **Memory Growth**: ${result.metrics.memoryGrowth.toFixed(2)}MB
- **Cache Hit Rate**: ${(result.metrics.cacheHitRate * 100).toFixed(1)}%
- **Error Count**: ${result.metrics.errorCount}/${result.metrics.totalTests}

`;

      if (result.issues.length > 0) {
        report += `**Issues:**\n`;
        result.issues.forEach(issue => {
          report += `- ⚠️ ${issue}\n`;
        });
        report += '\n';
      }

      if (result.recommendations.length > 0) {
        report += `**Recommendations:**\n`;
        result.recommendations.forEach(rec => {
          report += `- 💡 ${rec}\n`;
        });
        report += '\n';
      }
    });

    report += `
## Performance Metrics

| Test | Avg Time (ms) | Max Time (ms) | Memory (MB) | Cache Hit % | Errors |
|------|--------------|---------------|-------------|-------------|--------|
`;

    results.forEach(result => {
      report += `| ${result.testName} | ${result.metrics.avgGenerationTime.toFixed(0)} | ${result.metrics.maxGenerationTime.toFixed(0)} | ${result.metrics.memoryGrowth.toFixed(2)} | ${(result.metrics.cacheHitRate * 100).toFixed(1)} | ${result.metrics.errorCount} |\n`;
    });

    return report;
  }
}

/**
 * Export convenience function for running tests
 */
export async function runPerformanceTests(): Promise<{
  results: PerformanceTestResult[];
  report: string;
  success: boolean;
}> {
  const testSuite = new PerformanceTestSuite();
  const results = await testSuite.runPerformanceTests();
  const report = testSuite.generateReport(results);
  const success = results.every(result => result.success);
  
  return { results, report, success };
}