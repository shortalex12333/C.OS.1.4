import pino from 'pino';
import MLService from './MLService.js';
import { INTERVENTION_TEMPLATES } from '../utils/prompts.js';
import { supabase } from '../lib/database.js';

const logger = pino({ name: 'ResponseEnhancer' });

export class ResponseEnhancer {
  constructor() {
    this.templates = INTERVENTION_TEMPLATES;
    this.enhancementCache = new Map();
  }

  async enhanceResponse(originalResponse, patternData, context = {}) {
    const startTime = Date.now();
    const enhancementId = `enh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Check if enhancement is needed
      const shouldEnhance = this.shouldEnhance(patternData, context);
      if (!shouldEnhance.enhance) {
        return {
          enhanced: false,
          response: originalResponse,
          reason: shouldEnhance.reason,
          id: enhancementId
        };
      }

      // Get primary pattern
      const primaryPattern = patternData.patterns[0];
      if (!primaryPattern || primaryPattern.confidence < 0.75) {
        return {
          enhanced: false,
          response: originalResponse,
          reason: 'No high-confidence patterns detected',
          id: enhancementId
        };
      }

      // Generate enhancement
      const enhancement = await this.generateEnhancement(
        originalResponse,
        primaryPattern,
        patternData,
        context
      );

      // Format final response
      const enhancedResponse = this.formatEnhancedResponse(
        originalResponse,
        enhancement,
        primaryPattern,
        context
      );

      // Track enhancement
      await this.trackEnhancement(
        enhancementId,
        originalResponse,
        enhancedResponse,
        primaryPattern,
        context
      );

      logger.info({
        enhancementId,
        patternType: primaryPattern.type,
        confidence: primaryPattern.confidence,
        processingTime: Date.now() - startTime
      }, 'Response enhanced');

      return {
        enhanced: true,
        response: enhancedResponse,
        enhancement,
        pattern: primaryPattern,
        id: enhancementId,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      logger.error({ error, enhancementId }, 'Enhancement failed');
      
      return {
        enhanced: false,
        response: originalResponse,
        reason: error.message,
        id: enhancementId
      };
    }
  }

  shouldEnhance(patternData, context) {
    // Check confidence threshold
    if (!patternData.patterns || patternData.patterns.length === 0) {
      return { enhance: false, reason: 'No patterns detected' };
    }

    const primaryPattern = patternData.patterns[0];
    if (primaryPattern.confidence < 0.75) {
      return { enhance: false, reason: 'Pattern confidence too low' };
    }

    // Check user preferences
    if (context.userPreferences?.disableEnhancements) {
      return { enhance: false, reason: 'User disabled enhancements' };
    }

    // Check enhancement frequency
    const recentEnhancements = this.getRecentEnhancements(context.userId);
    if (recentEnhancements > 3) {
      return { enhance: false, reason: 'Too many recent enhancements' };
    }

    // Check pattern urgency
    if (primaryPattern.type === 'acute_frustration' || 
        primaryPattern.priority === 'critical') {
      return { enhance: true, reason: 'Urgent pattern detected' };
    }

    return { enhance: true, reason: 'Standard enhancement criteria met' };
  }

  async generateEnhancement(originalResponse, pattern, patternData, context) {
    // Try ML generation first
    const mlEnhancement = await this.generateMLEnhancement(
      originalResponse,
      pattern,
      patternData,
      context
    );

    if (mlEnhancement.success) {
      return mlEnhancement.enhancement;
    }

    // Fallback to template-based enhancement
    return this.generateTemplateEnhancement(pattern, context);
  }

  async generateMLEnhancement(originalResponse, pattern, patternData, context) {
    try {
      const enhancement = await MLService.generateEnhancement(
        originalResponse,
        {
          intent: { primary: pattern.type, confidence: pattern.confidence },
          sentiment: patternData.analysis?.sentiment,
          confidence: pattern.confidence
        },
        context
      );

      if (enhancement.enhanced) {
        return {
          success: true,
          enhancement: enhancement.response,
          provider: enhancement.provider,
          model: enhancement.model
        };
      }

      return { success: false };

    } catch (error) {
      logger.error({ error }, 'ML enhancement failed');
      return { success: false };
    }
  }

  generateTemplateEnhancement(pattern, context) {
    const templates = this.templates[pattern.type];
    if (!templates) {
      return this.getGenericEnhancement(pattern);
    }

    // Select template based on context
    let template;
    if (context.energyLevel === 'low' && templates.low_energy) {
      template = templates.low_energy;
    } else if (context.businessType && templates[context.businessType]) {
      template = templates[context.businessType];
    } else if (context.trustLevel > 7 && templates.high_trust) {
      template = templates.high_trust;
    } else {
      template = templates.default || templates.general;
    }

    // Personalize template
    return this.personalizeTemplate(template, pattern, context);
  }

  personalizeTemplate(template, pattern, context) {
    let personalized = template;

    // Replace variables
    const variables = {
      '{pattern}': pattern.type.replace(/_/g, ' '),
      '{confidence}': `${Math.round(pattern.confidence * 100)}%`,
      '{business_type}': context.businessType || 'business',
      '{energy}': context.energyLevel || 'current',
      '{name}': context.userName || 'there'
    };

    for (const [variable, value] of Object.entries(variables)) {
      personalized = personalized.replace(new RegExp(variable, 'g'), value);
    }

    return personalized;
  }

  formatEnhancedResponse(original, enhancement, pattern, context) {
    // Determine format based on pattern and context
    const format = this.getResponseFormat(pattern, context);

    switch (format) {
      case 'direct':
        return `${original}\n\n${enhancement}`;

      case 'callout':
        return `${original}\n\n💡 **Pattern Alert**: ${enhancement}`;

      case 'gentle':
        return `${original}\n\nBy the way, ${enhancement.toLowerCase()}`;

      case 'urgent':
        return `${original}\n\n🚨 ${enhancement}`;

      case 'motivational':
        return `${original}\n\n🔥 ${enhancement}`;

      default:
        return `${original}\n\n💡 ${enhancement}`;
    }
  }

  getResponseFormat(pattern, context) {
    // Urgent patterns
    if (pattern.type === 'acute_frustration' || pattern.priority === 'critical') {
      return 'urgent';
    }

    // Low energy states
    if (context.energyLevel === 'low') {
      return 'gentle';
    }

    // High trust users
    if (context.trustLevel > 8) {
      return 'direct';
    }

    // Pattern-specific formatting
    const patternFormats = {
      procrastination: 'callout',
      planning_paralysis: 'direct',
      perfectionism: 'motivational',
      revenue_psychology: 'direct',
      imposter_syndrome: 'gentle'
    };

    return patternFormats[pattern.type] || 'callout';
  }

  async trackEnhancement(id, original, enhanced, pattern, context) {
    try {
      const record = {
        enhancement_id: id,
        user_id: context.userId,
        pattern_type: pattern.type,
        pattern_confidence: pattern.confidence,
        original_response: original,
        enhanced_response: enhanced,
        enhancement_type: pattern.trigger,
        context_data: {
          energy_level: context.energyLevel,
          business_type: context.businessType,
          trust_level: context.trustLevel
        },
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('response_enhancements')
        .insert([record]);

      if (error) {
        logger.error({ error, id }, 'Failed to track enhancement');
      }

    } catch (error) {
      logger.error({ error, id }, 'Error tracking enhancement');
    }
  }

  getRecentEnhancements(userId) {
    // Simple in-memory tracking for rate limiting
    const key = `enhancements:${userId}`;
    const recent = this.enhancementCache.get(key) || [];
    
    // Filter to last hour
    const hourAgo = Date.now() - 3600000;
    const filtered = recent.filter(timestamp => timestamp > hourAgo);
    
    this.enhancementCache.set(key, filtered);
    
    return filtered.length;
  }

  getGenericEnhancement(pattern) {
    const generic = {
      procrastination: "I notice you're delaying. What's one small step you can take right now?",
      planning_paralysis: "Another plan won't help. Pick one action and do it today.",
      perfectionism: "Perfect is the enemy of done. Ship it at 80%.",
      revenue_psychology: "Your pricing reflects your confidence. Add 30%.",
      decision_paralysis: "Analysis won't give you certainty. Pick one and iterate.",
      imposter_syndrome: "You know more than you think. Your experience has value.",
      execution_block: "You're stuck. Break it down to the smallest possible step.",
      acute_frustration: "I hear your frustration. Let's focus on what you can control.",
      revenue_stagnation: "Same actions, same results. What experiment can you run this week?",
      customer_retention_issues: "Acquisition without retention is a leaky bucket. Talk to 3 customers today."
    };

    return generic[pattern.type] || "Take action on this insight today.";
  }
}

// Export singleton
export default new ResponseEnhancer();