import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Copy, Download } from 'lucide-react';

// Webhook Debug Component - Task 1
const WebhookDebugger = () => {
  const [logs, setLogs] = useState([]);
  const [isIntercepting, setIsIntercepting] = useState(true);
  const [healthStatus, setHealthStatus] = useState({});
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Store original fetch function
  const originalFetch = window.fetch;

  // Debug fetch wrapper - Task 5
  const debugFetch = useCallback(async (url, options) => {
    const timestamp = new Date().toISOString();
    const logId = Date.now() + Math.random();
    
    // Log the request
    const requestLog = {
      id: logId,
      timestamp,
      type: 'request',
      url,
      method: options?.method || 'GET',
      headers: options?.headers || {},
      body: options?.body ? JSON.parse(options.body) : null,
      status: 'pending'
    };
    
    console.log('🔵 REQUEST:', requestLog);
    setLogs(prev => [...prev, requestLog]);

    try {
      const response = await originalFetch(url, options);
      const responseData = await response.json().catch(() => response.text());
      
      const responseLog = {
        id: logId + 0.1,
        timestamp: new Date().toISOString(),
        type: 'response',
        url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        success: response.ok
      };
      
      console.log('🟢 RESPONSE:', responseLog);
      setLogs(prev => [...prev, responseLog]);
      
      return response;
    } catch (error) {
      const errorLog = {
        id: logId + 0.2,
        timestamp: new Date().toISOString(),
        type: 'error',
        url,
        error: error.message,
        stack: error.stack
      };
      
      console.log('🔴 ERROR:', errorLog);
      setLogs(prev => [...prev, errorLog]);
      
      throw error;
    }
  }, [originalFetch]);

  // Intercept fetch calls
  useEffect(() => {
    if (isIntercepting) {
      window.fetch = debugFetch;
    } else {
      window.fetch = originalFetch;
    }

    return () => {
      window.fetch = originalFetch;
    };
  }, [isIntercepting, debugFetch, originalFetch]);

  // Webhook Health Check - Task 3
  const testAllWebhooks = useCallback(async () => {
    setIsRunningTests(true);
    setTestResults({});
    
    const webhooks = [
      { 
        name: 'Auth Login',
        url: 'https://api.celeste7.ai/webhook/auth/login', 
        body: { email: 'test@test.com', password: 'test123' } 
      },
      { 
        name: 'Auth Signup',
        url: 'https://api.celeste7.ai/webhook/auth-signup', 
        body: { email: 'test@test.com', password: 'test123', displayName: 'Test User' } 
      },
      { 
        name: 'Auth Logout',
        url: 'https://api.celeste7.ai/webhook/auth/logout', 
        body: { token: 'test-token' } 
      },
      { 
        name: 'Auth Verify Token',
        url: 'https://api.celeste7.ai/webhook/auth/verify-token', 
        body: { token: 'test-token' } 
      },
      { 
        name: 'Text Chat Fast',
        url: 'https://api.celeste7.ai/webhook/text-chat-fast', 
        body: { message: 'test', userId: 'test', sessionId: 'test-session' } 
      },
      { 
        name: 'Get Data',
        url: 'https://api.celeste7.ai/webhook/get-data', 
        body: { userId: 'test', table: 'user_personalization' } 
      },
      { 
        name: 'Fetch Chat',
        url: 'https://api.celeste7.ai/webhook/fetch-chat', 
        body: { chatId: 'test-chat', userId: 'test' } 
      },
      { 
        name: 'Fetch Conversations',
        url: 'https://api.celeste7.ai/webhook/fetch-conversations', 
        body: { userId: 'test' } 
      }
    ];

    const results = {};
    
    for (const webhook of webhooks) {
      try {
        const startTime = Date.now();
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify(webhook.body)
        });
        
        const responseTime = Date.now() - startTime;
        const data = await response.json().catch(() => response.text());
        
        results[webhook.name] = {
          status: response.status,
          statusText: response.statusText,
          responseTime: `${responseTime}ms`,
          success: response.ok,
          data: data,
          error: null
        };
      } catch (error) {
        results[webhook.name] = {
          status: 'FAILED',
          statusText: error.message,
          responseTime: 'N/A',
          success: false,
          data: null,
          error: error.message
        };
      }
    }
    
    setTestResults(results);
    setIsRunningTests(false);
  }, []);

  // Copy to clipboard
  const copyLogs = () => {
    const logText = JSON.stringify(logs, null, 2);
    navigator.clipboard.writeText(logText);
  };

  // Download logs
  const downloadLogs = () => {
    const logText = JSON.stringify(logs, null, 2);
    const blob = new Blob([logText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhook-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Get status color
  const getStatusColor = (success, status) => {
    if (success) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Webhook Debugger</h1>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setIsIntercepting(!isIntercepting)}
              className={`px-4 py-2 rounded-md font-medium ${
                isIntercepting 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isIntercepting ? 'Intercepting ON' : 'Intercepting OFF'}
            </button>
            
            <button
              onClick={testAllWebhooks}
              disabled={isRunningTests}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isRunningTests ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              Test All Webhooks
            </button>
            
            <button
              onClick={copyLogs}
              className="px-4 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 flex items-center gap-2"
            >
              <Copy size={16} />
              Copy Logs
            </button>
            
            <button
              onClick={downloadLogs}
              className="px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 flex items-center gap-2"
            >
              <Download size={16} />
              Download Logs
            </button>
            
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
            >
              Clear Logs
            </button>
          </div>

          {/* Current Request Format Documentation - Task 4 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current Request Formats:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium">Auth Login:</h4>
                <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
{`URL: /webhook/auth/login
Body: {
  email: string,
  password: string
}
Headers: {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium">Text Chat:</h4>
                <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
{`URL: /webhook/text-chat-fast
Body: {
  userId: string,
  userName: string,
  message: string,
  chatId: string,
  sessionId: string,
  timestamp: string
}`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium">Get Data (Cache):</h4>
                <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
{`URL: /webhook/get-data
Body: {
  userId: string,
  table: string,
  useCache: boolean
}
Note: Called 78+ times!`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium">Auth Signup:</h4>
                <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
{`URL: /webhook/auth-signup
Body: {
  displayName: string,
  email: string,
  password: string
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Webhook Health Check Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(testResults).map(([name, result]) => (
                <div key={name} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {result.success ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <XCircle size={16} className="text-red-600" />
                    )}
                    <h3 className="font-medium">{name}</h3>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className={`font-medium ${getStatusColor(result.success, result.status)}`}>
                      Status: {result.status} {result.statusText}
                    </div>
                    <div>Response Time: {result.responseTime}</div>
                    {result.error && (
                      <div className="text-red-600 text-xs">Error: {result.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Logs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Live Webhook Logs ({logs.length} entries)
          </h2>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No webhook calls captured yet. Make sure intercepting is ON and try using the app.
              </div>
            ) : (
              logs.slice().reverse().map((log) => (
                <div 
                  key={log.id} 
                  className={`p-3 rounded-lg border-l-4 ${
                    log.type === 'request' 
                      ? 'border-blue-500 bg-blue-50'
                      : log.type === 'response'
                      ? log.success 
                        ? 'border-green-500 bg-green-50'
                        : 'border-yellow-500 bg-yellow-50'
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                    {log.type === 'response' && (
                      <span className={`text-xs font-medium ${getStatusColor(log.success, log.status)}`}>
                        {log.status} {log.statusText}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium">{log.method} {log.url}</div>
                    
                    {log.body && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-gray-600">Request Body</summary>
                        <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.body, null, 2)}
                        </pre>
                      </details>
                    )}
                    
                    {log.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-gray-600">Response Data</summary>
                        <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                    
                    {log.error && (
                      <div className="mt-2 p-2 bg-white rounded text-xs text-red-600">
                        <strong>Error:</strong> {log.error}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookDebugger;