// Webhook Configuration
// Production webhooks with fallback to local development

// Determine environment
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Get webhook URL from environment or use defaults
const WEBHOOK_BASE_URL = 
  import.meta.env.VITE_WEBHOOK_BASE_URL || 
  (isProduction 
    ? 'https://your-n8n-instance.com/webhook/' // Replace with actual N8N production URL
    : 'http://localhost:5679/webhook/');

// Export configuration
export { WEBHOOK_BASE_URL };

// Webhook endpoints reference:
// - /user-auth - User authentication
// - /text-chat - Chat messages
// - /microsoft-auth - Microsoft OAuth
// - /token-refresh-trigger - Token refresh
// - /documents - Document management
// - /yacht-search - Yacht-specific searches
// - /email-search - Email searches
// - /web-search - Web searches