/**
 * Comprehensive TypeScript interfaces for all webhook response formats
 * Ensures type safety and consistency across the application
 */

// OpenAI Completion Format (Actual webhook response)
export interface OpenAICompletionResponse {
  index: number;
  message: {
    role: 'assistant' | 'user' | 'system';
    content: OpenAIMessageContent;
    refusal: null | string;
    annotations?: any[];
  };
  logprobs: null | any;
  finish_reason: 'stop' | 'length' | 'content_filter' | null;
}

export interface OpenAIMessageContent {
  confidence_score: number;
  message: string;
  ai_summary: string;
  documents_used: DocumentUsed[];
  solutions: SolutionCard[];
}

export interface DocumentUsed {
  id: string;
  fault_code: string;
  source: string;
  type: 'manual' | 'guide' | 'procedure';
  url: string;
  page?: number;
  revision?: string;
  content?: string;
  headline?: string;
}

export interface SolutionCard {
  solution_id: string;
  title: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number;
  description?: string;
  source: {
    title: string;
    page?: number;
    revision?: string;
  };
  steps: SolutionStep[];
  procedureLink: string;
  original_doc_url?: string;
  parts_needed?: string[];
  estimated_time?: string;
  safety_warnings?: string[];
  specifications?: any;
}

export interface SolutionStep {
  text: string;
  type: 'warning' | 'tip' | 'normal';
  isBold: boolean;
}

// Normalized internal format (what our app expects)
export interface NormalizedChatResponse {
  success: boolean;
  answer: string;
  messageId: string;
  timestamp: string;
  confidence_score?: number;
  ai_summary?: string;
  documents_used?: DocumentUsed[];
  solutions: SolutionCard[];
  items?: any[];
  sources?: string[];
  references?: any[];
  summary?: string;
  metadata?: any;
}

// Legacy formats for backward compatibility
export interface LegacyWebhookResponse {
  response?: {
    answer?: string;
    items?: any[];
    sources?: string[];
    references?: any[];
    summary?: string;
  };
  answer?: string;
  query_id?: string;
  timestamp?: string;
  metadata?: any;
}

// Type guards for runtime type checking
export function isOpenAIFormat(data: any): data is OpenAICompletionResponse[] {
  return Array.isArray(data) && 
         data.length > 0 && 
         data[0].message && 
         data[0].message.content &&
         typeof data[0].message.role === 'string';
}

export function isLegacyFormat(data: any): data is LegacyWebhookResponse {
  return data && (data.response || data.answer);
}

export function hasDocumentsUsed(content: any): boolean {
  return content && 
         content.documents_used && 
         Array.isArray(content.documents_used) && 
         content.documents_used.length > 0;
}