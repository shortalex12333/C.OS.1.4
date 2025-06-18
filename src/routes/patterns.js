import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import PatternDetector from '../services/PatternDetector.js';
import { trackAPIUsage } from '../lib/monitoring.js';
import pino from 'pino';

const router = Router();
const logger = pino({ name: 'patterns-route' });

// Validation
const validatePatternsRequest = [
  body('userId').isString().notEmpty(),
  body('message').isString().notEmpty(),
  body('context').optional().isObject()
];

// POST /api/patterns/detect
router.post('/detect', validatePatternsRequest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }

  const { userId, message, context = {} } = req.body;
  const requestId = req.id;

  logger.info({ requestId, userId }, 'Pattern detection request received');

  try {
    // Detect patterns
    const patternData = await PatternDetector.detectPatterns(
      userId,
      message,
      context
    );

    // Track usage
    await trackAPIUsage({
      endpoint: 'patterns/detect',
      userId,
      requestId,
      patternsDetected: patternData.patterns.length,
      processingTime: patternData.processingTime
    });

    res.json({
      success: true,
      requestId,
      data: patternData
    });

  } catch (error) {
    logger.error({ error, requestId, userId }, 'Pattern detection failed');

    res.status(500).json({
      error: 'Pattern detection failed',
      requestId,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message
    });
  }
});

// GET /api/patterns/list
router.get('/list', (req, res) => {
  const patterns = {
    procrastination: {
      description: 'Tendency to delay tasks or decisions',
      keywords: ['tomorrow', 'later', 'maybe', 'sometime'],
      suggestions: [
        'Break tasks into smaller pieces',
        'Set specific deadlines',
        'Focus on progress over perfection'
      ]
    },
    planning_paralysis: {
      description: 'Overthinking that prevents action',
      keywords: ['plan', 'strategy', 'research', 'figure out'],
      suggestions: [
        'Set time limits for planning',
        'Start with the smallest action',
        'Trust your instincts'
      ]
    },
    perfectionism: {
      description: 'Unrealistically high standards blocking progress',
      keywords: ['perfect', 'best', 'right', 'exactly'],
      suggestions: [
        'Define "good enough"',
        'Set deadlines and stick to them',
        'Remember: done is better than perfect'
      ]
    },
    pricing_anxiety: {
      description: 'Worry about pricing decisions and value perception',
      keywords: ['price', 'cost', 'expensive', 'cheap', 'value'],
      suggestions: [
        'Research competitor pricing',
        'Focus on value delivered',
        'Start with test pricing'
      ]
    },
    decision_fatigue: {
      description: 'Mental exhaustion from too many decisions',
      keywords: ['tired', 'exhausted', 'overwhelmed', 'choices'],
      suggestions: [
        'Limit daily decisions',
        'Make important decisions in the morning',
        'Simplify choices'
      ]
    },
    imposter_syndrome: {
      description: 'Feeling like a fraud despite competence',
      keywords: ['not good enough', 'fake', 'lucky', 'don\'t deserve'],
      suggestions: [
        'Keep achievement records',
        'Remember everyone starts somewhere',
        'Focus on helping others'
      ]
    }
  };

  res.json({
    success: true,
    data: {
      patterns,
      total: Object.keys(patterns).length
    }
  });
});

// GET /api/patterns/health
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'patterns',
    timestamp: new Date().toISOString()
  });
});

export default router;