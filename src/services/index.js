import { HfInference } from '@huggingface/inference';
import Replicate from 'replicate';
import OpenAI from 'openai';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import CircuitBreaker from 'opossum';
import pino from 'pino';
import { getCache, setCache } from '../lib/cache.js';
import { trackMLUsage } from '../lib/monitoring.js';

const logger = pino({ name: 'MLService' });

// ML Provider Configuration
const providers = {
  huggingface: {
    client: null,
    rateLimiter: new RateLimiterMemory({
      points: 100,
      duration: 60, // per minute
      blockDuration: 60
    }),
    models: {
      classifier: 'facebook/bart-large-mnli',
      sentiment: 'nlptown/bert-base-multilingual-uncased-sentiment',
      embeddings: 'sentence-transformers/all-MiniLM-L6-v2',
      ner: 'dslim/bert-base-NER'
    }
  },
  replicate: {
    client: null,
    rateLimiter: new RateLimiterMemory({
      points: 50,
      duration: 60
    }),
    models: {
      llama2: 'meta/llama-2-7b:latest',
      flan: 'google/flan-t5-xl:latest'
    }
  },
  openai: {
    client: null,
    rateLimiter: new RateLimiterMemory({
      points: 60,
      duration: 60
    }),
    models: {
      embeddings: 'text-embedding-3-small',
      chat: 'gpt-3.5-turbo'
    }
  }
};

export class MLService {
  constructor(config = {}) {
    this.config = {
      huggingfaceToken: config.huggingfaceToken || process.env.HUGGINGFACE_TOKEN,
      replicateToken: config.replicateToken || process.env.REPLICATE_API_TOKEN,
      openaiKey: config.openaiKey || process.env.OPENAI_API_KEY,
      cacheEnabled: config.cacheEnabled !== false,
      cacheTTL: config.cacheTTL || 3600, // 1 hour
      fallbackEnabled: config.fallbackEnabled !== false,
      circuitBreakerOptions: {
        timeout: 30000, // 30 seconds
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        ...config.circuitBreakerOptions
      }
    };

    this.initializeProviders();
    this.setupCircuitBreakers();
  }

  initializeProviders() {
    // Initialize HuggingFace
    if (this.config.huggingfaceToken) {
      providers.huggingface.client = new HfInference(this.config.huggingfaceToken);
      logger.info('HuggingFace provider initialized');
    }

    // Initialize Replicate
    if (this.config.replicateToken) {
      providers.replicate.client = new Replicate({
        auth: this.config.replicateToken
      });
      logger.info('Replicate provider initialized');
    }

    // Initialize OpenAI
    if (this.config.openaiKey) {
      providers.openai.client = new OpenAI({
        apiKey: this.config.openaiKey
      });
      logger.info('OpenAI provider initialized');
    }
  }

  setupCircuitBreakers() {
    // Create circuit breakers for each provider
    this.breakers = {
      huggingface: new CircuitBreaker(
        this.callHuggingFace.bind(this),
        this.config.circuitBreakerOptions
      ),
      replicate: new CircuitBreaker(
        this.callReplicate.bind(this),
        this.config.circuitBreakerOptions
      ),
      openai: new CircuitBreaker(
        this.callOpenAI.bind(this),
        this.config.circuitBreakerOptions
      )
    };

    // Add event listeners
    Object.entries(this.breakers).forEach(([provider, breaker]) => {
      breaker.on('open', () => {
        logger.warn(`Circuit breaker opened for ${provider}`);
      });
      breaker.on('halfOpen', () => {
        logger.info(`Circuit breaker half-open for ${provider}`);
      });
    });
  }

