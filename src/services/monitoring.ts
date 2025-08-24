// Production Monitoring and Logging System
// Enterprise-grade observability for CelesteOS ChatGPT Clone

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  message: string;
  category: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

interface PerformanceMetric {
  timestamp: string;
  metric: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

interface UserAction {
  timestamp: string;
  userId: string;
  action: string;
  component: string;
  metadata?: Record<string, any>;
}

class ProductionLogger {
  private logs: LogEntry[] = [];
  private maxLogSize = 10000;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    // Set up periodic log flushing in production
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      setInterval(() => this.flushLogs(), this.flushInterval);
    }
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    category: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      metadata: metadata || {},
      stack: error?.stack
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get user ID from context/session
    if (typeof window !== 'undefined') {
      return window.localStorage?.getItem('ms_user_id') || undefined;
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    // Generate or get session ID
    if (typeof window !== 'undefined') {
      let sessionId = window.sessionStorage?.getItem('session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        window.sessionStorage?.setItem('session_id', sessionId);
      }
      return sessionId;
    }
    return undefined;
  }

  debug(message: string, category: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('debug', message, category, metadata);
    this.addLogEntry(entry);
  }

  info(message: string, category: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('info', message, category, metadata);
    this.addLogEntry(entry);
    console.info(`[${category}] ${message}`, metadata);
  }

  warn(message: string, category: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('warn', message, category, metadata);
    this.addLogEntry(entry);
    console.warn(`[${category}] ${message}`, metadata);
  }

  error(message: string, category: string, error?: Error, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('error', message, category, metadata, error);
    this.addLogEntry(entry);
    console.error(`[${category}] ${message}`, error, metadata);
    
    // Send critical errors to monitoring service immediately
    this.sendToMonitoring([entry]);
  }

  critical(message: string, category: string, error?: Error, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('critical', message, category, metadata, error);
    this.addLogEntry(entry);
    console.error(`[CRITICAL] [${category}] ${message}`, error, metadata);
    
    // Send critical errors immediately
    this.sendToMonitoring([entry]);
  }

  private addLogEntry(entry: LogEntry): void {
    this.logs.unshift(entry);
    
    // Trim logs if too large
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(0, this.maxLogSize);
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.logs.length === 0) return;

