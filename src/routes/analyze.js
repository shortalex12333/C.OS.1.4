import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import PatternDetector from '../services/PatternDetector.js';
import { trackAPIUsage } from '../lib/monitoring.js';
import pino from 'pino';

const router = Router();
const logger = pino({ name: 'analyze-route' });

// Validation middleware
const validateAnalyzeRequest = [
  body('userId').isString().notEmpty().withMessage('userId is required'),
  body('message').isString().notEmpty().withMessage('message is required'),
  body('context').optional().isObject(),
  body('context.businessType').optional().isString(),
  body('context.energyLevel').optional().isString(),
  body('context.sessionId').optional().isString()
];

// POST /api/analyze
router.post('/', validateAnalyzeRequest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }

  const { userId, message, context = {} } = req.body;
  const requestId = req.id;

  logger.info({ requestId, userId }, 'Analyze request received');

  try {
    // Detect patterns
    const patternData = await PatternDetector.detectPatterns(
      userId,
      message,
      context
    );

    // Track API usage
    await trackAPIUsage({
      endpoint: 'analyze',
      userId,
      requestId,
      processingTime: patternData.processingTime,
      patternsDetected: patternData.patterns.length
    });

    // Return analysis
    res.json({
      success: true,
      requestId,
      data: {
        patterns: patternData.patterns.slice(0, 3), // Top 3 patterns
        analysis: {
          intent: patternData.analysis?.intent,
          sentiment: patternData.analysis?.sentiment,
          confidence: patternData.patterns[0]?.confidence || 0
        },
        userContext: patternData.userContext,
        processingTime: patternData.processingTime
      }
    });

  } catch (error) {
    logger.error({ error, requestId, userId }, 'Analysis failed');

    res.status(500).json({
      error: 'Analysis failed',
      requestId,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message
    });
  }
});

// GET /api/analyze/health
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'analyze',
    timestamp: new Date().toISOString()
  });
});

export default router;