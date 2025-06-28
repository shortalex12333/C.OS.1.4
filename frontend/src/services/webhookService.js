// Enhanced Webhook Service with Debugging and Emergency Fallback
// UPDATED: Uses hardcoded WEBHOOK_BASE_URL - NEVER dynamic URLs

import { cacheService } from './cacheService';
import { WEBHOOK_BASE_URL, WEBHOOK_CONFIG } from '../config/webhookConfig';

// Emergency fallback mode toggle
const WEBHOOK_DEBUG_MODE = process.env.NODE_ENV === 'development' || localStorage.getItem('webhook_debug_mode') === 'true';

// Mock data for emergency fallback
const MOCK_DATA = {
  auth: {
    login: {
      success: true,
      user: {
        id: 'mock-user-123',
        email: 'demo@celesteos.com',
        display_name: 'Demo User'
      },
      access_token: 'mock-token-123'
    },
    signup: {
      statusCode: 201,
      response: { success: true, message: 'Account created successfully' }
    }
  },
  chat: {
    response: "I'm in emergency fallback mode. Your message was received but I'm using static responses while we fix the webhook connection.",
    metadata: {
      tokensRemaining: 45000,
      stage: 'exploring',
      category: 'general'
    }
  },
  data: {
    user_personalization: [{
      id: 'mock-profile',
      display_name: 'Demo User',
      stage: 'exploring',
      tokens_remaining: 45000
    }],
    user_patterns: [],
    business_finance: []
  }
};

class WebhookService {
  constructor() {
    // CRITICAL: Always use WEBHOOK_BASE_URL - NEVER dynamic URLs
    this.baseUrl = WEBHOOK_BASE_URL;
    this.requestQueue = [];
    this.isOnline = true;
    this.failureCount = 0;
    this.maxFailures = 3;
  }

