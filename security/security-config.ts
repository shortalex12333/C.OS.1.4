// Enterprise Security Configuration
// Production-grade security hardening for CelesteOS ChatGPT Clone

import crypto from 'crypto';

export interface SecurityConfig {
  cors: {
    origins: string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
  };
  headers: {
    contentSecurityPolicy: string;
    hsts: string;
    xFrameOptions: string;
    xContentTypeOptions: string;
    referrerPolicy: string;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
  };
  session: {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
}

// Production Security Configuration
export const productionSecurityConfig: SecurityConfig = {
  cors: {
    origins: [
      process.env.FRONTEND_URL || 'https://celesteos-chatgpt-clone.vercel.app',
      'https://*.vercel.app',
      'https://*.netlify.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin'
    ]
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },

  headers: {
    contentSecurityPolicy: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.app;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' data: https://fonts.gstatic.com;
      img-src 'self' data: blob: https: http:;
      connect-src 'self' https://graph.microsoft.com https://login.microsoftonline.com https://*.vercel.app https://*.netlify.app;
      frame-src 'self' https://login.microsoftonline.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    `.replace(/\s+/g, ' ').trim(),

    hsts: 'max-age=31536000; includeSubDomains; preload',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin'
  },

  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16
  },

  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true, // HTTPS only in production
    httpOnly: true,
    sameSite: 'strict'
  }
};

// Security Utilities
export class SecurityUtils {
  private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || this.generateKey();

  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  static hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static verifyHash(data: string, hash: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(this.hashData(data)),
      Buffer.from(hash)
    );
  }

  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.ENCRYPTION_KEY);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher('aes-256-gcm', this.ENCRYPTION_KEY);
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static sanitizeInput(input: string): string {
    // Basic XSS protection
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validateInput(input: string, maxLength: number = 1000): boolean {
    return typeof input === 'string' && 
           input.length > 0 && 
           input.length <= maxLength &&
           !input.includes('<script>') &&
           !input.includes('javascript:');
  }

  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static validateCSRFToken(token: string, sessionToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(sessionToken)
    );
  }
}

// Security Middleware for API routes
export const securityMiddleware = {
  // CORS middleware
  cors: (req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    const config = productionSecurityConfig.cors;

    if (config.origins.includes(origin) || config.origins.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', config.credentials);
    res.setHeader('Access-Control-Allow-Methods', config.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  },

  // Security headers middleware
  securityHeaders: (req: any, res: any, next: any) => {
    const config = productionSecurityConfig.headers;
    
    res.setHeader('Content-Security-Policy', config.contentSecurityPolicy);
    res.setHeader('Strict-Transport-Security', config.hsts);
    res.setHeader('X-Frame-Options', config.xFrameOptions);
    res.setHeader('X-Content-Type-Options', config.xContentTypeOptions);
    res.setHeader('Referrer-Policy', config.referrerPolicy);
    res.setHeader('X-Powered-By', ''); // Hide server info

    next();
  },

  // Input validation middleware
  validateInput: (req: any, res: any, next: any) => {
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = SecurityUtils.sanitizeInput(req.query[key]);
        }
      });
    }

    // Sanitize body parameters
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = SecurityUtils.sanitizeInput(req.body[key]);
        }
      });
    }

    next();
  },

  // Rate limiting (simple implementation)
  rateLimit: (() => {
    const requests = new Map();
    const config = productionSecurityConfig.rateLimit;

    return (req: any, res: any, next: any) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - config.windowMs;

      if (!requests.has(ip)) {
        requests.set(ip, []);
      }

      const userRequests = requests.get(ip).filter((time: number) => time > windowStart);
      
      if (userRequests.length >= config.max) {
        res.status(429).json({ error: config.message });
        return;
      }

      userRequests.push(now);
      requests.set(ip, userRequests);
      next();
    };
  })()
};

// Security Audit Functions
export class SecurityAudit {
  static auditEnvironment(): {
    issues: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check environment variables
    if (!process.env.ENCRYPTION_KEY) {
      issues.push('ENCRYPTION_KEY environment variable not set');
    }

    if (!process.env.MICROSOFT_CLIENT_SECRET) {
      issues.push('MICROSOFT_CLIENT_SECRET environment variable not set');
    }

    if (process.env.NODE_ENV !== 'production') {
      warnings.push('NODE_ENV is not set to production');
    }

    if (!process.env.FRONTEND_URL) {
      warnings.push('FRONTEND_URL not set for CORS configuration');
    }

    // Security recommendations
    recommendations.push('Enable database encryption at rest');
    recommendations.push('Implement API key rotation');
    recommendations.push('Set up intrusion detection');
    recommendations.push('Configure automated security scanning');

    return { issues, warnings, recommendations };
  }

  static generateSecurityReport(): {
    timestamp: string;
    environment: string;
    audit: ReturnType<typeof SecurityAudit.auditEnvironment>;
    config: SecurityConfig;
  } {
    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      audit: this.auditEnvironment(),
      config: productionSecurityConfig
    };
  }
}

export default {
  config: productionSecurityConfig,
  utils: SecurityUtils,
  middleware: securityMiddleware,
  audit: SecurityAudit
};