/**
 * Complete Webhook Service with All Endpoints
 * Includes authentication, chat, and Microsoft integration
 */

import { WEBHOOK_BASE_URL } from '../config/webhookConfig';
import type { WebhookResponseData, WebhookArrayResponse } from '../types/webhook';
import type { 
  OpenAICompletionResponse, 
  OpenAIMessageContent,
  DocumentUsed,
  SolutionCard,
  SolutionStep,
  NormalizedChatResponse,
  LegacyWebhookResponse
} from '../types/webhookFormats';
import { isOpenAIFormat, isLegacyFormat, hasDocumentsUsed } from '../types/webhookFormats';

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
  search_strategy: 'local' | 'yacht' | 'email';
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
    // Sync with Supabase authentication
    this.syncWithSupabaseAuth();
  }

  // ============ HELPER METHODS ============

  /**
   * Extract solution cards from webhook response
   * Formats documents and knowledge base results into solution card format
   */
  private extractSolutionsFromResponse(data: any, searchStrategy: string): any[] {
    // If solutions are already provided in correct format, return them
    if (data.solutions && Array.isArray(data.solutions)) {
      return data.solutions.map((sol: any) => ({
        ...sol,
        solution_id: sol.solution_id || sol.id || `solution_${Date.now()}_${Math.random()}`,
        confidenceScore: sol.confidenceScore || (sol.confidence ? Math.round(sol.confidence * 100) : 75)
      }));
    }

    // For yacht/knowledge base searches, convert documents to solution format
    if ((searchStrategy === 'yacht' || searchStrategy === 'email') && (data.documents_used || data.items || data.references)) {
      const docs = data.documents_used || data.items || data.references || [];
      const solutions = [];

      // Convert up to 3 most relevant documents to solution cards
      docs.slice(0, 3).forEach((doc: any, index: number) => {
        // Extract confidence score from relevance or confidence field
        let confidenceScore = 75; // Default confidence
        if (doc.confidence) {
          confidenceScore = typeof doc.confidence === 'number' ? Math.round(doc.confidence * 100) : 75;
        } else if (doc.relevance_score) {
          confidenceScore = Math.round(doc.relevance_score * 100);
        }

        // Extract source information
        const source = {
          title: doc.document_title || doc.source || doc.title || 'Yacht Documentation',
          page: doc.page_number || doc.page || undefined,
          revision: doc.revision || doc.version || undefined
        };

        // Parse content to extract procedural steps
        const steps = this.extractStepsFromContent(doc.content || doc.text || '');

        // Create solution card
        const solution = {
          solution_id: `solution_${index}_${Date.now()}`,
          title: doc.headline || doc.title || `Solution ${index + 1}`,
          confidence: confidenceScore >= 85 ? 'high' : confidenceScore >= 67.5 ? 'medium' : 'low',
          confidenceScore: confidenceScore,
          description: doc.summary || doc.description || '',
          source: source,
          source_document: doc,
          steps: steps,
          procedureLink: doc.url || doc.link || doc.original_doc_url || '#',
          original_doc_url: doc.url || doc.link || '',
          parts_needed: doc.parts_needed || [],
          estimated_time: doc.estimated_time || '',
          safety_warnings: doc.safety_warnings || [],
          specifications: doc.specifications || {}
        };

        solutions.push(solution);
      });

      return solutions;
    }

    return [];
  }

  /**
   * Extract procedural steps from document content
   */
  private extractStepsFromContent(content: string): any[] {
    if (!content) return [];

    const steps = [];
    
    // Look for numbered or bulleted lists
    const lines = content.split('\n');
    let stepNumber = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;

      // Check for numbered steps (1., 2., etc.)
      if (/^\d+[\.\)]\s/.test(trimmedLine)) {
        const stepText = trimmedLine.replace(/^\d+[\.\)]\s*/, '');
        steps.push({
          text: stepText,
          type: this.determineStepType(stepText),
          isBold: false
        });
        stepNumber++;
      }
      // Check for bullet points
      else if (/^[\-\*•]\s/.test(trimmedLine)) {
        const stepText = trimmedLine.replace(/^[\-\*•]\s*/, '');
        steps.push({
          text: stepText,
          type: this.determineStepType(stepText),
          isBold: false
        });
        stepNumber++;
      }
      // If we have less than 3 steps and this looks like an instruction
      else if (stepNumber < 3 && this.looksLikeInstruction(trimmedLine)) {
        steps.push({
          text: trimmedLine,
          type: this.determineStepType(trimmedLine),
          isBold: false
        });
        stepNumber++;
      }
    }

    // If no structured steps found, create steps from paragraphs
    if (steps.length === 0 && content.length > 50) {
      const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 20);
      paragraphs.slice(0, 5).forEach(para => {
        steps.push({
          text: para.trim(),
          type: this.determineStepType(para),
          isBold: false
        });
      });
    }

    // Ensure we have at least one step
    if (steps.length === 0) {
      steps.push({
        text: 'Review the documentation for detailed instructions.',
        type: 'normal',
        isBold: false
      });
    }

    return steps;
  }

  /**
   * Determine step type based on content
   */
  private determineStepType(text: string): 'warning' | 'tip' | 'normal' {
    const lowerText = text.toLowerCase();
    
    // Warning indicators
    if (lowerText.includes('warning') || lowerText.includes('caution') || 
        lowerText.includes('danger') || lowerText.includes('do not') ||
        lowerText.includes('never') || lowerText.includes('must not')) {
      return 'warning';
    }
    
    // Tip indicators
    if (lowerText.includes('tip') || lowerText.includes('note') || 
        lowerText.includes('hint') || lowerText.includes('pro tip') ||
        lowerText.includes('recommend')) {
      return 'tip';
    }
    
    return 'normal';
  }

  /**
   * Check if text looks like an instruction
   */
  private looksLikeInstruction(text: string): boolean {
    const instructionKeywords = [
      'check', 'verify', 'ensure', 'make sure', 'confirm',
      'inspect', 'test', 'measure', 'adjust', 'turn',
      'open', 'close', 'remove', 'install', 'replace',
      'connect', 'disconnect', 'start', 'stop', 'press'
    ];
    
    const lowerText = text.toLowerCase();
    return instructionKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Convert documents from OpenAI format to solution cards
   * Handles fault codes and technical manuals with proper formatting
   */
  private convertDocumentsToSolutionCards(
    documents: DocumentUsed[], 
    confidenceScore: number = 0.75
  ): SolutionCard[] {
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return [];
    }
    
    return documents.map((doc, index) => {
      // Calculate individual confidence for this solution
      const confidence = confidenceScore >= 0.85 ? 'high' : 
                        confidenceScore >= 0.675 ? 'medium' : 'low';
      
      // Create comprehensive steps based on fault code
      const steps: SolutionStep[] = [
        {
          text: `Access ${doc.source} technical manual for fault code ${doc.fault_code}`,
          type: 'normal',
          isBold: false
        },
        {
          text: `Navigate to ${doc.type === 'manual' ? 'troubleshooting section' : doc.type} for detailed procedures`,
          type: 'normal',
          isBold: false
        },
        {
          text: 'Ensure engine is off and system is safely isolated before beginning work',
          type: 'warning',
          isBold: true
        },
        {
          text: `Check all related systems as specified in ${doc.source} documentation`,
          type: 'tip',
          isBold: false
        },
        {
          text: 'Document all findings and actions taken for maintenance records',
          type: 'normal',
          isBold: false
        }
      ];

      // Add content-based steps if available
      if (doc.content) {
        const extractedSteps = this.extractStepsFromContent(doc.content);
        if (extractedSteps.length > 0) {
          // Replace generic steps with actual content
          steps.splice(1, 0, ...extractedSteps.slice(0, 3));
        }
      }

      const solutionCard: SolutionCard = {
        solution_id: doc.id || `solution_${index}_${Date.now()}`,
        title: `Fault Code ${doc.fault_code} - ${doc.source} Procedure`,
        confidence: confidence,
        confidenceScore: Math.round(confidenceScore * 100),
        description: doc.headline || `Technical procedure for ${doc.fault_code} from ${doc.source} manual`,
        source: {
          title: `${doc.source} Technical Manual`,
          page: doc.page,
          revision: doc.revision
        },
        steps: steps,
        procedureLink: doc.url,
        original_doc_url: doc.url,
        parts_needed: [],
        estimated_time: '',
        safety_warnings: [
          'Follow all manufacturer safety guidelines',
          'Ensure proper ventilation when working in engine spaces',
          'Use appropriate PPE as specified in manual'
        ],
        specifications: {
          fault_code: doc.fault_code,
          source_type: doc.type,
          document_id: doc.id
        }
      };

      return solutionCard;
    });
  }

  /**
   * Sync with Supabase authentication data
   * Converts Supabase user format to webhook service format
   */
  public syncWithSupabaseAuth(): void {
    try {
      const supabaseUserStr = localStorage.getItem('celesteos_user');
      if (supabaseUserStr) {
        const supabaseUser = JSON.parse(supabaseUserStr);
        
        // Convert Supabase format to webhook service format
        if (supabaseUser.id && supabaseUser.email) {
          this.currentUser = {
            userId: supabaseUser.id,
            userName: supabaseUser.displayName || supabaseUser.email.split('@')[0],
            email: supabaseUser.email,
            sessionId: `supabase_session_${Date.now()}`
          };
          
          console.log('🔄 Synced webhook service with Supabase user:', this.currentUser);
          
          // Save in webhook service format for consistency
          this.saveSession();
        }
      }
    } catch (error) {
      console.error('❌ Failed to sync with Supabase auth:', error);
    }
  }

  private async sendRequest<T = any>(
    endpoint: string,
    payload: any,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<WebhookResponse<T>> {
    // Handle proxy URL format for production
    const url = this.baseUrl.includes('endpoint=') 
      ? `${this.baseUrl}${endpoint}` // Proxy format: /api/webhook?endpoint=text-chat
      : `${this.baseUrl}${endpoint}`; // Direct format: http://localhost:5679/webhook/text-chat
    
    const maxRetries = 3;
    
    // Wrap payload in the expected format with metadata
    const webhookPayload = {
      ...payload,
      webhookUrl: url,
      executionMode: 'production',
      retryCount,
      clientVersion: '1.0.0',
      // Add endpoint for proxy
      ...(this.baseUrl.includes('endpoint=') && { endpoint })
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
    // Split displayName into firstName and lastName
    const nameParts = displayName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const payload = {
      action: 'user_signup',
      firstName: firstName,
      lastName: lastName,
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

    const response = await this.sendRequest<UserAuthResponse>('user-signup', payload);
    
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
      await this.sendRequest('auth-logout', {
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
    searchStrategy: 'local' | 'yacht' | 'email' = 'local'
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

    const response = await this.sendRequest('text-chat', payload);
    
    // Handle different response formats from webhook
    if (response.success && response.data) {
      let responseData = response.data;
      
      // Handle array response from webhook
      if (Array.isArray(responseData) && responseData.length > 0) {
        const firstItem = responseData[0] as any;
        // Check for OpenAI completion format with message.content structure
        if (firstItem.message && firstItem.message.content && firstItem.message.role === 'assistant') {
          const content = firstItem.message.content as OpenAIMessageContent;
          
          // Convert documents to solutions if solutions array is empty
          let solutions = content.solutions || [];
          if ((!solutions || solutions.length === 0) && hasDocumentsUsed(content)) {
            solutions = this.convertDocumentsToSolutionCards(
              content.documents_used, 
              content.confidence_score
            );
          }
          
          // Create normalized response
          responseData = {
            success: true,
            answer: content.message || content.ai_summary || 'Response received',
            messageId: `msg_${Date.now()}`,
            timestamp: new Date().toISOString(),
            confidence_score: content.confidence_score,
            ai_summary: content.ai_summary,
            documents_used: content.documents_used,
            solutions: solutions,
            items: [],
            sources: content.documents_used?.map(d => d.source) || [],
            references: content.documents_used || [],
            summary: content.ai_summary || '',
            metadata: {
              model: firstItem.model,
              finish_reason: firstItem.finish_reason
            }
          } as NormalizedChatResponse;
        }
        // Handle legacy format
        else if (firstItem.response || firstItem.answer) {
          const solutions = this.extractSolutionsFromResponse(firstItem, searchStrategy);
          
          responseData = {
            success: true,
            answer: firstItem.response?.answer || firstItem.answer || 'Response received',
            messageId: firstItem.query_id || `msg_${Date.now()}`,
            timestamp: firstItem.timestamp || new Date().toISOString(),
            items: firstItem.response?.items || firstItem.items || [],
            sources: firstItem.response?.sources || firstItem.sources || [],
            references: firstItem.response?.references || firstItem.references || [],
            summary: firstItem.response?.summary || firstItem.summary || '',
            metadata: firstItem.metadata || {},
            solutions: solutions
          };
        }
        // Unknown array format
        else {
          responseData = {
            success: true,
            answer: 'Response received',
            messageId: `msg_${Date.now()}`,
            timestamp: new Date().toISOString(),
            solutions: [],
            items: [],
            sources: [],
            references: [],
            summary: '',
            metadata: {}
          };
        }
      }
      // Handle direct object response
      else if (typeof responseData === 'object') {
        // Extract solutions from documents if available
        const solutions = this.extractSolutionsFromResponse(responseData, searchStrategy);
        
        responseData = {
          success: true,
          answer: responseData.answer || responseData.response || responseData.message || 'Response received',
          messageId: responseData.query_id || responseData.messageId || `msg_${Date.now()}`,
          timestamp: responseData.timestamp || new Date().toISOString(),
          items: responseData.items || [],
          sources: responseData.sources || [],
          references: responseData.references || [],
          summary: responseData.summary || '',
          metadata: responseData.metadata || {},
          solutions: solutions // Add solutions for display
        };
      }
      // Handle string response
      else if (typeof responseData === 'string') {
        responseData = {
          success: true,
          answer: responseData,
          messageId: `msg_${Date.now()}`,
          timestamp: new Date().toISOString(),
          items: [],
          sources: [],
          references: [],
          summary: '',
          metadata: {},
          solutions: [] // No solutions for plain text responses
        };
      }
      
      return {
        success: true,
        data: responseData
      };
    }
    
    return response;
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