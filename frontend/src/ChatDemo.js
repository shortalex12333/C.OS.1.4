import React, { useState } from 'react';
import ChatComponent from './components/Chat';

// Demo component for testing the new chat interface
const ChatDemo = () => {
  const [selectedDemo, setSelectedDemo] = useState('normal');
  
  // Mock user for testing
  const mockUser = {
    id: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@celesteos.ai'
  };

  // Demo configurations
  const demoConfigs = {
    normal: {
      apiEndpoint: 'https://api.celeste7.ai/webhook/text-chat-fast',
      title: 'Normal Chat',
      description: 'Full functionality with real API'
    },
    mock: {
      apiEndpoint: '/api/mock-chat', // Will fail gracefully for demo
      title: 'Mock API (Error Demo)',
      description: 'Shows error handling when API fails'
    },
    performance: {
      apiEndpoint: 'https://api.celeste7.ai/webhook/text-chat-fast',
      title: 'Performance Test',
      description: 'Pre-loaded with messages for performance testing'
    }
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* Demo Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            CelesteOS Chat Component Demo
          </h1>
          
          <div className="flex gap-4 mb-4">
            {Object.entries(demoConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedDemo(key)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedDemo === key
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {config.title}
              </button>
            ))}
          </div>
          
          <p className="text-sm text-gray-600">
            {demoConfigs[selectedDemo].description}
          </p>
        </div>
      </div>

      {/* Chat Component */}
      <div className="h-[calc(100vh-140px)]">
        <ChatComponent
          key={selectedDemo} // Force re-mount when switching demos
          user={mockUser}
          apiEndpoint={demoConfigs[selectedDemo].apiEndpoint}
          maxMessages={selectedDemo === 'performance' ? 50 : 200}
        />
      </div>
    </div>
  );
};

// Testing utilities
const TestingPanel = () => {
  const [testResults, setTestResults] = useState({});
  
  const runTest = (testName, testFn) => {
    try {
      const result = testFn();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message }
      }));
    }
  };

  const tests = [
    {
      name: 'localStorage',
      fn: () => {
        localStorage.setItem('test', 'value');
        const value = localStorage.getItem('test');
        localStorage.removeItem('test');
        return value === 'value';
      }
    },
    {
      name: 'sessionStorage',
      fn: () => {
        sessionStorage.setItem('test', 'value');
        const value = sessionStorage.getItem('test');
        sessionStorage.removeItem('test');
        return value === 'value';
      }
    },
    {
      name: 'fetch API',
      fn: () => typeof fetch === 'function'
    },
    {
      name: 'AbortController',
      fn: () => typeof AbortController === 'function'
    },
    {
      name: 'ResizeObserver',
      fn: () => typeof ResizeObserver === 'function'
    }
  ];

  return (
    <div className="bg-white border-l border-gray-200 p-4 w-64">
      <h3 className="font-semibold text-gray-900 mb-4">Browser Support Tests</h3>
      
      <div className="space-y-2">
        {tests.map(test => (
          <div key={test.name} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{test.name}</span>
            <button
              onClick={() => runTest(test.name, test.fn)}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
            >
              Test
            </button>
            {testResults[test.name] && (
              <span className={`text-xs ${
                testResults[test.name].success ? 'text-green-600' : 'text-red-600'
              }`}>
                {testResults[test.name].success ? '✓' : '✗'}
              </span>
            )}
          </div>
        ))}
      </div>
      
      <button
        onClick={() => tests.forEach(test => runTest(test.name, test.fn))}
        className="w-full mt-4 bg-gray-800 text-white px-3 py-2 rounded text-sm"
      >
        Run All Tests
      </button>
    </div>
  );
};

// Export both components
export default ChatDemo;
export { TestingPanel };