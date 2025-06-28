import React from 'react';
import { Wifi, WifiOff, Zap } from 'lucide-react';

const ConnectionStatus = ({ isOnline, isConnected }) => {
  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff size={16} className="text-red-500" />;
    if (!isConnected) return <Wifi size={16} className="text-yellow-500" />;
    return <Wifi size={16} className="text-green-500" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!isConnected) return 'Reconnecting...';
    return 'Connected';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600';
    if (!isConnected) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="flex items-center gap-2">
      {getStatusIcon()}
      <span className={`text-sm ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </div>
  );
};

const TokenCounter = React.memo(({ remaining, used, isLoading }) => (
  <div className="text-sm text-gray-600 flex items-center gap-2">
    {isLoading && (
      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    )}
    <span>
      {remaining?.toLocaleString() || 0} tokens remaining today
    </span>
    {used > 0 && (
      <span className="text-gray-400">
        ({used.toLocaleString()} used)
      </span>
    )}
  </div>
));

const Header = ({ tokenStats, isLoading, onClearChat, connectionStatus }) => {
  return (
    <div className="border-b border-gray-200 px-4 py-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-blue-500" />
            <h1 className="text-lg font-semibold text-gray-900">CelesteOS Chat</h1>
          </div>
          <ConnectionStatus {...connectionStatus} />
        </div>
        <button
          onClick={onClearChat}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Clear chat history"
        >
          Clear
        </button>
      </div>
      <TokenCounter 
        remaining={tokenStats.remaining} 
        used={tokenStats.used} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default Header;