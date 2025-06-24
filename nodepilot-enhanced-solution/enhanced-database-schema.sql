-- Enhanced NodePilot Database Schema Extensions
-- Adds conversation management to existing Supabase database

-- Conversations table for managing chat sessions
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Messages table for storing conversation history
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  intent TEXT CHECK (intent IN ('workflow_request', 'general_conversation', 'clarification_needed')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow generations table (extends existing workflow tracking)
CREATE TABLE IF NOT EXISTS workflow_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL,
  original_prompt TEXT NOT NULL,
  optimized_prompt TEXT,
  workflow_data JSONB,
  generation_method TEXT DEFAULT 'claude_sonnet_4',
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced AI prompts (extends existing ai_prompts table)
-- Add new conversation-specific prompts if they don't exist
INSERT INTO ai_prompts (name, content, version, is_active, created_at) 
VALUES 
  (
    'intent_classification',
    'You are an intent classifier for NodePilot, an n8n workflow automation platform.

Analyze user input and classify it into one of these categories:

1. WORKFLOW_REQUEST: User wants to create, modify, or get help with n8n workflows
   - Keywords: create, build, automate, workflow, connect, integrate, sync
   - Examples: "Create a workflow that...", "I need to automate...", "Build me a workflow for..."

2. GENERAL_CONVERSATION: User wants to chat, ask questions, or get help about the platform
   - Keywords: what, how, help, explain, price, cost, features
   - Examples: "What is NodePilot?", "How does this work?", "What can you do?"

3. CLARIFICATION_NEEDED: Input is unclear or needs more information
   - Vague requests, incomplete information, ambiguous intent

Respond in JSON format:
{
  "intent": "workflow_request|general_conversation|clarification_needed",
  "confidence": 85,
  "reasoning": "Brief explanation",
  "entities": {
    "tools": ["Gmail", "Slack"],
    "actions": ["send", "notify"],
    "triggers": ["new email"]
  }
}',
    1,
    true,
    NOW()
  ),
  (
    'conversation_handler',
    'You are NodePilot''s conversational assistant. You help users with:

- Questions about NodePilot and n8n workflow automation
- Platform features, pricing, and capabilities  
- General guidance and support
- Explaining how automation works

Be conversational, helpful, and knowledgeable. If users show interest in creating workflows, guide them toward workflow creation.

Keep responses concise but informative. Always be ready to help with workflow creation if the user shows interest.',
    1,
    true,
    NOW()
  ),
  (
    'workflow_prompt_optimizer',
    'You are a prompt optimizer for n8n workflow generation. Your job is to take a user''s workflow request and optimize it for Claude Sonnet 4 to generate the best possible n8n workflow.

Transform the user''s request into a detailed, structured prompt that includes:

1. Clear workflow objective
2. Specific tools/services to connect
3. Trigger conditions
4. Actions to perform
5. Data flow requirements
6. Error handling needs

Make the prompt comprehensive and technical while preserving the user''s intent.

Input: User''s original request
Output: Optimized prompt for workflow generation',
    1,
    true,
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_user_id ON conversation_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_generations_user_id ON workflow_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_generations_conversation_id ON workflow_generations(conversation_id);

-- Row Level Security (RLS) policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid()::text = user_id);

-- RLS Policies for conversation_messages
CREATE POLICY "Users can view their own messages" ON conversation_messages
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own messages" ON conversation_messages
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS Policies for workflow_generations
CREATE POLICY "Users can view their own workflow generations" ON workflow_generations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own workflow generations" ON workflow_generations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Service role policies (for backend operations)
CREATE POLICY "Service role can manage all conversations" ON conversations
  FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role can manage all messages" ON conversation_messages
  FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role can manage all workflow generations" ON workflow_generations
  FOR ALL USING (current_setting('role') = 'service_role');

-- Functions for conversation management
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when new message is added
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- View for conversation summaries
CREATE OR REPLACE VIEW conversation_summaries AS
SELECT 
  c.id,
  c.user_id,
  c.title,
  c.created_at,
  c.updated_at,
  c.is_active,
  COUNT(cm.id) as message_count,
  MAX(cm.created_at) as last_message_at,
  COUNT(wg.id) as workflow_count
FROM conversations c
LEFT JOIN conversation_messages cm ON c.id = cm.conversation_id
LEFT JOIN workflow_generations wg ON c.id = wg.conversation_id
GROUP BY c.id, c.user_id, c.title, c.created_at, c.updated_at, c.is_active;

-- Grant permissions
GRANT ALL ON conversations TO service_role;
GRANT ALL ON conversation_messages TO service_role;
GRANT ALL ON workflow_generations TO service_role;
GRANT SELECT ON conversation_summaries TO service_role;

GRANT SELECT, INSERT, UPDATE ON conversations TO authenticated;
GRANT SELECT, INSERT ON conversation_messages TO authenticated;
GRANT SELECT, INSERT ON workflow_generations TO authenticated;
GRANT SELECT ON conversation_summaries TO authenticated;

