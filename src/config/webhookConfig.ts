// Webhook Configuration
// Production webhooks with fallback to local development

// Determine environment
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Get webhook URL from environment or use defaults
const WEBHOOK_BASE_URL = 
  import.meta.env.VITE_WEBHOOK_BASE_URL || 
  (isProduction 
    ? '/api/webhook?endpoint=' // Use Vercel proxy to handle CORS
    : 'http://localhost:5679/webhook/');

// Export configuration
export { WEBHOOK_BASE_URL };

// Webhook endpoints reference:
// - /user-auth - User login authentication
// - /user-signup - User registration  
// - /auth-logout - User logout
// - /auth/refresh - Token refresh
// - /auth/verify-token - Token verification
// - /text-chat - Chat messages
// - /microsoft-auth - Microsoft OAuth
// - /documents - Document management
// - /yacht-search - Yacht-specific searches
// - /email-search - Email searches