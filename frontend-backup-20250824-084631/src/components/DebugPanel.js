import React, { useState } from 'react';
import { Bug, ExternalLink, AlertTriangle, Settings } from 'lucide-react';
import webhookService from '../services/webhookService';
import { cacheService } from '../services/cacheService';

// Quick Debug Panel Component
const DebugPanel = ({ isDarkMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(
    localStorage.getItem('webhook_debug_mode') === 'true'
  );

  const toggleEmergencyMode = () => {
    const newMode = !emergencyMode;
    setEmergencyMode(newMode);
    webhookService.setEmergencyMode(newMode);
  };

  const openDebugPage = () => {
    window.open('/webhook-debug', '_blank');
  };

  const testWebhooks = async () => {
    console.log('🧪 Running webhook health check...');
    const results = await webhookService.healthCheck();
    console.log('🧪 Health check results:', results);
    alert('Health check completed! Check console for results.');
  };

  const getCacheStats = () => {
    const stats = cacheService.getCacheStats();
    console.log('📊 Cache statistics:', stats);
    alert(`Cache Stats:\n- Entries: ${stats.entriesCount}\n- Total Requests: ${stats.totalRequests}\n- Hit Rate: ${stats.cacheHitRate}%`);
  };

  const webhookStatus = webhookService.getStatus();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-colors z-50 ${
          emergencyMode
            ? 'bg-orange-600 hover:bg-orange-700 text-white'
            : isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        title="Open Debug Panel"
      >
        {emergencyMode ? <AlertTriangle size={20} /> : <Bug size={20} />}
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-80 rounded-lg shadow-xl border z-50 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-600 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings size={16} />
            Debug Panel
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className={`text-xs px-2 py-1 rounded ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            ✕
          </button>
        </div>
        
        {/* Status Indicators */}
        <div className="mt-2 space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              webhookStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span>Webhooks: {webhookStatus.isOnline ? 'Online' : 'Offline'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              emergencyMode ? 'bg-orange-500' : 'bg-green-500'
            }`}></div>
            <span>Mode: {emergencyMode ? 'Emergency' : 'Normal'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Failures: {webhookStatus.failureCount}/{webhookStatus.maxFailures}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Emergency Mode Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Emergency Mode</span>
          <button
            onClick={toggleEmergencyMode}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              emergencyMode
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : isDarkMode
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {emergencyMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button
            onClick={openDebugPage}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <ExternalLink size={14} />
            Open Full Debugger
          </button>
          
          <button
            onClick={testWebhooks}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            🧪 Test All Webhooks
          </button>
          
          <button
            onClick={getCacheStats}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📊 Cache Statistics
          </button>
        </div>

        {/* Warning for Emergency Mode */}
        {emergencyMode && (
          <div className={`p-2 rounded text-xs ${
            isDarkMode ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800'
          }`}>
            ⚠️ Using mock data. Disable emergency mode when webhooks are fixed.
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;