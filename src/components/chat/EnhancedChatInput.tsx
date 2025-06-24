// src/components/chat/EnhancedChatInput.tsx
import React, { useState, useRef } from 'react';

interface EnhancedChatInputProps {
  onSubmit: (prompt: string, files?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({
  onSubmit,
  placeholder = 'Describe the workflow you want to create...',
  disabled = false,
  loading = false
}) => {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle prompt submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() && files.length === 0) return;
    
    onSubmit(prompt, files.length > 0 ? files : undefined);
    setPrompt('');
    setFiles([]);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setFiles(prev => [...prev, ...fileArray]);
    }
  };

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Trigger file input click
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="enhanced-chat-input" style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '12px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      {/* File attachments */}
      {files.length > 0 && (
        <div className="file-attachments" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '12px'
        }}>
          {files.map((file, index) => (
            <div key={index} className="file-attachment" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 8px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <span style={{ marginRight: '8px' }}>{file.name}</span>
              <button
                onClick={() => handleRemoveFile(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'flex-end' }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || loading}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '4px',
            resize: 'vertical',
            minHeight: '60px',
            maxHeight: '200px',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: '16px'
          }}
        />
        
        <div className="chat-actions" style={{
          display: 'flex',
          marginLeft: '12px'
        }}>
          <button
            type="button"
            onClick={handleAttachClick}
            disabled={disabled || loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              color: '#3498db'
            }}
          >
            📎
          </button>
          
          <button
            type="submit"
            disabled={disabled || loading || (!prompt.trim() && files.length === 0)}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: (!prompt.trim() && files.length === 0) || disabled || loading ? 'not-allowed' : 'pointer',
              opacity: (!prompt.trim() && files.length === 0) || disabled || loading ? 0.7 : 1
            }}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          style={{ display: 'none' }}
        />
      </form>
    </div>
  );
};
