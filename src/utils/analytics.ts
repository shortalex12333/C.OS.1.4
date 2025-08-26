/**
 * Analytics and Monitoring Utilities
 * Provides event tracking for user interactions and system performance
 */

// Event tracking interface
interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
}

// Performance metrics interface
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

// Analytics configuration
const ANALYTICS_CONFIG = {
  enabled: import.meta.env.PROD, // Only in production
  debug: import.meta.env.DEV,    // Debug logging in development
  batchSize: 10,                 // Batch events before sending
  flushInterval: 30000,          // Flush every 30 seconds
};

class CelesteOSAnalytics {
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.initializeFlushTimer();
  }

  // Track user interactions
  trackEvent(event: Omit<AnalyticsEvent, 'userId'>) {
    if (!ANALYTICS_CONFIG.enabled) {
      if (ANALYTICS_CONFIG.debug) {
        console.log('📊 Analytics Event:', event);
      }
      return;
    }

    const fullEvent: AnalyticsEvent = {
      ...event,
      userId: this.userId || undefined
    };

    this.events.push(fullEvent);

    if (this.events.length >= ANALYTICS_CONFIG.batchSize) {
      this.flushEvents();
    }
  }

  // Track performance metrics
  trackPerformance(name: string, value: number, context?: Record<string, any>) {
    if (!ANALYTICS_CONFIG.enabled) {
      if (ANALYTICS_CONFIG.debug) {
        console.log('⚡ Performance Metric:', { name, value, context });
      }
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context
    };

    this.metrics.push(metric);
  }

  // Set user context
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    this.trackEvent({
      event: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: path,
    });
  }

  // Track user authentication
  trackAuth(action: 'login' | 'logout' | 'signup', method?: string) {
    this.trackEvent({
      event: 'auth',
      category: 'authentication',
      action,
      label: method,
    });
  }

  // Track chat interactions
  trackChat(action: 'message_sent' | 'response_received' | 'solution_card_expanded', metadata?: Record<string, any>) {
    this.trackEvent({
      event: 'chat',
      category: 'interaction',
      action,
      label: metadata?.searchType,
    });

    // Track performance for responses
    if (action === 'response_received' && metadata?.responseTime) {
      this.trackPerformance('chat_response_time', metadata.responseTime, {
        searchType: metadata.searchType,
        hasStructuredData: metadata.hasStructuredData
      });
    }
  }

  // Track search mode usage
  trackSearchMode(mode: 'yacht' | 'email' | 'email-yacht') {
    this.trackEvent({
      event: 'search_mode',
      category: 'interaction',
      action: 'mode_selected',
      label: mode,
    });
  }

  // Track tutorial completion
  trackTutorial(step: string, completed: boolean) {
    this.trackEvent({
      event: 'tutorial',
      category: 'onboarding',
      action: completed ? 'step_completed' : 'step_started',
      label: step,
    });
  }

  // Track errors
  trackError(error: Error, context?: Record<string, any>) {
    this.trackEvent({
      event: 'error',
      category: 'system',
      action: 'error_occurred',
      label: error.message,
    });

    if (ANALYTICS_CONFIG.debug) {
      console.error('🚨 Error tracked:', error, context);
    }
  }

  // Flush events to analytics service
  private flushEvents() {
    if (this.events.length === 0 && this.metrics.length === 0) return;

    const payload = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      events: [...this.events],
      metrics: [...this.metrics],
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In production, send to analytics service
    if (ANALYTICS_CONFIG.enabled) {
      this.sendToAnalyticsService(payload);
    }

    // Clear batched data
    this.events = [];
    this.metrics = [];
  }

  // Send analytics data to service
  private async sendToAnalyticsService(payload: any) {
    try {
      // Replace with actual analytics service endpoint
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn('Analytics service error:', response.status);
      }
    } catch (error) {
      console.warn('Failed to send analytics:', error);
    }
  }

  // Initialize periodic flushing
  private initializeFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, ANALYTICS_CONFIG.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }

  // Cleanup
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents(); // Final flush
  }
}

// Create singleton instance
const analytics = new CelesteOSAnalytics();

// Convenience functions for common tracking scenarios
export const trackUserLogin = (method?: string) => analytics.trackAuth('login', method);
export const trackUserLogout = () => analytics.trackAuth('logout');
export const trackUserSignup = (method?: string) => analytics.trackAuth('signup', method);

export const trackChatMessage = (searchType?: string) => 
  analytics.trackChat('message_sent', { searchType });

export const trackChatResponse = (responseTime: number, searchType?: string, hasStructuredData?: boolean) =>
  analytics.trackChat('response_received', { responseTime, searchType, hasStructuredData });

export const trackSolutionCardExpansion = () =>
  analytics.trackChat('solution_card_expanded');

export const trackSearchModeChange = (mode: 'yacht' | 'email' | 'email-yacht') =>
  analytics.trackSearchMode(mode);

export const trackTutorialStep = (step: string, completed: boolean) =>
  analytics.trackTutorial(step, completed);

export const trackError = (error: Error, context?: Record<string, any>) =>
  analytics.trackError(error, context);

export const trackPerformance = (name: string, value: number, context?: Record<string, any>) =>
  analytics.trackPerformance(name, value, context);

export const setAnalyticsUserId = (userId: string) => analytics.setUserId(userId);

// Performance monitoring helpers
export const measureAsyncOperation = async <T>(
  name: string,
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    trackPerformance(name, duration, { ...context, success: true });
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    trackPerformance(name, duration, { ...context, success: false });
    throw error;
  }
};

export default analytics;