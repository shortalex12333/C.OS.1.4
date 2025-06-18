import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import LearningEngine from '../services/LearningEngine.js';
import pino from 'pino';

const router = Router();
const logger = pino({ name: 'feedback-route' });

// Validation
const validateFeedbackRequest = [
  body('userId').isString().notEmpty(),
  body('enhancementId').isString().notEmpty(),
  body('feedback').isObject(),
  body('feedback.engaged').isBoolean(),
  body('feedback.helpful').optional().isBoolean(),
  body('feedback.actionTaken').optional().isBoolean(),
  body('feedback.businessImpact').optional().isString()
];

// POST /api/feedback
router.post('/', validateFeedbackRequest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }

  const { userId, enhancementId, feedback } = req.body;
  const requestId = req.id;

  logger.info({ requestId, userId, enhancementId }, 'Feedback received');

  try {
    // Process feedback
    await LearningEngine.processFeedback(
      userId,
      enhancementId,
      feedback
    );

    res.json({
      success: true,
      requestId,
      message: 'Feedback recorded'
    });

  } catch (error) {
    logger.error({ error, requestId }, 'Feedback processing failed');

    res.status(500).json({
      error: 'Feedback processing failed',
      requestId
    });
  }
});

export default router;