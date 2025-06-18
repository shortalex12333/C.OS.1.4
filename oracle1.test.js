import request from 'supertest';
import app from '../../src/index.js';

describe('Oracle API Integration Tests', () => {
  describe('POST /api/analyze', () => {
    it('should detect procrastination pattern', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          userId: 'test_user_123',
          message: "I'll work on this tomorrow when I have more time",
          context: {
            businessType: 'solopreneur',
            energyLevel: 'low'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.patterns[0].type).toBe('procrastination');
      expect(response.body.data.patterns[0].confidence).toBeGreaterThan(0.7);
    });

    it('should handle multiple patterns', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          userId: 'test_user_456',
          message: "I need to plan the perfect strategy before I can start pricing my services",
          context: {}
        });

      expect(response.status).toBe(200);
      
      const patterns = response.body.data.patterns;
      const patternTypes = patterns.map(p => p.type);
      
      expect(patternTypes).toContain('planning_paralysis');
      expect(patternTypes).toContain('perfectionism');
      expect(patternTypes).toContain('revenue_psychology');
    });
  });

  describe('POST /api/enhance', () => {
    it('should enhance response with behavioral insight', async () => {
      const response = await request(app)
        .post('/api/enhance')
        .send({
          userId: 'test_user_789',
          message: "I'm thinking about raising my prices eventually",
          aiResponse: "That's a good idea. Consider your value proposition.",
          context: {
            businessType: 'agency',
            trustLevel: 8
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.data.enhanced).toBe(true);
      expect(response.body.data.response).toContain('💡');
      expect(response.body.data.pattern.type).toBe('revenue_psychology');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(101).fill(null).map(() => 
        request(app)
          .post('/api/analyze')
          .send({
            userId: 'rate_limit_test',
            message: 'test'
          })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});