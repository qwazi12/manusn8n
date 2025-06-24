'use client';

import React, { useRef, useState, useEffect, DragEvent } from 'react';
import { Paperclip, ArrowUp, X } from 'lucide-react';

export default function ChatInputBar({
  onSendMessage,
}: {
  onSendMessage: (message: string, files: File[]) => void;
}) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim() && files.length === 0) return;
    onSendMessage(input, files);
    setInput('');
    setFiles([]);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
  };

  return (
    <div className="p-3 w-full">
      <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full">
        {/* File Previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 text-sm text-gray-700">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1"
              >
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  onClick={() => removeFile(file.name)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Bar with Drag-and-Drop */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex items-center w-full bg-white border ${
            dragOver ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
          } rounded-full px-3 py-2 shadow-sm transition-all`}
        >
          {/* Paperclip Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label="Attach files"
          >
            <Paperclip className="h-4 w-4 text-gray-700 rotate-45" />
          </button>
          <input
            type="file"
            multiple
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*,application/pdf"
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Give NodePilot a task to work on..."
            className="flex-1 resize-none bg-transparent text-sm text-black placeholder-gray-500 focus:outline-none px-2 py-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* Send */}
          <button
            onClick={handleSend}
            className="p-1.5 rounded-full hover:bg-gray-200 disabled:opacity-50"
            disabled={!input.trim() && files.length === 0}
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
} 