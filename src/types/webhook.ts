/**
 * Webhook Response Type Definitions
 * Ensures type safety across the entire application
 */

export interface WebhookResponseData {
  success: boolean;
  answer: string;
  messageId: string;
  timestamp: string;
  items: string[];
  sources: string[];
  references: Array<{
    page?: number;
    revision?: string;
    url?: string;
  }>;
  summary: string;
  metadata: Record<string, any>;
}

export interface WebhookArrayResponse {
  response: {
    answer: string;
    items: string[];
    sources: string[];
    references: any[];
    summary: string;
    confidence?: number;
  };
  query_id: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  content: string | WebhookResponseData | WebhookArrayResponse | WebhookArrayResponse[];
  isUser: boolean;
  timestamp: string;
  searchType?: 'yacht' | 'email' | 'email-yacht';
  metadata?: any;
  isStreaming?: boolean;
}

export interface ParsedContent {
  text: string;
  solutions: any[] | null;
  items?: string[];
  sources?: string[];
  references?: any[];
  showRaw: boolean;
}