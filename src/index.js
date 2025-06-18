import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import * as Sentry from '@sentry/node';

// Import routes
import analyzeRoute from './routes/analyze.js';
import enhanceRoute from './routes/enhance.js';
import feedbackRoute from './routes/feedback.js';
import patternsRoute from './routes/patterns.js';
import healthRoute from './routes/health.js';

// Import services
import { initializeServices } from './services/index.js';
import { connectDatabase, disconnectDatabase } from './lib/database.js';
import { initializeCache } from './lib/cache.js';
import { setupMonitoring } from './lib/monitoring.js';

// Configuration
const config = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  sentryDsn: process.env.SENTRY_DSN
};

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
  // No transport in production - Vercel handles logs
});

// Initialize Sentry for production
if (config.sentryDsn && config.environment === 'production') {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.environment,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1
  });
}

// Create Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow API responses
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Compression
app.use(compression());

// Request logging
app.use(pinoHttp({ logger }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID middleware
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ 
      ip: req.ip, 
      path: req.path,
      userId: req.body?.userId 
    }, 'Rate limit exceeded');
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Simple in-memory queue simulation for Vercel compatibility
const queues = {
  analysis: { add: (data) => Promise.resolve(data) },
  learning: { add: (data) => Promise.resolve(data) },
  notifications: { add: (data) => Promise.resolve(data) }
};

// Health check (no rate limit)
app.use('/health', healthRoute);

// API Routes
app.use('/api/analyze', analyzeRoute);
app.use('/api/enhance', enhanceRoute);
app.use('/api/feedback', feedbackRoute);
app.use('/api/patterns', patternsRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logger.error({
    errorId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    userId: req.body?.userId
  });

  // Send to Sentry in production
  if (config.environment === 'production') {
    Sentry.captureException(err, {
      contexts: {
        request: {
          url: req.url,
          method: req.method,
          data: req.body
        }
      },
      tags: {
        errorId
      }
    });
  }

  res.status(err.status || 500).json({
    error: config.environment === 'production' 
      ? 'Internal server error' 
      : err.message,
    errorId,
    ...(config.environment !== 'production' && { stack: err.stack })
  });
});

// Initialize services and start server
async function start() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected');

    // Initialize cache
    await initializeCache();
    logger.info('Cache initialized');

    // Initialize services
    await initializeServices({ queues, logger });
    logger.info('Services initialized');

    // Setup monitoring
    setupMonitoring(app);
    logger.info('Monitoring setup complete');

    // Start server
    const server = app.listen(config.port, () => {
      logger.info({
        port: config.port,
        environment: config.environment,
        nodeVersion: process.version,
        pid: process.pid
      }, 'CELESTE7 Oracle API started');
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, starting graceful shutdown`);
      
      server.close(() => {
        logger.info('HTTP server closed');
      });

      // Close database
      await disconnectDatabase();
      logger.info('Database disconnected');

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.fatal(error, 'Failed to start server');
    process.exit(1);
  }
}

// Start the server
start();