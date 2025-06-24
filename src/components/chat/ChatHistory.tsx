// src/components/chat/ChatHistory.tsx
import React from 'react';
import { ChatMessage, ChatMessageProps } from './ChatMessage';

interface ChatHistoryProps {
  messages: ChatMessageProps[];
  loading?: boolean;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  messages,
  loading = false
}) => {
  // Scroll to bottom when messages change
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-history" style={{
      padding: '16px',
      overflowY: 'auto',
      height: '400px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      border: '1px solid #ddd',
      marginBottom: '16px'
    }}>
      {messages.length === 0 ? (
        <div className="empty-state" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#999',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <h3 style={{ margin: '0 0 8px 0' }}>No messages yet</h3>
          <p style={{ margin: 0 }}>
            Start by describing the workflow you want to create
          </p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              isLoading={index === messages.length - 1 && loading}
            />
          ))}
          
          {loading && messages[messages.length - 1]?.role === 'user' && (
            <ChatMessage
              role="assistant"
              content=""
              isLoading={true}
            />
          )}
          
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
