import React from 'react';
import ChatComponent from './components/Chat';
import { WEBHOOK_URLS } from './config/webhookConfig';

const ModernChatPage = ({ user, onLogout }) => {
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access the chat</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">
              Celeste<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">OS</span>
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">{user.email}</span>
              <button 
                onClick={onLogout}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {/* Chat Interface */}
        <ChatComponent 
          user={user}
          apiEndpoint={WEBHOOK_URLS.TEXT_CHAT_FAST}
          maxMessages={200}
        />
      </div>
    </div>
  );
};

export default ModernChatPage;