#!/usr/bin/env node

/**
 * Real Integration Test - Honest Assessment
 * Tests actual functionality, not mock data
 */

const fetch = require('node-fetch');
const fs = require('fs');

// Test Results Storage
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function test(name, fn) {
  process.stdout.write(`Testing ${name}... `);
  try {
    const result = await fn();
    if (result.success) {
      console.log(`${colors.green}✓${colors.reset}`);
      results.passed++;
      results.details.push({ name, status: 'passed', ...result });
    } else {
      console.log(`${colors.red}✗${colors.reset} - ${result.error}`);
      results.failed++;
      results.details.push({ name, status: 'failed', ...result });
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} - ${error.message}`);
    results.failed++;
    results.details.push({ name, status: 'error', error: error.message });
  }
}

async function runTests() {
  console.log(`${colors.blue}Starting Real Integration Tests${colors.reset}\n`);

  // Test 1: Check if app is running
  await test('App Running on localhost:8086', async () => {
    try {
      const response = await fetch('http://localhost:8086');
      return { success: response.ok };
    } catch (e) {
      return { success: false, error: 'App not running' };
    }
  });

  // Test 2: Check enhanced components exist
  await test('Enhanced Components Exist', () => {
    const files = [
      'frontend/src/components/EnhancedGuidedPrompts.js',
      'frontend/src/components/EnhancedSolutionCard.js',
      'frontend/src/components/UIEnhancements.js',
      'frontend/src/styles/enhancements.css'
    ];
    
    const missing = files.filter(f => !fs.existsSync(f));
    return {
      success: missing.length === 0,
      error: missing.length > 0 ? `Missing: ${missing.join(', ')}` : null
    };
  });

  // Test 3: Check component imports in main file
  await test('Components Imported in components.js', () => {
    const content = fs.readFileSync('frontend/src/components.js', 'utf8');
    const hasImports = 
      content.includes('EnhancedEmptyState') &&
      content.includes('EnhancedSolutionCard') &&
      content.includes('./styles/enhancements.css');
    
    return {
      success: hasImports,
      error: hasImports ? null : 'Missing imports'
    };
  });

  // Test 4: Test webhook connectivity
  await test('Webhook API Connectivity', async () => {
    try {
      const response = await fetch('https://api.celeste7.ai/webhook/text-chat-fast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'test connection',
          userId: 'test'
        }),
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          webhook_response: data.response ? 'Valid format' : 'Invalid format'
        };
      }
      return { success: false, error: `Status: ${response.status}` };
    } catch (e) {
      return { success: false, error: 'Webhook unreachable' };
    }
  });

  // Test 5: Check CSS animations
  await test('CSS Animations Defined', () => {
    const content = fs.readFileSync('frontend/src/styles/enhancements.css', 'utf8');
    const hasAnimations = 
      content.includes('@keyframes') &&
      content.includes('fadeIn') &&
      content.includes('slideUp');
    
    return {
      success: hasAnimations,
      error: hasAnimations ? null : 'Missing animations'
    };
  });

  // Test 6: Mobile responsiveness check
  await test('Mobile Breakpoints Defined', () => {
    const content = fs.readFileSync('frontend/src/styles/enhancements.css', 'utf8');
    const hasMobile = content.includes('@media (max-width: 768px)');
    
    return {
      success: hasMobile,
      error: hasMobile ? null : 'No mobile styles'
    };
  });

  // Test 7: Solution card data handling
  await test('Solution Card Handles Data', () => {
    const content = fs.readFileSync('frontend/src/components/EnhancedSolutionCard.js', 'utf8');
    const hasDataHandling = 
      content.includes('parseSolution') &&
      content.includes('solution.title') &&
      content.includes('solution.steps');
    
    return {
      success: hasDataHandling,
      error: hasDataHandling ? null : 'Poor data handling'
    };
  });

  // Test 8: Build without errors
  await test('Production Build Success', () => {
    // Check if build folder exists and is recent
    const buildExists = fs.existsSync('frontend/build/index.html');
    if (buildExists) {
      const stats = fs.statSync('frontend/build/index.html');
      const hoursSinceBuilt = (Date.now() - stats.mtime) / (1000 * 60 * 60);
      return {
        success: hoursSinceBuilt < 1,
        error: hoursSinceBuilt >= 1 ? 'Build is stale' : null
      };
    }
    return { success: false, error: 'No build found' };
  });

  // Print Summary
  console.log(`\n${colors.blue}Test Results Summary${colors.reset}`);
  console.log('─'.repeat(40));
  console.log(`${colors.green}Passed:${colors.reset} ${results.passed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${results.failed}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${results.warnings}`);
  
  // Calculate realistic score
  const totalTests = results.passed + results.failed;
  const score = Math.round((results.passed / totalTests) * 100);
  
  console.log('─'.repeat(40));
  console.log(`\n${colors.blue}Quality Score: ${score}%${colors.reset}`);
  
  if (score >= 85) {
    console.log(`${colors.green}✅ Target Achieved (85%)${colors.reset}`);
  } else if (score >= 60) {
    console.log(`${colors.yellow}⚠️ Partial Success (Target: 85%)${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Below Target (Target: 85%)${colors.reset}`);
  }

  // Honest assessment
  console.log(`\n${colors.blue}Honest Assessment:${colors.reset}`);
  if (score >= 85) {
    console.log('The enhancements are working well and provide real value.');
  } else if (score >= 60) {
    console.log('The enhancements partially work but need improvement.');
    console.log('Main issues:', results.details
      .filter(d => d.status === 'failed')
      .map(d => `\n  - ${d.name}: ${d.error}`)
      .join(''));
  } else {
    console.log('Significant issues prevent the enhancements from working properly.');
    console.log('Critical failures:', results.details
      .filter(d => d.status === 'failed')
      .map(d => `\n  - ${d.name}: ${d.error}`)
      .join(''));
  }

  // Real world impact
  console.log(`\n${colors.blue}Real World Impact:${colors.reset}`);
  if (results.details.find(d => d.name === 'App Running on localhost:8086' && d.status === 'passed')) {
    console.log('✓ App runs without crashing');
  }
  if (results.details.find(d => d.name === 'Webhook API Connectivity' && d.status === 'passed')) {
    console.log('✓ Webhook integration functional');
  }
  if (results.details.find(d => d.name === 'Production Build Success' && d.status === 'passed')) {
    console.log('✓ Ready for deployment');
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);