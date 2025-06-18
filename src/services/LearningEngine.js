import { getDatabase } from '../lib/database.js';
import pino from 'pino';

const logger = pino({ name: 'LearningEngine' });

class LearningEngine {
  constructor() {
    this.db = null;
  }

  async initialize() {
    try {
      this.db = getDatabase();
      logger.info('LearningEngine initialized');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize LearningEngine');
      throw error;
    }
  }

  async processFeedback(userId, enhancementId, feedback) {
    try {
      logger.info({ userId, enhancementId }, 'Processing feedback');

      // Store feedback in database
      const { data, error } = await this.db
        .from('user_feedback')
        .insert({
          user_id: userId,
          enhancement_id: enhancementId,
          feedback_data: feedback,
          created_at: new Date().toISOString()
        });

      if (error) {
        logger.error({ error }, 'Failed to store feedback');
        throw error;
      }

      // Analyze feedback for learning
      await this.analyzeFeedback(userId, enhancementId, feedback);

      // Update user patterns if needed
      await this.updateUserPatterns(userId, feedback);

      logger.info({ userId, enhancementId }, 'Feedback processed successfully');

      return { success: true };

    } catch (error) {
      logger.error({ error, userId, enhancementId }, 'Feedback processing failed');
      throw error;
    }
  }

  async analyzeFeedback(userId, enhancementId, feedback) {
    const insights = {
      engagement: feedback.engaged,
      helpfulness: feedback.helpful,
      actionTaken: feedback.actionTaken,
      businessImpact: feedback.businessImpact
    };

    // Store insights for pattern improvement
    const { error } = await this.db
      .from('feedback_insights')
      .insert({
        user_id: userId,
        enhancement_id: enhancementId,
        insights: insights,
        created_at: new Date().toISOString()
      });

    if (error) {
      logger.error({ error }, 'Failed to store feedback insights');
    }

    // Log insights for analysis
    logger.info({ userId, insights }, 'Feedback insights recorded');
  }

  async updateUserPatterns(userId, feedback) {
    // If user found the enhancement helpful and took action,
    // we can strengthen the pattern detection for this user
    if (feedback.helpful && feedback.actionTaken) {
      logger.info({ userId }, 'Strengthening pattern detection for user');
      
      // In a real implementation, you would update the user's
      // pattern weights or preferences in the ML model
      
      const { error } = await this.db
        .from('user_patterns')
        .upsert({
          user_id: userId,
          pattern_strength: 'increased',
          last_updated: new Date().toISOString()
        });

      if (error) {
        logger.error({ error }, 'Failed to update user patterns');
      }
    }
  }

  async getFeedbackStats(userId) {
    try {
      const { data, error } = await this.db
        .from('user_feedback')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        logger.error({ error }, 'Failed to get feedback stats');
        throw error;
      }

      const stats = {
        totalFeedback: data.length,
        engaged: data.filter(f => f.feedback_data.engaged).length,
        helpful: data.filter(f => f.feedback_data.helpful).length,
        actionTaken: data.filter(f => f.feedback_data.actionTaken).length
      };

      return stats;

    } catch (error) {
      logger.error({ error, userId }, 'Failed to get feedback stats');
      throw error;
    }
  }
}

// Export singleton instance
export default new LearningEngine(); 