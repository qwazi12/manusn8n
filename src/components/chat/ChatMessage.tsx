// src/components/chat/ChatMessage.tsx
import React from 'react';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessageProps {
  role: MessageRole;
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  isLoading = false
}) => {
  // Format timestamp
  const formattedTime = timestamp 
    ? new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(timestamp)
    : '';

  return (
    <div 
      className={`chat-message ${role}`}
      style={{
        display: 'flex',
        marginBottom: '16px',
        opacity: isLoading ? 0.7 : 1
      }}
    >
      {/* Avatar */}
      <div 
        className="avatar"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: role === 'user' ? '#3498db' : '#2ecc71',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          marginRight: '12px',
          flexShrink: 0
        }}
      >
        {role === 'user' ? 'U' : 'AI'}
      </div>

      {/* Message content */}
      <div 
        className="message-content"
        style={{
          flex: 1,
          backgroundColor: role === 'user' ? '#f0f0f0' : '#f8f8f8',
          padding: '12px 16px',
          borderRadius: '8px',
          position: 'relative'
        }}
      >
        {/* Role label */}
        <div 
          className="role-label"
          style={{
            fontWeight: 'bold',
            marginBottom: '4px',
            color: role === 'user' ? '#3498db' : '#2ecc71'
          }}
        >
          {role === 'user' ? 'You' : 'NodePilot AI'}
          {timestamp && (
            <span 
              className="timestamp"
              style={{
                fontWeight: 'normal',
                fontSize: '12px',
                color: '#999',
                marginLeft: '8px'
              }}
            >
              {formattedTime}
            </span>
          )}
        </div>

        {/* Message text */}
        <div 
          className="message-text"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {isLoading ? (
            <div className="loading-indicator">
              <span 
                style={{
                  display: 'inline-block',
                  animation: 'pulse 1.5s infinite ease-in-out'
                }}
              >
                Generating workflow
              </span>
              <span 
                style={{
                  display: 'inline-block',
                  animation: 'dots 1.5s infinite steps(4, end)'
                }}
              >
                ...
              </span>
              <style>
                {`
                  @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                  }
                  @keyframes dots {
                    0% { width: 0; }
                    100% { width: 1em; }
                  }
                `}
              </style>
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
};