  // Main analysis method
  async analyzeMessage(message, context = {}) {
    const startTime = Date.now();
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Check cache first
      const cacheKey = `analysis:${this.hashMessage(message)}:${JSON.stringify(context)}`;
      const cached = await this.getCached(cacheKey);
      if (cached) {
        logger.debug({ analysisId }, 'Returning cached analysis');
        return cached;
      }

      // Parallel analysis with all available models
      const [
        intentAnalysis,
        sentimentAnalysis,
        entityExtraction,
        embeddings
      ] = await Promise.allSettled([
        this.classifyIntent(message, context),
        this.analyzeSentiment(message),
        this.extractEntities(message),
        this.generateEmbeddings(message)
      ]);

      // Combine results
      const analysis = {
        id: analysisId,
        message,
        timestamp: new Date().toISOString(),
        intent: intentAnalysis.status === 'fulfilled' ? intentAnalysis.value : null,
        sentiment: sentimentAnalysis.status === 'fulfilled' ? sentimentAnalysis.value : null,
        entities: entityExtraction.status === 'fulfilled' ? entityExtraction.value : null,
        embeddings: embeddings.status === 'fulfilled' ? embeddings.value : null,
        processingTime: Date.now() - startTime,
        errors: this.extractErrors([intentAnalysis, sentimentAnalysis, entityExtraction, embeddings])
      };

      // Cache successful analysis
      if (this.config.cacheEnabled && !analysis.errors.length) {
        await this.setCached(cacheKey, analysis);
      }

      // Track usage
      await trackMLUsage({
        service: 'analysis',
        provider: 'multi',
        model: 'composite',
        duration: analysis.processingTime,
        success: !analysis.errors.length
      });

      return analysis;

    } catch (error) {
      logger.error({ error, analysisId }, 'Analysis failed');
      throw error;
    }
  }

  // Intent Classification
  async classifyIntent(message, context = {}) {
    const intents = context.intents || [
      'procrastination',
      'planning_paralysis',
      'perfectionism',
      'pricing_anxiety',
      'decision_fatigue',
      'imposter_syndrome',
      'execution_blocking',
      'success_celebration',
      'progress_update',
      'seeking_validation',
      'technical_question',
      'general_conversation'
    ];

    try {
      // Try HuggingFace first
      if (providers.huggingface.client) {
        await providers.huggingface.rateLimiter.consume('classify');
        
        const result = await this.breakers.huggingface.fire(
          'zeroShotClassification',
          {
            model: providers.huggingface.models.classifier,
            inputs: message,
            parameters: {
              candidate_labels: intents,
              multi_label: true
            }
          }
        );

        return {
          provider: 'huggingface',
          primary: result.labels[0],
          scores: result.labels.reduce((acc, label, i) => {
            acc[label] = result.scores[i];
            return acc;
          }, {}),
          confidence: result.scores[0]
        };
      }

      // Fallback to Replicate
      if (providers.replicate.client && this.config.fallbackEnabled) {
        await providers.replicate.rateLimiter.consume('classify');
        
        const prompt = `Classify this message into one of these intents: ${intents.join(', ')}\n\nMessage: "${message}"\n\nIntent:`;
        
        const result = await this.breakers.replicate.fire(
          'run',
          providers.replicate.models.flan,
          { prompt }
        );

        const intent = result.trim().toLowerCase();
        return {
          provider: 'replicate',
          primary: intent,
          scores: { [intent]: 0.8 }, // Estimated confidence
          confidence: 0.8
        };
      }

      throw new Error('No ML providers available for intent classification');

    } catch (error) {
      logger.error({ error, message }, 'Intent classification failed');
      
      // Basic fallback
      if (this.config.fallbackEnabled) {
        return this.basicIntentClassification(message, intents);
      }
      
      throw error;
    }
  }

  // Sentiment Analysis
  async analyzeSentiment(message) {
    try {
      if (providers.huggingface.client) {
        await providers.huggingface.rateLimiter.consume('sentiment');
        
        const result = await this.breakers.huggingface.fire(
          'textClassification',
          {
            model: providers.huggingface.models.sentiment,
            inputs: message
          }
        );

        // Convert 1-5 star rating to normalized sentiment
        const starRating = parseInt(result[0].label.split(' ')[0]);
        const sentiment = starRating <= 2 ? 'negative' : starRating >= 4 ? 'positive' : 'neutral';
        const score = (starRating - 1) / 4; // Normalize to 0-1

        return {
          provider: 'huggingface',
          sentiment,
          score,
          raw: result[0]
        };
      }

      // Fallback to OpenAI
      if (providers.openai.client && this.config.fallbackEnabled) {
        const response = await this.breakers.openai.fire(
          'chat.completions.create',
          {
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'system',
              content: 'Analyze the sentiment of the message. Respond with only: positive, negative, or neutral.'
            }, {
              role: 'user',
              content: message
            }],
            temperature: 0,
            max_tokens: 10
          }
        );

        const sentiment = response.choices[0].message.content.trim().toLowerCase();
        const scoreMap = { positive: 0.8, neutral: 0.5, negative: 0.2 };

        return {
          provider: 'openai',
          sentiment,
          score: scoreMap[sentiment] || 0.5
        };
      }

      throw new Error('No ML providers available for sentiment analysis');

    } catch (error) {
      logger.error({ error, message }, 'Sentiment analysis failed');
      
      if (this.config.fallbackEnabled) {
        return this.basicSentimentAnalysis(message);
      }
      
      throw error;
    }
  }

  // Entity Extraction
  async extractEntities(message) {
    try {
      if (providers.huggingface.client) {
        await providers.huggingface.rateLimiter.consume('ner');
        
        const result = await this.breakers.huggingface.fire(
          'tokenClassification',
          {
            model: providers.huggingface.models.ner,
            inputs: message
          }
        );

        // Group entities by type
        const entities = result.reduce((acc, entity) => {
          const type = entity.entity_group || entity.entity;
          if (!acc[type]) acc[type] = [];
          acc[type].push({
            text: entity.word,
            score: entity.score,
            start: entity.start,
            end: entity.end
          });
          return acc;
        }, {});

        return {
          provider: 'huggingface',
          entities,
          raw: result
        };
      }

      // Basic entity extraction fallback
      if (this.config.fallbackEnabled) {
        return this.basicEntityExtraction(message);
      }

      throw new Error('No ML providers available for entity extraction');

    } catch (error) {
      logger.error({ error, message }, 'Entity extraction failed');
      
      if (this.config.fallbackEnabled) {
        return this.basicEntityExtraction(message);
      }
      
      throw error;
    }
  }

  // Embeddings Generation
  async generateEmbeddings(message) {
    try {
      // Try OpenAI first (best quality)
      if (providers.openai.client) {
        await providers.openai.rateLimiter.consume('embeddings');
        
        const response = await this.breakers.openai.fire(
          'embeddings.create',
          {
            model: providers.openai.models.embeddings,
            input: message
          }
        );

        return {
          provider: 'openai',
          embeddings: response.data[0].embedding,
          dimensions: response.data[0].embedding.length,
          model: providers.openai.models.embeddings
        };
      }

      // Fallback to HuggingFace
      if (providers.huggingface.client) {
        await providers.huggingface.rateLimiter.consume('embeddings');
        
        const result = await this.breakers.huggingface.fire(
          'featureExtraction',
          {
            model: providers.huggingface.models.embeddings,
            inputs: message
          }
        );

        return {
          provider: 'huggingface',
          embeddings: result,
          dimensions: result.length,
          model: providers.huggingface.models.embeddings
        };
      }

      throw new Error('No ML providers available for embeddings');

    } catch (error) {
      logger.error({ error, message }, 'Embeddings generation failed');
      
      // No good fallback for embeddings
      return null;
    }
  }

  // Generate enhanced response
  async generateEnhancement(originalResponse, analysis, context = {}) {
    const { intent, sentiment, confidence } = analysis;
    
    // Skip enhancement for low confidence
    if (confidence < 0.7) {
      return {
        enhanced: false,
        response: originalResponse,
        reason: 'Low confidence'
      };
    }

    try {
      // Build enhancement prompt
      const prompt = this.buildEnhancementPrompt(originalResponse, analysis, context);

      // Try Replicate Llama 2
      if (providers.replicate.client) {
        await providers.replicate.rateLimiter.consume('generate');
        
        const result = await this.breakers.replicate.fire(
          'run',
          providers.replicate.models.llama2,
          {
            prompt,
            max_new_tokens: 150,
            temperature: 0.7,
            top_p: 0.9
          }
        );

        return {
          enhanced: true,
          response: this.formatEnhancedResponse(originalResponse, result),
          provider: 'replicate',
          model: 'llama2'
        };
      }

      // Fallback to OpenAI
      if (providers.openai.client) {
        await providers.openai.rateLimiter.consume('chat');
        
        const response = await this.breakers.openai.fire(
          'chat.completions.create',
          {
            model: providers.openai.models.chat,
            messages: [{
              role: 'system',
              content: 'You are CELESTE7, a direct behavioral coach. Enhance responses with brutal honesty.'
            }, {
              role: 'user',
              content: prompt
            }],
            temperature: 0.7,
            max_tokens: 150
          }
        );

        const enhancement = response.choices[0].message.content;

        return {
          enhanced: true,
          response: this.formatEnhancedResponse(originalResponse, enhancement),
          provider: 'openai',
          model: providers.openai.models.chat
        };
      }

      // No enhancement available
      return {
        enhanced: false,
        response: originalResponse,
        reason: 'No providers available'
      };

    } catch (error) {
      logger.error({ error }, 'Enhancement generation failed');
      
      return {
        enhanced: false,
        response: originalResponse,
        reason: error.message
      };
    }
  }

  // Helper methods
  async callHuggingFace(method, ...args) {
    return await providers.huggingface.client[method](...args);
  }

  async callReplicate(method, ...args) {
    return await providers.replicate.client[method](...args);
  }

  async callOpenAI(method, ...args) {
    const [service, func] = method.split('.');
    return await providers.openai.client[service][func](...args);
  }

  hashMessage(message) {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  async getCached(key) {
    if (!this.config.cacheEnabled) return null;
    return await getCache(key);
  }

  async setCached(key, value) {
    if (!this.config.cacheEnabled) return;
    await setCache(key, value, this.config.cacheTTL);
  }

  extractErrors(results) {
    return results
      .filter(r => r.status === 'rejected')
      .map(r => r.reason?.message || 'Unknown error');
  }

  // Basic fallback methods
  basicIntentClassification(message, intents) {
    const patterns = {
      procrastination: /\b(later|tomorrow|eventually|busy|overwhelmed)\b/i,
      planning_paralysis: /\b(plan|strategy|roadmap|analyze|research)\b/i,
      perfectionism: /\b(perfect|ready|good enough|polish|quality)\b/i,
      pricing_anxiety: /\b(price|charge|cost|worth|value|expensive|cheap)\b/i,
      decision_fatigue: /\b(decide|choose|option|which|best|compare)\b/i,
      imposter_syndrome: /\b(qualified|deserve|fake|fraud|competent)\b/i,
      execution_blocking: /\b(stuck|blocked|can't|unable|how to)\b/i,
      success_celebration: /\b(achieved|succeeded|win|milestone|celebrate)\b/i,
      progress_update: /\b(update|progress|working on|completed|finished)\b/i
    };

    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return {
          provider: 'fallback',
          primary: intent,
          scores: { [intent]: 0.6 },
          confidence: 0.6
        };
      }
    }

    return {
      provider: 'fallback',
      primary: 'general_conversation',
      scores: { general_conversation: 0.5 },
      confidence: 0.5
    };
  }

  basicSentimentAnalysis(message) {
    const positive = /\b(good|great|excellent|love|happy|excited|achieved|success)\b/i;
    const negative = /\b(bad|terrible|hate|frustrated|failed|stuck|problem|issue)\b/i;
    
    const hasPositive = positive.test(message);
    const hasNegative = negative.test(message);
    
    if (hasPositive && !hasNegative) {
      return { provider: 'fallback', sentiment: 'positive', score: 0.7 };
    } else if (hasNegative && !hasPositive) {
      return { provider: 'fallback', sentiment: 'negative', score: 0.3 };
    }
    
    return { provider: 'fallback', sentiment: 'neutral', score: 0.5 };
  }

  basicEntityExtraction(message) {
    const entities = {};
    
    // Extract money amounts
    const moneyPattern = /\$[\d,]+\.?\d*/g;
    const money = message.match(moneyPattern);
    if (money) {
      entities.MONEY = money.map(m => ({ text: m, score: 0.9 }));
    }
    
    // Extract percentages
    const percentPattern = /\d+%/g;
    const percents = message.match(percentPattern);
    if (percents) {
      entities.PERCENT = percents.map(p => ({ text: p, score: 0.9 }));
    }
    
    // Extract dates/times
    const timePattern = /\b(today|tomorrow|yesterday|next week|last week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi;
    const times = message.match(timePattern);
    if (times) {
      entities.DATE = times.map(t => ({ text: t, score: 0.8 }));
    }
    
    return {
      provider: 'fallback',
      entities
    };
  }

  buildEnhancementPrompt(originalResponse, analysis, context) {
    const { intent, sentiment, confidence } = analysis;
    const { userId, businessType, energy } = context;

    return `Original AI response: "${originalResponse}"

User context:
- Detected pattern: ${intent.primary} (confidence: ${confidence})
- Sentiment: ${sentiment.sentiment}
- Business type: ${businessType || 'unknown'}
- Energy level: ${energy || 'unknown'}

Enhance this response with a behavioral insight that:
1. Addresses the ${intent.primary} pattern directly
2. Is brutally honest but constructive
3. Ends with a specific action step
4. Is under 50 words

Enhanced response:`;
  }

  formatEnhancedResponse(original, enhancement) {
    // Clean up enhancement
    const cleaned = enhancement
      .trim()
      .replace(/^Enhanced response:?\s*/i, '')
      .replace(/^"/, '')
      .replace(/"$/, '');

    // Combine original and enhancement
    return `${original}\n\n💡 ${cleaned}`;
  }
}

// Export singleton instance
export default new MLService();

// Initialize services function
export async function initializeServices(config = {}) {
  const { queues, logger } = config;
  
  // Initialize ML service
  const mlService = new MLService();
  
  // Set up simple queue processors for Vercel compatibility
  if (queues) {
    // Analysis queue processor - simplified for Vercel
    queues.analysis.process = async (data) => {
      const { message, context } = data;
      return await mlService.analyzeMessage(message, context);
    };
    
    // Learning queue processor - simplified for Vercel
    queues.learning.process = async (data) => {
      const { userId, pattern, feedback } = data;
      // Process learning data
      logger.info({ userId, pattern }, 'Processing learning data');
      return { success: true };
    };
    
    // Notifications queue processor - simplified for Vercel
    queues.notifications.process = async (data) => {
      const { userId, message, type } = data;
      // Process notifications
      logger.info({ userId, type }, 'Processing notification');
      return { success: true };
    };
  }
  
  logger.info('Services initialized successfully');
  return { mlService };
}