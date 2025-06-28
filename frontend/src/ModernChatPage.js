import React from 'react';
import ChatComponent from './components/Chat';

// Example of how to integrate the new modular chat component
const ModernChatPage = ({ user, onLogout }) => {
  return (
    <div className="h-screen flex flex-col">
      {/* Optional: Add a top bar with logout */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img 
            src="/api/placeholder/32/32" 
            alt="User" 
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium text-gray-700">
            {user?.name || user?.email}
          </span>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1 rounded hover:bg-gray-100"
          >
            Logout
          </button>
        )}
      </div>
      
      {/* The new modular chat component */}
      <div className="flex-1">
        <ChatComponent 
          user={user}
          apiEndpoint="https://api.celeste7.ai/webhook/text-chat-fast"
          maxMessages={200}
        />
      </div>
    </div>
  );
};

export default ModernChatPage;