const express = require('express');
const cors = require('cors');

class InterventionServer {
  constructor() {
    this.app = express();
    this.port = 3001; // Different port from main React app
    this.interventionCallbacks = new Set();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors({
      origin: ['http://localhost:3000', 'https://chatgpt-replica.preview.emergentagent.com'],
      methods: ['POST', 'GET', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    this.app.use(express.json({ limit: '10mb' }));
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Main intervention delivery endpoint
    this.app.post('/api/interventions', (req, res) => {
      try {
        console.log('Received intervention:', req.body);
        
        const intervention = {
          id: req.body.intervention_id || `intervention_${Date.now()}`,
          message: req.body.message,
          priority: req.body.priority || req.body.final_priority,
          delivery_timestamp: req.body.delivery_timestamp || new Date().toISOString(),
          created_at: req.body.created_at,
          pattern_confidence: req.body.personalization_data?.pattern_confidence || req.body.pattern_confidence,
          expected_impact: req.body.expected_impact,
          breakthrough_potential: req.body.breakthrough_potential,
          status: req.body.status || 'received',
          rawData: req.body
        };

        // Notify all registered callbacks (React components)
        this.interventionCallbacks.forEach(callback => {
          try {
            callback(intervention);
          } catch (error) {
            console.error('Error in intervention callback:', error);
          }
        });

        res.json({ 
          success: true, 
          received: true,
          intervention_id: intervention.id,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Intervention processing error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Endpoint to get pending interventions (if needed)
    this.app.get('/api/interventions/pending', (req, res) => {
      res.json({ 
        pending: [], // Could implement pending intervention storage if needed
        timestamp: new Date().toISOString()
      });
    });
  }

  // Method for React components to register for intervention notifications
  registerCallback(callback) {
    this.interventionCallbacks.add(callback);
    return () => this.interventionCallbacks.delete(callback);
  }

  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          console.log(`🎯 Intervention server running on port ${this.port}`);
          console.log(`📡 Ready to receive interventions at: http://localhost:${this.port}/api/interventions`);
          resolve(this.server);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 Intervention server stopped');
    }
  }
}

// Export singleton instance
const interventionServer = new InterventionServer();

// Auto-start the server
if (typeof window === 'undefined') {
  // Only start if running in Node.js environment
  interventionServer.start().catch(console.error);
}

module.exports = interventionServer;