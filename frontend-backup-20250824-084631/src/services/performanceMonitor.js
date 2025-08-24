// Performance Monitor - CRITICAL for 200+ users
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTimes: [],
      apiLatencies: [],
      memorySnapshots: [],
      errorRates: new Map(),
      activeUsers: new Set(),
      messageQueue: []
    };
    
    this.thresholds = {
      maxRenderTime: 16, // 60fps
      maxApiLatency: 3000,
      maxMemoryMB: 100,
      maxErrorRate: 0.05
    };
    
    this.startMonitoring();
  }

  startMonitoring() {
    // Monitor render performance
    if (typeof window !== 'undefined' && window.performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.recordRenderTime(entry.duration);
          }
        }
      });
      observer.observe({ entryTypes: ['measure'] });
    }

    // Monitor memory (Chrome only)
    if (performance.memory) {
      setInterval(() => {
        const memoryMB = performance.memory.usedJSHeapSize / 1048576;
        this.recordMemoryUsage(memoryMB);
        
        if (memoryMB > this.thresholds.maxMemoryMB) {
          console.error(`⚠️ MEMORY LEAK: ${memoryMB.toFixed(2)}MB used`);
          this.triggerMemoryCleanup();
        }
      }, 10000); // Check every 10s
    }
  }

  recordRenderTime(duration) {
    this.metrics.renderTimes.push(duration);
    if (this.metrics.renderTimes.length > 100) {
      this.metrics.renderTimes.shift();
    }
    
    if (duration > this.thresholds.maxRenderTime) {
      console.warn(`🐌 SLOW RENDER: ${duration.toFixed(2)}ms`);
    }
  }

  recordApiLatency(endpoint, duration) {
    this.metrics.apiLatencies.push({ endpoint, duration, timestamp: Date.now() });
    
    if (duration > this.thresholds.maxApiLatency) {
      console.error(`🔥 SLOW API: ${endpoint} took ${duration}ms`);
    }
  }

  recordMemoryUsage(memoryMB) {
    this.metrics.memorySnapshots.push({
      memory: memoryMB,
      timestamp: Date.now()
    });
    
    // Keep last 50 snapshots
    if (this.metrics.memorySnapshots.length > 50) {
      this.metrics.memorySnapshots.shift();
    }
  }

  recordError(error, context) {
    const errorKey = `${error.name}:${error.message}`;
    const count = this.metrics.errorRates.get(errorKey) || 0;
    this.metrics.errorRates.set(errorKey, count + 1);
    
    // Alert on high error rates
    const errorRate = count / this.metrics.activeUsers.size;
    if (errorRate > this.thresholds.maxErrorRate) {
      console.error(`💀 HIGH ERROR RATE: ${errorKey} - ${errorRate * 100}%`);
    }
  }

  recordActiveUser(userId) {
    this.metrics.activeUsers.add(userId);
  }

  triggerMemoryCleanup() {
    // Force garbage collection hints
    if (window.gc) {
      window.gc();
    }
    
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('celesteos-temp')) {
            caches.delete(name);
          }
        });
      });
    }
  }

  getHealthReport() {
    const avgRenderTime = this.metrics.renderTimes.reduce((a, b) => a + b, 0) / this.metrics.renderTimes.length;
    const avgApiLatency = this.metrics.apiLatencies.reduce((a, b) => a + b.duration, 0) / this.metrics.apiLatencies.length;
    const currentMemory = this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1]?.memory || 0;
    
    return {
      health: avgRenderTime < 16 && avgApiLatency < 1000 && currentMemory < 100 ? 'GOOD' : 'DEGRADED',
      metrics: {
        avgRenderTime: avgRenderTime.toFixed(2) + 'ms',
        avgApiLatency: avgApiLatency.toFixed(0) + 'ms',
        memoryUsage: currentMemory.toFixed(2) + 'MB',
        activeUsers: this.metrics.activeUsers.size,
        errorCount: Array.from(this.metrics.errorRates.values()).reduce((a, b) => a + b, 0)
      },
      warnings: this.getWarnings()
    };
  }

  getWarnings() {
    const warnings = [];
    
    const avgRenderTime = this.metrics.renderTimes.reduce((a, b) => a + b, 0) / this.metrics.renderTimes.length;
    if (avgRenderTime > 16) {
      warnings.push(`Render performance degraded: ${avgRenderTime.toFixed(2)}ms avg`);
    }
    
    const currentMemory = this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1]?.memory || 0;
    if (currentMemory > 80) {
      warnings.push(`High memory usage: ${currentMemory.toFixed(2)}MB`);
    }
    
    if (this.metrics.activeUsers.size > 150) {
      warnings.push(`Approaching user limit: ${this.metrics.activeUsers.size}/200`);
    }
    
    return warnings;
  }
}

export const performanceMonitor = new PerformanceMonitor();
