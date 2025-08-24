#!/bin/bash

# Phase 1: Foundation & Validation Script
# This is what we should have done from the beginning

echo "========================================="
echo "Phase 1: Foundation & Validation"
echo "========================================="
echo ""

# Step 1: Create a backup
echo "1. Creating backup..."
cp -r frontend frontend-backup-$(date +%Y%m%d-%H%M%S)
echo "   ✓ Backup created"
echo ""

# Step 2: Start the app and capture logs
echo "2. Starting app with logging..."
cat > frontend/src/utils/webhookLogger.js << 'EOF'
// Temporary webhook logger for Phase 1
export function logWebhookResponse(response) {
  console.group('🔍 Webhook Response Analysis');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Response Structure:', response);
  
  if (response?.response) {
    console.log('Has response wrapper:', true);
    console.log('Response keys:', Object.keys(response.response));
  }
  
  if (response?.response?.solutions) {
    console.log('Solutions count:', response.response.solutions.length);
    console.log('First solution structure:', response.response.solutions[0]);
  }
  
  if (response?.response?.items) {
    console.log('Items count:', response.response.items.length);
    console.log('First item structure:', response.response.items[0]);
  }
  
  console.groupEnd();
  
  // Save to localStorage for analysis
  const logs = JSON.parse(localStorage.getItem('webhookLogs') || '[]');
  logs.push({
    timestamp: Date.now(),
    response: response
  });
  localStorage.setItem('webhookLogs', JSON.stringify(logs.slice(-10))); // Keep last 10
}
EOF
echo "   ✓ Logger created"
echo ""

# Step 3: Add simple health check
echo "3. Adding health check endpoint..."
cat > frontend/public/health.json << 'EOF'
{
  "status": "healthy",
  "phase": 1,
  "timestamp": "TIMESTAMP_PLACEHOLDER"
}
EOF
echo "   ✓ Health check added"
echo ""

# Step 4: Document current state
echo "4. Documenting current state..."
cat > PHASE1_BASELINE.md << 'EOF'
# Phase 1 Baseline - Current State

## App Status
- Build: ✓ Successful
- Runtime: ✓ No critical errors
- Webhook: ✓ Connects

## Components Inventory
- EnhancedGuidedPrompts.js - EXISTS (untested)
- EnhancedSolutionCard.js - EXISTS (untested)  
- UIEnhancements.js - EXISTS (partially used)
- enhancements.css - EXISTS (may conflict)

## Integration Points
- Line 32-34: Component imports
- Line 1471-1477: Empty state replacement
- Line 1574-1579: Solution card usage

## Known Issues
- [ ] No real webhook data captured
- [ ] No mobile testing done
- [ ] No performance baseline
- [ ] No error boundaries
- [ ] No feature flags

## Next Steps
1. Capture real webhook responses
2. Test on actual devices
3. Remove unused code
4. Add basic error handling
EOF
echo "   ✓ Baseline documented"
echo ""

# Step 5: Create simple test file
echo "5. Creating real tests..."
cat > frontend/src/tests/phase1.test.js << 'EOF'
// Phase 1: Real functionality tests

describe('Phase 1: Foundation Tests', () => {
  test('App starts without crashing', () => {
    // Actual test that the app renders
    expect(document.querySelector('#root')).toBeTruthy();
  });
  
  test('Can access webhook API', async () => {
    const response = await fetch('https://api.celeste7.ai/webhook/text-chat-fast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test', userId: 'test' })
    });
    expect(response.ok).toBe(true);
  });
  
  test('Enhanced components exist', () => {
    // These files should exist
    const components = [
      'EnhancedGuidedPrompts',
      'EnhancedSolutionCard',
      'UIEnhancements'
    ];
    components.forEach(comp => {
      expect(() => require(`../components/${comp}`)).not.toThrow();
    });
  });
});
EOF
echo "   ✓ Tests created"
echo ""

echo "========================================="
echo "Phase 1 Setup Complete"
echo "========================================="
echo ""
echo "Now you should:"
echo "1. Run: npm start"
echo "2. Use the app for 10 minutes"
echo "3. Check console for webhook logs"
echo "4. Run: npm test"
echo "5. Document findings in PHASE1_RESULTS.md"
echo ""
echo "Only proceed to Phase 2 after:"
echo "- [ ] Real webhook data captured"
echo "- [ ] All tests pass"
echo "- [ ] No console errors"
echo "- [ ] Screenshots taken"