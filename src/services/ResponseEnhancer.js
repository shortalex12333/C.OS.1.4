import { MLService } from './index.js';
import pino from 'pino';

const logger = pino({ name: 'ResponseEnhancer' });

class ResponseEnhancer {
  constructor() {
    this.mlService = new MLService();
  }

  async enhanceResponse(originalResponse, patternData, context = {}) {
    const startTime = Date.now();
    
    try {
      logger.info({ 
        userId: context.userId, 
        patternsFound: patternData.patterns?.length || 0 
      }, 'Starting response enhancement');

      // If no patterns detected, return original response
      if (!patternData.patterns || patternData.patterns.length === 0) {
        return {
          enhanced: false,
          response: originalResponse,
          reason: 'No behavioral patterns detected',
          processingTime: Date.now() - startTime
        };
      }

      // Get the primary pattern
      const primaryPattern = patternData.patterns[0];
      
      // Try ML-based enhancement first
      const mlEnhancement = await this.mlService.generateEnhancement(
        originalResponse,
        {
          intent: { primary: primaryPattern.name, confidence: primaryPattern.confidence },
          sentiment: patternData.analysis?.sentiment || { sentiment: 'neutral', score: 0.5 }
        },
        context
      );

      // If ML enhancement worked, return it
      if (mlEnhancement.enhanced) {
        const processingTime = Date.now() - startTime;
        
        logger.info({ 
          userId: context.userId, 
          pattern: primaryPattern.name,
          enhanced: true,
          processingTime 
        }, 'ML response enhancement completed');

        return {
          enhanced: true,
          response: mlEnhancement.response,
          pattern: {
            type: primaryPattern.name,
            confidence: primaryPattern.confidence,
            description: primaryPattern.description,
            suggestions: primaryPattern.suggestions
          },
          processingTime,
          provider: mlEnhancement.provider,
          model: mlEnhancement.model
        };
      }

      // Fallback to template-based enhancement
      const templateResponse = this.enhanceWithTemplate(originalResponse, primaryPattern, context);
      
      const processingTime = Date.now() - startTime;
      
      logger.info({ 
        userId: context.userId, 
        pattern: primaryPattern.name,
        enhanced: templateResponse !== originalResponse,
        processingTime 
      }, 'Template response enhancement completed');

      return {
        enhanced: templateResponse !== originalResponse,
        response: templateResponse,
        pattern: {
          type: primaryPattern.name,
          confidence: primaryPattern.confidence,
          description: primaryPattern.description,
          suggestions: primaryPattern.suggestions
        },
        processingTime,
        provider: 'template',
        model: 'behavioral_template'
      };

    } catch (error) {
      logger.error({ error, userId: context.userId }, 'Response enhancement failed');
      
      return {
        enhanced: false,
        response: originalResponse,
        reason: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  // Alternative enhancement method using templates
  enhanceWithTemplate(originalResponse, pattern, context = {}) {
    const templates = {
      procrastination: {
        prefix: "⏰ I notice you're putting this off. ",
        suffix: " What's the smallest step you could take right now?",
        tone: "direct but encouraging"
      },
      planning_paralysis: {
        prefix: "🧠 You're overthinking this. ",
        suffix: " Pick one thing and start. You can adjust later.",
        tone: "action-oriented"
      },
      perfectionism: {
        prefix: "🎯 Perfect is the enemy of done. ",
        suffix: " Ship it now, improve it later.",
        tone: "pragmatic"
      },
      pricing_anxiety: {
        prefix: "💰 Price is what you pay, value is what you get. ",
        suffix: " Focus on the value you're delivering.",
        tone: "value-focused"
      },
      decision_fatigue: {
        prefix: "🤔 Too many choices are exhausting. ",
        suffix: " Go with your gut and move forward.",
        tone: "simplifying"
      },
      imposter_syndrome: {
        prefix: "💪 You've earned your success. ",
        suffix: " Stop second-guessing yourself.",
        tone: "supportive"
      }
    };

    const template = templates[pattern.name];
    if (!template) {
      return originalResponse;
    }

    return `${template.prefix}${originalResponse}${template.suffix}`;
  }
}

// Export singleton instance
export default new ResponseEnhancer(); 