    try {
      const logsToFlush = [...this.logs];
      this.logs = [];
      
      await this.sendToMonitoring(logsToFlush);
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Re-add logs that failed to send
      this.logs.unshift(...this.logs);
    }
  }

  private async sendToMonitoring(logs: LogEntry[]): Promise<void> {
    // Integration with monitoring services
    if (process.env.NODE_ENV !== 'production') return;

    try {
      // Send to multiple monitoring services
      await Promise.allSettled([
        this.sendToSentry(logs),
        this.sendToLogRocket(logs),
        this.sendToCustomEndpoint(logs)
      ]);
    } catch (error) {
      console.error('Failed to send logs to monitoring services:', error);
    }
  }

  private async sendToSentry(logs: LogEntry[]): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      logs.forEach(log => {
        if (log.level === 'error' || log.level === 'critical') {
          (window as any).Sentry.captureMessage(log.message, {
            level: log.level === 'critical' ? 'fatal' : 'error',
            tags: {
              category: log.category,
              userId: log.userId,
              sessionId: log.sessionId
            },
            extra: log.metadata
          });
        }
      });
    }
  }

  private async sendToLogRocket(logs: LogEntry[]): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).LogRocket) {
      logs.forEach(log => {
        (window as any).LogRocket.captureMessage(log.message, {
          tags: {
            level: log.level,
            category: log.category
          },
          extra: log.metadata
        });
      });
    }
  }

  private async sendToCustomEndpoint(logs: LogEntry[]): Promise<void> {
    const endpoint = process.env.NEXT_PUBLIC_LOGGING_ENDPOINT;
    if (!endpoint) return;

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs })
    });
  }

  getLogs(level?: LogEntry['level'], category?: string, limit?: number): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    return limit ? filteredLogs.slice(0, limit) : filteredLogs;
  }
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupPerformanceObservers();
    }
  }

  private setupPerformanceObservers(): void {
    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordMetric('lcp', entry.startTime, 'ms');
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordMetric('fid', (entry as any).processingStart - entry.startTime, 'ms');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        this.recordMetric('cls', clsValue, 'score');
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }

    // Custom performance monitoring
    this.monitorCustomMetrics();
  }

  private monitorCustomMetrics(): void {
    // Monitor React component render times
    if (typeof window !== 'undefined' && (window as any).React) {
      this.setupReactProfiler();
    }

    // Monitor API response times
    this.monitorFetchRequests();

    // Monitor memory usage
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.recordMetric('memory_used', memory.usedJSHeapSize, 'bytes');
        this.recordMetric('memory_total', memory.totalJSHeapSize, 'bytes');
        this.recordMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes');
      }
    }, 30000); // Every 30 seconds
  }

  private setupReactProfiler(): void {
    // React Profiler integration would go here
    // This requires React DevTools integration
  }

  private monitorFetchRequests(): void {
    if (typeof window !== 'undefined' && window.fetch) {
      const originalFetch = window.fetch;
      
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const startTime = performance.now();
        const url = typeof input === 'string' ? input : input.toString();
        
        try {
          const response = await originalFetch(input, init);
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          this.recordMetric('api_response_time', duration, 'ms', {
            url,
            status: response.status.toString(),
            method: init?.method || 'GET'
          });
          
          return response;
        } catch (error) {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          this.recordMetric('api_error_time', duration, 'ms', {
            url,
            method: init?.method || 'GET',
            error: 'network_error'
          });
          
          throw error;
        }
      };
    }
  }

  recordMetric(metric: string, value: number, unit: string, tags?: Record<string, string>): void {
    const entry: PerformanceMetric = {
      timestamp: new Date().toISOString(),
      metric,
      value,
      unit,
      tags
    };

    this.metrics.unshift(entry);
    
    // Keep only recent metrics
    if (this.metrics.length > 5000) {
      this.metrics = this.metrics.slice(0, 5000);
    }

    // Log significant performance issues
    if (this.isSignificantMetric(metric, value)) {
      logger.warn(`Performance threshold exceeded: ${metric} = ${value}${unit}`, 'performance', { 
        metric, 
        value, 
        unit, 
        tags 
      });
    }
  }

  private isSignificantMetric(metric: string, value: number): boolean {
    const thresholds = {
      lcp: 2500, // 2.5 seconds
      fid: 100,  // 100ms
      cls: 0.1,  // 0.1 score
      api_response_time: 5000 // 5 seconds
    };

    return value > (thresholds[metric as keyof typeof thresholds] || Infinity);
  }

  getMetrics(metric?: string, limit?: number): PerformanceMetric[] {
    let filteredMetrics = [...this.metrics];

    if (metric) {
      filteredMetrics = filteredMetrics.filter(m => m.metric === metric);
    }

    return limit ? filteredMetrics.slice(0, limit) : filteredMetrics;
  }

  getAverageMetric(metric: string, timeRange?: number): number | null {
    const now = Date.now();
    const cutoff = timeRange ? now - timeRange : 0;
    
    const relevantMetrics = this.metrics.filter(m => 
      m.metric === metric && new Date(m.timestamp).getTime() > cutoff
    );

    if (relevantMetrics.length === 0) return null;

    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }
}

class UserActionTracker {
  private actions: UserAction[] = [];

  trackAction(action: string, component: string, metadata?: Record<string, any>): void {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const actionEntry: UserAction = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      component,
      metadata
    };

    this.actions.unshift(actionEntry);
    
    // Keep only recent actions
    if (this.actions.length > 1000) {
      this.actions = this.actions.slice(0, 1000);
    }

    logger.debug(`User action: ${action}`, 'user_tracking', { component, metadata });
  }

  private getCurrentUserId(): string | null {
    if (typeof window !== 'undefined') {
      return window.localStorage?.getItem('ms_user_id') || null;
    }
    return null;
  }

  getUserActions(userId?: string, limit?: number): UserAction[] {
    let filteredActions = [...this.actions];

    if (userId) {
      filteredActions = filteredActions.filter(a => a.userId === userId);
    }

    return limit ? filteredActions.slice(0, limit) : filteredActions;
  }
}

// Global instances
export const logger = new ProductionLogger();
export const performanceMonitor = new PerformanceMonitor();
export const userTracker = new UserActionTracker();

// React hook for monitoring
export const useMonitoring = () => {
  const trackUserAction = (action: string, component: string, metadata?: Record<string, any>) => {
    userTracker.trackAction(action, component, metadata);
  };

  const recordPerformance = (metric: string, value: number, unit: string, tags?: Record<string, string>) => {
    performanceMonitor.recordMetric(metric, value, unit, tags);
  };

  return {
    logger,
    trackUserAction,
    recordPerformance,
    performanceMetrics: performanceMonitor.getMetrics(),
    averagePerformance: (metric: string, timeRange?: number) => 
      performanceMonitor.getAverageMetric(metric, timeRange)
  };
};

export default {
  logger,
  performanceMonitor,
  userTracker
};