import React from 'react';
import ModernChatInterface from './ModernChatInterface';
import { WEBHOOK_URLS } from './config/webhookConfig';

const ChatPage = ({ user, onLogout }) => {
  return (
    <div className="h-screen">
      <ModernChatInterface 
        user={user}
        apiEndpoint={WEBHOOK_URLS.TEXT_CHAT_FAST}
      />
    </div>
  );
};

// Example App.js integration
/*
import ChatPage from './ChatPage';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('auth');

  if (currentPage === 'chat' && user) {
    return <ChatPage user={user} />;
  }

  // ... rest of your app logic
}
*/

export default ChatPage;