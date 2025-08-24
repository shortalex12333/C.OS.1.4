/**
 * Token Management Service
 * Tracks API usage, limits, and provides analytics
 */

interface TokenUsage {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  resetDate: string;
}

interface TokenMetrics {
  daily: TokenUsage;
  monthly: TokenUsage;
  queries: number;
  averageTokensPerQuery: number;
}

class TokenService {
  private readonly DAILY_LIMIT = 50000;
  private readonly MONTHLY_LIMIT = 1500000;
  private storageKey = 'celesteos_token_usage';
  
  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      const initialData = {
        daily: {
          used: 0,
          date: new Date().toISOString().split('T')[0]
        },
        monthly: {
          used: 0,
          month: new Date().toISOString().slice(0, 7)
        },
        queries: 0,
        history: []
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  private getStorage(): any {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : null;
  }

  private saveStorage(data: any): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * Record token usage from a query
   */
  recordUsage(tokens: number, queryType: 'chat' | 'search' | 'export' = 'chat'): void {
    const data = this.getStorage();
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Reset daily counter if new day
    if (data.daily.date !== today) {
      data.daily = {
        used: 0,
        date: today
      };
    }

    // Reset monthly counter if new month
    if (data.monthly.month !== currentMonth) {
      data.monthly = {
        used: 0,
        month: currentMonth
      };
    }

    // Update counters
    data.daily.used += tokens;
    data.monthly.used += tokens;
    data.queries += 1;

    // Add to history
    data.history.push({
      timestamp: new Date().toISOString(),
      tokens,
      type: queryType,
      daily_total: data.daily.used,
      monthly_total: data.monthly.used
    });

    // Keep only last 100 history items
    if (data.history.length > 100) {
      data.history = data.history.slice(-100);
    }

    this.saveStorage(data);
  }

  /**
   * Get current token usage metrics
   */
  getMetrics(): TokenMetrics {
    const data = this.getStorage();
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Reset if needed
    if (data.daily.date !== today) {
      data.daily.used = 0;
      data.daily.date = today;
    }
    if (data.monthly.month !== currentMonth) {
      data.monthly.used = 0;
      data.monthly.month = currentMonth;
    }

    const dailyUsage: TokenUsage = {
      used: data.daily.used,
      limit: this.DAILY_LIMIT,
      remaining: Math.max(0, this.DAILY_LIMIT - data.daily.used),
      percentage: Math.min(100, (data.daily.used / this.DAILY_LIMIT) * 100),
      resetDate: new Date(Date.now() + 86400000).toISOString()
    };

    const monthlyUsage: TokenUsage = {
      used: data.monthly.used,
      limit: this.MONTHLY_LIMIT,
      remaining: Math.max(0, this.MONTHLY_LIMIT - data.monthly.used),
      percentage: Math.min(100, (data.monthly.used / this.MONTHLY_LIMIT) * 100),
      resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
    };

    const averageTokensPerQuery = data.queries > 0 
      ? Math.round(data.monthly.used / data.queries)
      : 0;

    return {
      daily: dailyUsage,
      monthly: monthlyUsage,
      queries: data.queries,
      averageTokensPerQuery
    };
  }

  /**
   * Check if user has tokens available
   */
  hasTokensAvailable(): boolean {
    const metrics = this.getMetrics();
    return metrics.daily.remaining > 0;
  }

  /**
   * Estimate tokens for a message
   */
  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Format token count for display
   */
  formatTokenCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  /**
   * Get warning level based on usage
   */
  getWarningLevel(): 'normal' | 'warning' | 'critical' {
    const metrics = this.getMetrics();
    if (metrics.daily.percentage >= 90) return 'critical';
    if (metrics.daily.percentage >= 75) return 'warning';
    return 'normal';
  }

  /**
   * Reset all token counts (admin function)
   */
  resetCounts(): void {
    const data = this.getStorage();
    data.daily.used = 0;
    data.monthly.used = 0;
    data.queries = 0;
    data.history = [];
    this.saveStorage(data);
  }
}

// Create singleton instance
const tokenService = new TokenService();

export default tokenService;
export { TokenService, type TokenUsage, type TokenMetrics };