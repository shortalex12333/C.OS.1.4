import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

export function setupMonitoring(app) {
  // Add request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    });
    
    next();
  });
  
  // Add error monitoring
  app.use((err, req, res, next) => {
    logger.error({
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
      body: req.body
    });
    next(err);
  });
  
  return logger;
}

export async function trackAPIUsage(data) {
  logger.info({
    type: 'api_usage',
    ...data
  });
  
  // In a real implementation, you might send this to a metrics service
  // like DataDog, New Relic, or your own analytics database
}

export async function trackMLUsage(data) {
  logger.info({
    type: 'ml_usage',
    ...data
  });
  
  // In a real implementation, you might track ML model usage
  // for cost optimization and performance monitoring
}

export { logger }; 