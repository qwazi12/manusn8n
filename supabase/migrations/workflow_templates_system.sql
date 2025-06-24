-- Workflow Templates System for NodePilot
-- This creates a comprehensive template system for AI training and reference

-- Workflow Templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- e.g., 'email', 'data-sync', 'notifications', 'ai-automation'
  subcategory VARCHAR(100), -- e.g., 'welcome-email', 'csv-to-database', 'slack-alerts'
  
  -- Template content
  prompt_example TEXT NOT NULL, -- Example user prompt that would generate this workflow
  workflow_json JSONB NOT NULL, -- The actual n8n workflow JSON
  
  -- AI Training data
  keywords TEXT[] DEFAULT '{}', -- Keywords for AI matching
  use_cases TEXT[] DEFAULT '{}', -- Common use cases
  complexity_level INTEGER DEFAULT 1 CHECK (complexity_level BETWEEN 1 AND 5), -- 1=simple, 5=complex
  
  -- Template metadata
  nodes_used TEXT[] DEFAULT '{}', -- List of n8n nodes used
  integrations TEXT[] DEFAULT '{}', -- External services integrated
  estimated_setup_time INTEGER, -- Minutes to set up
  
  -- Quality and usage tracking
  quality_score INTEGER DEFAULT 5 CHECK (quality_score BETWEEN 1 AND 10),
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.00, -- Percentage of successful generations
  
  -- Template status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE, -- Can be used by all users
  created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Template creator
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Template Categories table for better organization
CREATE TABLE IF NOT EXISTS template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Icon name for UI
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Usage Analytics
CREATE TABLE IF NOT EXISTS template_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  workflow_generation_id UUID REFERENCES workflow_generations(id) ON DELETE SET NULL,
  
  -- Usage context
  user_prompt TEXT NOT NULL,
  match_score DECIMAL(5,2), -- How well the template matched the request (0-100)
  was_successful BOOLEAN DEFAULT FALSE,
  
  -- Performance metrics
  generation_time_ms INTEGER,
  modifications_needed TEXT[], -- What modifications were made to the template
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Feedback for continuous improvement
CREATE TABLE IF NOT EXISTS template_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  improvement_suggestions TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_keywords ON workflow_templates USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_active ON workflow_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_featured ON workflow_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_quality ON workflow_templates(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_usage ON workflow_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_template ON template_usage_analytics(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_user ON template_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_created ON template_usage_analytics(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_workflow_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflow_templates_updated_at 
    BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_workflow_templates_updated_at();

-- Insert default categories
INSERT INTO template_categories (name, description, icon, sort_order) VALUES
('Email Automation', 'Templates for email marketing, notifications, and communication workflows', 'mail', 1),
('Data Synchronization', 'Templates for syncing data between different platforms and databases', 'sync', 2),
('Notifications & Alerts', 'Templates for sending alerts, notifications, and monitoring workflows', 'bell', 3),
('AI & Machine Learning', 'Templates integrating AI services like OpenAI, Claude, and other ML tools', 'brain', 4),
('Social Media', 'Templates for social media automation, posting, and monitoring', 'share', 5),
('E-commerce', 'Templates for online store automation, order processing, and inventory management', 'shopping-cart', 6),
('CRM & Sales', 'Templates for customer relationship management and sales automation', 'users', 7),
('File Processing', 'Templates for file manipulation, conversion, and processing workflows', 'file', 8),
('Web Scraping', 'Templates for data extraction and web scraping workflows', 'globe', 9),
('Reporting & Analytics', 'Templates for generating reports and analytics dashboards', 'bar-chart', 10)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_templates
CREATE POLICY "Public templates are viewable by all" ON workflow_templates
    FOR SELECT USING (is_public = TRUE AND is_active = TRUE);

CREATE POLICY "Users can view their own templates" ON workflow_templates
    FOR SELECT USING (auth.uid()::text = created_by::text);

CREATE POLICY "Users can create templates" ON workflow_templates
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can update their own templates" ON workflow_templates
    FOR UPDATE USING (auth.uid()::text = created_by::text);

-- RLS Policies for template_categories (public read)
CREATE POLICY "Categories are viewable by all" ON template_categories
    FOR SELECT USING (is_active = TRUE);

-- RLS Policies for template_usage_analytics
CREATE POLICY "Users can view their own usage analytics" ON template_usage_analytics
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can insert usage analytics" ON template_usage_analytics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for template_feedback
CREATE POLICY "Users can view their own feedback" ON template_feedback
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create feedback" ON template_feedback
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
