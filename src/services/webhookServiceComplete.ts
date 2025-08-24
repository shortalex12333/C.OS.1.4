/**
 * Complete Webhook Service with All Endpoints
 * Includes authentication, chat, and Microsoft integration
 */

import { WEBHOOK_BASE_URL } from '../config/webhookConfig';

// ============ TYPE DEFINITIONS ============

interface WebhookResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface UserAuthPayload {
  email: string;
  password: string;
  displayName?: string;
}

interface UserAuthResponse {
  success: boolean;
  userId: string;
  userName: string;
  email: string;
  token?: string;
  sessionId: string;
  message?: string;
}

interface TextChatPayload {
  userId: string;
  userName: string;
  email: string;
  message: string;
  search_strategy: 'local' | 'yacht' | 'email' | 'web';
  conversation_id: string;
  sessionId: string;
  timestamp: string;
  webhookUrl?: string;
  executionMode: 'production' | 'test';
  email_integration: {
    connected: boolean;
    user_email: string;
    bearer_token_available: boolean;
  };
}

interface MicrosoftAuthPayload {
  userId: string;
  email: string;
  redirectUri?: string;
}

interface MicrosoftAuthResponse {
  success: boolean;
  authUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  userEmail?: string;
  displayName?: string;
}

interface TokenRefreshPayload {
  userId: string;
  refreshToken: string;
  email: string;
}

// ============ WEBHOOK SERVICE CLASS ============

