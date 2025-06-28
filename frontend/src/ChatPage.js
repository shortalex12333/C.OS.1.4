import React from 'react';
import ModernChatInterface from './ModernChatInterface';

// Example integration component
const ChatPage = ({ user }) => {
  return (
    <div className="modern-chat">
      <ModernChatInterface 
        user={user}
        apiEndpoint="https://api.celeste7.ai/webhook/text-chat-fast"
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