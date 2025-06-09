#!/usr/bin/env node

const interventionServer = require('./src/interventionServer');

// Start the intervention server
interventionServer.start()
  .then(() => {
    console.log('🎯 Celeste7 Intervention Server Started Successfully!');
    console.log('📡 Ready to receive interventions from n8n');
    console.log('🔗 POST interventions to: http://localhost:3001/api/interventions');
    console.log('💡 Health check: http://localhost:3001/health');
  })
  .catch((error) => {
    console.error('❌ Failed to start intervention server:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down intervention server...');
  interventionServer.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down intervention server...');
  interventionServer.stop();
  process.exit(0);
});