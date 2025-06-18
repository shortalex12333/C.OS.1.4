import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import PatternDetector from '../services/PatternDetector.js';
import ResponseEnhancer from '../services/ResponseEnhancer.js';
import { trackAPIUsage } from '../lib/monitoring.js';
import pino from 'pino';

const router = Router();
const logger = pino({ name: 'enhance-route' });

// Validation
const validateEnhanceRequest = [
  body('userId').isString().notEmpty(),
  body('message').isString().notEmpty(),
  body('aiResponse').isString().notEmpty(),
  body('context').optional().isObject()
];

// POST /api/enhance
router.post('/', validateEnhanceRequest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }

  const { userId, message, aiResponse, context = {} } = req.body;
  const requestId = req.id;

  logger.info({ requestId, userId }, 'Enhance request received');

  try {
    // Detect patterns first
    const patternData = await PatternDetector.detectPatterns(
      userId,
      message,
      context
    );

    // Enhance response based on patterns
    const enhancement = await ResponseEnhancer.enhanceResponse(
      aiResponse,
      patternData,
      { ...context, userId }
    );

    // Track usage
    await trackAPIUsage({
      endpoint: 'enhance',
      userId,
      requestId,
      enhanced: enhancement.enhanced,
      patternType: enhancement.pattern?.type,
      processingTime: enhancement.processingTime
    });

    res.json({
      success: true,
      requestId,
      data: enhancement
    });

  } catch (error) {
    logger.error({ error, requestId, userId }, 'Enhancement failed');

    res.status(500).json({
      error: 'Enhancement failed',
      requestId,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message
    });
  }
});

export default router;