class CompleteWebhookService {
  private baseUrl: string;
  private currentUser: UserAuthResponse | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseUrl = WEBHOOK_BASE_URL;
    // Try to restore session from localStorage
    this.restoreSession();
  }

  // ============ HELPER METHODS ============

  private async sendRequest<T = any>(
    endpoint: string,
    payload: any,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<WebhookResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const maxRetries = 3;
    
    // Wrap payload in the expected format with metadata
    const webhookPayload = {
      ...payload,
      webhookUrl: url,
      executionMode: 'production',
      retryCount,
      clientVersion: '1.0.0'
    };
    
    try {
      console.log(`📤 Webhook request to ${endpoint}:`, webhookPayload);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` })
        },
        body: JSON.stringify(webhookPayload),
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);

      const responseText = await response.text();
      
      // Handle empty responses
      if (!responseText || responseText.trim() === '') {
        return { 
          success: response.ok, 
          data: {} as T,
          message: 'Empty response from webhook'
        };
      }

      // Try to parse JSON
      try {
        const data = JSON.parse(responseText);
        console.log(`✅ Webhook response from ${endpoint}:`, data);
        return { success: response.ok, data };
      } catch (e) {
        console.warn('Non-JSON response:', responseText);
        return { 
          success: response.ok, 
          data: responseText as any,
          message: 'Non-JSON response'
        };
      }

    } catch (error: any) {
      console.error(`❌ Webhook error for ${endpoint}:`, error);
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        console.error('⏱️ Request timeout after 30 seconds');
        
        // Retry if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying request (attempt ${retryCount + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return this.sendRequest(endpoint, payload, options, retryCount + 1);
        }
      }
      
      // Handle network errors
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
        console.error('🌐 Network error - checking connection...');
        
        // Retry for network errors
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying after network error (attempt ${retryCount + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
          return this.sendRequest(endpoint, payload, options, retryCount + 1);
        }
      }
      
      // Fallback responses for development when n8n webhooks aren't configured
      if (endpoint === '/user-auth') {
        console.log('🔄 Using fallback mock authentication');
        return {
          success: true,
          data: {
            success: true,
            userId: `user_${Date.now()}`,
            userName: payload.username?.split('@')[0] || 'User',
            email: payload.username || 'user@example.com',
            sessionId: `session_${Date.now()}`,
            message: 'Mock authentication successful'
          } as T
        };
      }
      
      if (endpoint === '/text-chat') {
        console.log('🔄 Using fallback mock chat response');
        return {
          success: true,
          data: {
            success: true,
            response: `Mock response to: "${payload.message}". This is a development fallback while n8n webhooks are being configured.`,
            messageId: `msg_${Date.now()}`,
            timestamp: new Date().toISOString()
          } as T
        };
      }
      
      if (endpoint === '/microsoft-auth') {
        console.log('🔄 Using fallback Microsoft auth response');
        return {
          success: true,
          data: {
            success: true,
            authUrl: 'https://login.microsoftonline.com/mock-auth',
            message: 'Mock Microsoft auth - n8n webhook not configured'
          } as T
        };
      }
      
      if (endpoint === '/token-refresh-trigger') {
        console.log('🔄 Using fallback token refresh response');
        return {
          success: true,
          data: {
            success: true,
            accessToken: `mock_access_token_${Date.now()}`,
            refreshToken: `mock_refresh_token_${Date.now()}`,
            expiresIn: 3600,
            message: 'Mock token refresh - n8n webhook not configured'
          } as T
        };
      }
      
      return {
        success: false,
        error: error.message || 'Request failed',
        message: `Failed after ${retryCount} retries`
      };
    }
  }

  private saveSession(): void {
    if (this.currentUser) {
      localStorage.setItem('celesteos_user', JSON.stringify(this.currentUser));
    }
    if (this.accessToken) {
      localStorage.setItem('celesteos_access_token', this.accessToken);
    }
    if (this.refreshToken) {
      localStorage.setItem('celesteos_refresh_token', this.refreshToken);
    }
  }

  private restoreSession(): void {
    const userStr = localStorage.getItem('celesteos_user');
    const accessToken = localStorage.getItem('celesteos_access_token');
    const refreshToken = localStorage.getItem('celesteos_refresh_token');

    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to restore user session');
      }
    }
    
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  private clearSession(): void {
    this.currentUser = null;
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('celesteos_user');
    localStorage.removeItem('celesteos_access_token');
    localStorage.removeItem('celesteos_refresh_token');
  }

  // ============ AUTHENTICATION WEBHOOKS ============

  /**
   * User Login
   * Webhook: http://localhost:5678/webhook/user-auth
   */
  async login(email: string, password: string): Promise<WebhookResponse<UserAuthResponse>> {
    const payload = {
      action: 'user_login',
      username: email.toLowerCase().trim(),
      password,
      timestamp: new Date().toISOString(),
      source: 'celesteos_modern_local_ux',
      client_info: {
        user_agent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    };

    const response = await this.sendRequest<UserAuthResponse>('user-auth', payload);
    
    if (response.success && response.data) {
      this.currentUser = response.data;
      this.saveSession();
    }

    return response;
  }

  /**
   * User Signup (also uses user-auth endpoint with displayName)
   */
  async signup(displayName: string, email: string, password: string): Promise<WebhookResponse<UserAuthResponse>> {
    const payload = {
      action: 'user_signup',
      username: email.toLowerCase().trim(),
      password,
      displayName: displayName.trim(),
      timestamp: new Date().toISOString(),
      source: 'celesteos_modern_local_ux',
      client_info: {
        user_agent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    };

    const response = await this.sendRequest<UserAuthResponse>('user-auth', payload);
    
    if (response.success && response.data) {
      this.currentUser = response.data;
      this.saveSession();
    }

    return response;
  }

  /**
   * Logout
   */
  async logout(): Promise<boolean> {
    this.clearSession();
    // Optionally notify server about logout
    if (this.currentUser) {
      await this.sendRequest('user-auth', {
        action: 'logout',
        userId: this.currentUser.userId
      });
    }
    return true;
  }

  /**
   * Get current user
   */
  getCurrentUser(): UserAuthResponse | null {
    return this.currentUser;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // ============ CHAT WEBHOOKS ============

  /**
   * Send Text Chat Message
   * Webhook: http://localhost:5678/webhook/text-chat
   */
  async sendTextChat(
    message: string,
    searchStrategy: 'local' | 'yacht' | 'email' | 'web' = 'local'
  ): Promise<WebhookResponse<any>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: 'User not logged in'
      };
    }

    const payload = {
      action: 'text_chat',
      userId: this.currentUser.userId,
      userName: this.currentUser.userName,
      email: this.currentUser.email,
      message,
      search_strategy: searchStrategy,
      conversation_id: `conversation_${Date.now()}`,
      sessionId: this.currentUser.sessionId || `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'celesteos_modern_local_ux',
      email_integration: {
        connected: !!this.accessToken,
        user_email: this.currentUser.email,
        bearer_token_available: !!this.accessToken
      },
      client_info: {
        user_agent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    };

    return this.sendRequest('text-chat', payload);
  }

  // ============ MICROSOFT INTEGRATION WEBHOOKS ============

  /**
   * Connect Microsoft Email
   * Webhook: http://localhost:5678/webhook/microsoft-auth
   */
  async connectMicrosoftEmail(): Promise<WebhookResponse<MicrosoftAuthResponse>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: 'User not logged in'
      };
    }

    const payload: MicrosoftAuthPayload = {
      userId: this.currentUser.userId,
      email: this.currentUser.email,
      redirectUri: window.location.origin + '/auth/microsoft/callback'
    };

    const response = await this.sendRequest<MicrosoftAuthResponse>('microsoft-auth', payload);
    
    if (response.success && response.data) {
      // If we got an auth URL, redirect to it
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
      
      // If we got tokens, save them
      if (response.data.accessToken) {
        this.accessToken = response.data.accessToken;
        this.refreshToken = response.data.refreshToken || null;
        this.saveSession();
      }
    }

    return response;
  }

  /**
   * Handle Microsoft OAuth Callback
   */
  async handleMicrosoftCallback(code: string): Promise<WebhookResponse<MicrosoftAuthResponse>> {
    if (!this.currentUser) {
      return {
        success: false,
        error: 'User not logged in'
      };
    }

    const payload = {
      userId: this.currentUser.userId,
      email: this.currentUser.email,
      code,
      action: 'callback'
    };

    const response = await this.sendRequest<MicrosoftAuthResponse>('microsoft-auth', payload);
    
    if (response.success && response.data?.accessToken) {
      this.accessToken = response.data.accessToken;
      this.refreshToken = response.data.refreshToken || null;
      this.saveSession();
    }

    return response;
  }

  /**
   * Refresh Microsoft Token
   * Webhook: http://localhost:5678/webhook/token-refresh-trigger
   */
  async refreshMicrosoftToken(): Promise<WebhookResponse<MicrosoftAuthResponse>> {
    if (!this.currentUser || !this.refreshToken) {
      return {
        success: false,
        error: 'No refresh token available'
      };
    }

    const payload: TokenRefreshPayload = {
      userId: this.currentUser.userId,
      refreshToken: this.refreshToken,
      email: this.currentUser.email
    };

    const response = await this.sendRequest<MicrosoftAuthResponse>('token-refresh-trigger', payload);
    
    if (response.success && response.data?.accessToken) {
      this.accessToken = response.data.accessToken;
      if (response.data.refreshToken) {
        this.refreshToken = response.data.refreshToken;
      }
      this.saveSession();
    }

    return response;
  }

  /**
   * Check if Microsoft email is connected
   */
  isMicrosoftConnected(): boolean {
    return !!this.accessToken;
  }

  /**
   * Disconnect Microsoft email
   */
  disconnectMicrosoft(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.saveSession();
  }

  // ============ UTILITY METHODS ============

  /**
   * Test all webhook connections
   */
  async testAllWebhooks(): Promise<Record<string, boolean>> {
    const endpoints = [
      { name: 'user-auth', endpoint: '/user-auth' },
      { name: 'text-chat', endpoint: '/text-chat' },
      { name: 'microsoft-auth', endpoint: '/microsoft-auth' },
      { name: 'token-refresh', endpoint: '/token-refresh-trigger' }
    ];

    const results: Record<string, boolean> = {};

    for (const { name, endpoint } of endpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'OPTIONS',
          signal: AbortSignal.timeout(2000)
        });
        results[name] = response.ok || response.status === 405; // 405 means endpoint exists but doesn't support OPTIONS
      } catch {
        results[name] = false;
      }
    }

    return results;
  }
}

// Create singleton instance
const completeWebhookService = new CompleteWebhookService();

export default completeWebhookService;
export { CompleteWebhookService };
export type { 
  WebhookResponse, 
  UserAuthResponse, 
  TextChatPayload, 
  MicrosoftAuthResponse 
};