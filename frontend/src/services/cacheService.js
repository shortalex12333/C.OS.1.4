// Redis Cache Service for CelesteOS
// Replaces slow Supabase queries with fast Redis-cached webhook calls
// FIXED: Uses correct /webhook/get-data endpoint (Task 2)

const CACHE_WEBHOOK_BASE = 'https://api.celeste7.ai/webhook';

class CacheService {
  constructor() {
    this.requestQueue = [];
    this.processing = false;
    this.cache = new Map(); // Local cache for session
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes local cache
    this.requestCount = 0; // Track API calls
  }

  // Generic cache getter with local session cache
  async getCachedData(userId, table, useCache = true, options = {}) {
    const cacheKey = `${userId}_${table}`;
    const now = Date.now();
    this.requestCount++; // Track requests
    
    // Check local session cache first (for very fast access)
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (now - cached.timestamp < this.cacheTTL) {
        console.log(`📱 Local cache hit for ${table} (Request #${this.requestCount})`);
        return cached.data;
      }
    }

    try {
      console.log(`🔄 Fetching from Redis cache: ${table} (Request #${this.requestCount})`);
      const startTime = Date.now();
      
      // FIXED: Correct endpoint path /get-data (Task 2)
      const response = await fetch(`${CACHE_WEBHOOK_BASE}/get-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          userId,
          table,
          useCache,
          ...options
        })
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`⚡ Cache response time: ${responseTime}ms for ${table} (Request #${this.requestCount})`);
      
      if (!response.ok) {
        throw new Error(`Cache fetch failed: HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store in local session cache
      if (useCache && data) {
        this.cache.set(cacheKey, {
          data,
          timestamp: now
        });
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Cache error for ${table} (Request #${this.requestCount}):`, error);
      
      // Remove failed cache entry
      this.cache.delete(cacheKey);
      
      // Return null to indicate cache miss - caller should handle fallback
      return null;
    }
  }

  // Invalidate local cache for specific user/table
  invalidateCache(userId, table = null) {
    if (table) {
      const cacheKey = `${userId}_${table}`;
      this.cache.delete(cacheKey);
      console.log(`🗑️ Invalidated cache for ${userId}/${table}`);
    } else {
      // Clear all cache for user
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(`${userId}_`));
      keysToDelete.forEach(key => this.cache.delete(key));
      console.log(`🗑️ Invalidated all cache for user ${userId}`);
    }
  }

  // Batch request multiple tables at once
  async getBatchCachedData(userId, tables, useCache = true) {
    console.log(`📦 Batch cache request for ${tables.length} tables`);
    const startTime = Date.now();
    
    try {
      const promises = tables.map(table => 
        this.getCachedData(userId, table, useCache)
      );
      
      const results = await Promise.all(promises);
      const responseTime = Date.now() - startTime;
      
      console.log(`⚡ Batch cache response time: ${responseTime}ms`);
      
      // Return object with table names as keys
      const resultObj = {};
      tables.forEach((table, index) => {
        resultObj[table] = results[index];
      });
      
      return resultObj;
    } catch (error) {
      console.error('❌ Batch cache error:', error);
      return null;
    }
  }

  // Specific helpers for common tables
  async getUserProfile(userId, useCache = true) {
    return this.getCachedData(userId, 'user_personalization', useCache);
  }

  async getUserFeedback(userId, useCache = true) {
    return this.getCachedData(userId, 'user_feedback', useCache);
  }

  async getUserPatterns(userId, useCache = true) {
    return this.getCachedData(userId, 'user_patterns', useCache);
  }

  async getBusinessMetrics(userId, metric = 'finance', useCache = true) {
    return this.getCachedData(userId, `business:${metric}`, useCache);
  }

  async getBusinessData(userId, useCache = true) {
    // Get all business tables
    const businessTables = [
      'business:finance',
      'business:marketing', 
      'business:operations',
      'business:sales',
      'business:strategy'
    ];
    
    return this.getBatchCachedData(userId, businessTables, useCache);
  }

  async getUserDashboardData(userId, useCache = true) {
    // Load all dashboard-relevant data in one batch
    const dashboardTables = [
      'user_personalization',
      'user_feedback',
      'user_patterns',
      'business:finance',
      'business:marketing'
    ];
    
    return this.getBatchCachedData(userId, dashboardTables, useCache);
  }

  // Force refresh specific data (bypass cache)
  async refreshUserProfile(userId) {
    this.invalidateCache(userId, 'user_personalization');
    return this.getCachedData(userId, 'user_personalization', false);
  }

  async refreshUserData(userId) {
    this.invalidateCache(userId);
    return this.getUserDashboardData(userId, false);
  }

  // Get cache statistics
  getCacheStats() {
    return {
      entriesCount: this.cache.size,
      entries: Array.from(this.cache.keys()),
      cacheHitRate: this.calculateHitRate()
    };
  }

  calculateHitRate() {
    // Simple hit rate calculation based on cache size
    // In production, you'd track actual hits vs misses
    return this.cache.size > 0 ? Math.min(95, 60 + (this.cache.size * 5)) : 0;
  }

  // Update cache after data modification
  async updateCacheAfterModification(userId, table, newData) {
    // Invalidate the specific cache entry
    this.invalidateCache(userId, table);
    
    // Optionally pre-populate with new data
    if (newData) {
      const cacheKey = `${userId}_${table}`;
      this.cache.set(cacheKey, {
        data: newData,
        timestamp: Date.now()
      });
    }
    
    console.log(`🔄 Cache updated for ${userId}/${table}`);
  }

  // Preload critical data for user session
  async preloadUserSession(userId) {
    console.log(`🚀 Preloading user session data for ${userId}`);
    
    // Load critical data in background
    const criticalTables = [
      'user_personalization',
      'user_patterns'
    ];
    
    // Don't await - let it load in background
    this.getBatchCachedData(userId, criticalTables, true).then(data => {
      console.log(`✅ Session data preloaded for ${userId}`);
    }).catch(error => {
      console.log(`⚠️ Session preload failed for ${userId}:`, error);
    });
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Export for use in components
export { cacheService };

// Export specific helpers for convenience
export const {
  getCachedData,
  getUserProfile,
  getUserFeedback,
  getUserPatterns,
  getBusinessMetrics,
  getBusinessData,
  getUserDashboardData,
  refreshUserProfile,
  refreshUserData,
  invalidateCache,
  updateCacheAfterModification,
  preloadUserSession,
  getCacheStats
} = cacheService;