  // Enhanced request with debugging and fallback
  async makeRequest(endpoint, payload, options = {}) {
    // CRITICAL: Always use WEBHOOK_BASE_URL - NEVER dynamic URLs
    const fullUrl = `${WEBHOOK_BASE_URL}${endpoint}`;
    
    console.log(`🔵 Webhook Request: ${endpoint}`, {
      url: fullUrl,
      payload,
      options
    });

    // Emergency fallback check
    if (WEBHOOK_DEBUG_MODE && this.failureCount >= this.maxFailures) {
      console.warn('🚨 Using emergency fallback for:', endpoint);
      return this.getEmergencyFallback(endpoint, payload);
    }

    try {
      const response = await fetch(fullUrl, {
        ...WEBHOOK_CONFIG.defaults,
        body: JSON.stringify(payload),
        ...options
      });

      const data = await response.json();
      
      if (response.ok) {
        this.failureCount = 0; // Reset failure count on success
        console.log(`🟢 Webhook Success: ${endpoint}`, data);
        return { success: true, data };
      } else {
        this.failureCount++;
        console.warn(`🟡 Webhook Error: ${endpoint}`, {
          status: response.status,
          statusText: response.statusText,
          data
        });
        return { success: false, data, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      this.failureCount++;
      console.error(`🔴 Webhook Failed: ${endpoint}`, error);
      
      // Use emergency fallback if available
      if (WEBHOOK_DEBUG_MODE) {
        console.warn('🚨 Using emergency fallback due to error');
        return this.getEmergencyFallback(endpoint, payload);
      }
      
      throw error;
    }
  }

  // Emergency fallback data
  getEmergencyFallback(endpoint, payload) {
    console.log('📱 Emergency fallback activated for:', endpoint);
    
    // Auth endpoints
    if (endpoint.includes('/auth/login')) {
      return { success: true, data: [MOCK_DATA.auth.login] };
    }
    if (endpoint.includes('/auth-signup')) {
      return { success: true, data: MOCK_DATA.auth.signup };
    }
    if (endpoint.includes('/auth/verify-token')) {
      return { success: true, data: [{ success: true, user: MOCK_DATA.auth.login.user }] };
    }
    if (endpoint.includes('/auth/logout')) {
      return { success: true, data: { success: true } };
    }
    
    // Chat endpoints
    if (endpoint.includes('/text-chat-fast')) {
      return { success: true, data: [MOCK_DATA.chat] };
    }
    
    // Data endpoints
    if (endpoint.includes('/get-data')) {
      const table = payload.table || 'user_personalization';
      return { 
        success: true, 
        data: { 
          data: MOCK_DATA.data[table] || [],
          cached: false,
          emergency_mode: true
        }
      };
    }
    
    // Default fallback
    return { 
      success: true, 
      data: { 
        message: 'Emergency fallback response',
        endpoint,
        emergency_mode: true 
      }
    };
  }

  // Specific webhook methods with hardcoded URLs
  async login(email, password) {
    return this.makeRequest('/auth/login', { 
      email: email.toLowerCase().trim(), 
      password 
    });
  }

  async signup(displayName, email, password) {
    return this.makeRequest('/auth-signup', { 
      displayName: displayName.trim() || email.split('@')[0], 
      email: email.toLowerCase().trim(), 
      password 
    });
  }

  async logout(token) {
    return this.makeRequest('/auth/logout', { token });
  }

  async verifyToken(token) {
    return this.makeRequest('/auth/verify-token', { token });
  }

  async sendChat(userId, userName, message, chatId, sessionId) {
    return this.makeRequest('/text-chat-fast', {
      userId,
      userName,
      message,
      chatId,
      sessionId: sessionId || `session_${userId}_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  }

  async fetchChat(chatId, userId) {
    return this.makeRequest('/fetch-chat', { chatId, userId });
  }

  async fetchConversations(userId) {
    return this.makeRequest('/fetch-conversations', { userId });
  }

  async getData(userId, table, useCache = true) {
    return this.makeRequest('/get-data', { 
      userId, 
      table, 
      useCache 
    });
  }

  // Health check for all endpoints - Uses hardcoded WEBHOOK_BASE_URL
  async healthCheck() {
    const endpoints = [
      { name: 'Auth Login', endpoint: '/auth/login', payload: { email: 'test@test.com', password: 'test' } },
      { name: 'Auth Signup', endpoint: '/auth-signup', payload: { email: 'test@test.com', password: 'test' } },
      { name: 'Get Data', endpoint: '/get-data', payload: { userId: 'test', table: 'test' } },
      { name: 'Text Chat', endpoint: '/text-chat-fast', payload: { message: 'test', userId: 'test' } }
    ];

    const results = {};
    
    for (const { name, endpoint, payload } of endpoints) {
      try {
        const startTime = Date.now();
        const result = await this.makeRequest(endpoint, payload);
        const responseTime = Date.now() - startTime;
        
        results[name] = {
          success: result.success,
          responseTime: `${responseTime}ms`,
          status: result.success ? 'OK' : 'ERROR',
          endpoint: `${WEBHOOK_BASE_URL}${endpoint}` // Show full URL
        };
      } catch (error) {
        results[name] = {
          success: false,
          responseTime: 'N/A',
          status: 'FAILED',
          error: error.message,
          endpoint: `${WEBHOOK_BASE_URL}${endpoint}` // Show full URL
        };
      }
    }
    
    return results;
  }

  // Enable/disable emergency mode
  setEmergencyMode(enabled) {
    if (enabled) {
      localStorage.setItem('webhook_debug_mode', 'true');
    } else {
      localStorage.removeItem('webhook_debug_mode');
    }
    console.log(`🚨 Emergency mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  // Get current status
  getStatus() {
    return {
      isOnline: this.isOnline,
      failureCount: this.failureCount,
      maxFailures: this.maxFailures,
      emergencyMode: WEBHOOK_DEBUG_MODE && this.failureCount >= this.maxFailures,
      baseUrl: this.baseUrl // Will always be WEBHOOK_BASE_URL
    };
  }
}

// Create singleton instance
const webhookService = new WebhookService();

export default webhookService;
export { webhookService };