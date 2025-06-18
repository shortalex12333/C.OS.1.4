import { MLService } from './index.js';
import pino from 'pino';

const logger = pino({ name: 'PatternDetector' });

class PatternDetector {
  constructor() {
    this.mlService = new MLService();
    this.patterns = {
      procrastination: {
        keywords: ['tomorrow', 'later', 'maybe', 'sometime', 'when I have time'],
        indicators: ['uncertainty', 'delayed_action', 'low_energy'],
        confidence: 0.8
      },
      planning_paralysis: {
        keywords: ['plan', 'strategy', 'research', 'figure out', 'decide'],
        indicators: ['overthinking', 'analysis_paralysis', 'high_planning'],
        confidence: 0.7
      },
      perfectionism: {
        keywords: ['perfect', 'best', 'right', 'exactly', 'precise'],
        indicators: ['high_standards', 'fear_of_mistakes', 'delayed_action'],
        confidence: 0.75
      },
      pricing_anxiety: {
        keywords: ['price', 'cost', 'expensive', 'cheap', 'value', 'worth'],
        indicators: ['financial_concern', 'uncertainty', 'decision_fatigue'],
        confidence: 0.6
      },
      decision_fatigue: {
        keywords: ['tired', 'exhausted', 'overwhelmed', 'too many', 'choices'],
        indicators: ['mental_exhaustion', 'reduced_willpower', 'simplified_choices'],
        confidence: 0.65
      },
      imposter_syndrome: {
        keywords: ['not good enough', 'fake', 'lucky', 'don\'t deserve', 'fraud'],
        indicators: ['self_doubt', 'undermining_achievements', 'fear_of_exposure'],
        confidence: 0.8
      }
    };
  }

  async detectPatterns(userId, message, context = {}) {
    const startTime = Date.now();
    
    try {
      logger.info({ userId, messageLength: message.length }, 'Starting pattern detection');

      // Get ML analysis
      const analysis = await this.mlService.analyzeMessage(message, context);
      
      // Detect patterns based on analysis and keywords
      const detectedPatterns = this.analyzePatterns(message, analysis, context);
      
      // Build user context
      const userContext = this.buildUserContext(userId, context, detectedPatterns);
      
      const processingTime = Date.now() - startTime;
      
      logger.info({ 
        userId, 
        patternsFound: detectedPatterns.length, 
        processingTime 
      }, 'Pattern detection completed');

      return {
        patterns: detectedPatterns,
        analysis: {
          intent: analysis.intent,
          sentiment: analysis.sentiment,
          entities: analysis.entities
        },
        userContext,
        processingTime
      };

    } catch (error) {
      logger.error({ error, userId }, 'Pattern detection failed');
      throw error;
    }
  }

  analyzePatterns(message, analysis, context) {
    const detectedPatterns = [];
    const lowerMessage = message.toLowerCase();

    // Check each pattern
    for (const [patternName, pattern] of Object.entries(this.patterns)) {
      let confidence = 0;
      let indicators = [];

      // Check keywords
      const keywordMatches = pattern.keywords.filter(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      );
      
      if (keywordMatches.length > 0) {
        confidence += 0.3;
        indicators.push(`keyword_match:${keywordMatches.length}`);
      }

      // Check sentiment alignment
      if (analysis.sentiment) {
        if (patternName === 'procrastination' && analysis.sentiment.score < 0.3) {
          confidence += 0.2;
          indicators.push('low_sentiment');
        }
        if (patternName === 'imposter_syndrome' && analysis.sentiment.score < 0.2) {
          confidence += 0.25;
          indicators.push('very_low_sentiment');
        }
      }

      // Check intent alignment
      if (analysis.intent && analysis.intent.label === patternName) {
        confidence += 0.4;
        indicators.push('intent_match');
      }

      // Check context indicators
      if (context.energyLevel === 'low' && patternName === 'procrastination') {
        confidence += 0.15;
        indicators.push('low_energy_context');
      }

      if (context.businessType === 'saas' && patternName === 'pricing_anxiety') {
        confidence += 0.1;
        indicators.push('saas_context');
      }

      // If confidence is high enough, add the pattern
      if (confidence >= 0.3) {
        detectedPatterns.push({
          name: patternName,
          confidence: Math.min(confidence, 1.0),
          indicators,
          description: this.getPatternDescription(patternName),
          suggestions: this.getPatternSuggestions(patternName)
        });
      }
    }

    // Sort by confidence
    return detectedPatterns.sort((a, b) => b.confidence - a.confidence);
  }

  buildUserContext(userId, context, patterns) {
    return {
      userId,
      businessType: context.businessType || 'unknown',
      energyLevel: context.energyLevel || 'medium',
      sessionId: context.sessionId,
      detectedPatterns: patterns.map(p => p.name),
      primaryPattern: patterns[0]?.name || null,
      confidence: patterns[0]?.confidence || 0,
      timestamp: new Date().toISOString()
    };
  }

  getPatternDescription(patternName) {
    const descriptions = {
      procrastination: 'Tendency to delay tasks or decisions, often due to uncertainty or low energy',
      planning_paralysis: 'Overthinking and excessive planning that prevents taking action',
      perfectionism: 'Setting unrealistically high standards that block progress',
      pricing_anxiety: 'Worry about pricing decisions and value perception',
      decision_fatigue: 'Mental exhaustion from making too many decisions',
      imposter_syndrome: 'Feeling like a fraud despite evidence of competence'
    };
    return descriptions[patternName] || 'Behavioral pattern detected';
  }

  getPatternSuggestions(patternName) {
    const suggestions = {
      procrastination: [
        'Break the task into smaller, manageable pieces',
        'Set a specific deadline for the next step',
        'Focus on progress, not perfection'
      ],
      planning_paralysis: [
        'Set a time limit for planning (e.g., 30 minutes)',
        'Start with the smallest possible action',
        'Trust your instincts and move forward'
      ],
      perfectionism: [
        'Define what "good enough" looks like',
        'Set a deadline and stick to it',
        'Remember: done is better than perfect'
      ],
      pricing_anxiety: [
        'Research competitor pricing',
        'Focus on value delivered, not just cost',
        'Start with a test price and adjust based on feedback'
      ],
      decision_fatigue: [
        'Limit daily decisions by creating routines',
        'Make important decisions in the morning',
        'Simplify choices where possible'
      ],
      imposter_syndrome: [
        'Keep a record of your achievements',
        'Remember that everyone starts somewhere',
        'Focus on helping others rather than proving yourself'
      ]
    };
    return suggestions[patternName] || ['Consider seeking professional guidance'];
  }
}

// Export singleton instance
export default new PatternDetector(); 