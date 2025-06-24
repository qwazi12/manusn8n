-- Enhanced n8n Documentation Schema
-- Run this in your Supabase SQL editor to prepare for comprehensive documentation ingestion

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing table if it exists (be careful in production!)
DROP TABLE IF EXISTS n8n_documentation CASCADE;
DROP TABLE IF EXISTS documentation_usage_analytics CASCADE;

-- Create enhanced documentation table
CREATE TABLE n8n_documentation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'integrations', 'code', 'workflows', 'api', 'hosting'
    subcategory TEXT NOT NULL, -- e.g., 'http-request', 'schedule-trigger', 'expressions'
    file_path TEXT NOT NULL, -- relative path in the docs repository
    source_url TEXT NOT NULL, -- GitHub URL to the source file
    tokens INTEGER NOT NULL DEFAULT 0,
    snippet_type TEXT CHECK (snippet_type IN ('explanation', 'code', 'reference', 'example', 'guide')),
    keywords TEXT[] DEFAULT '{}', -- extracted keywords for better search
    section_header TEXT, -- if this chunk is from a specific section
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    metadata JSONB DEFAULT '{}', -- additional metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0
);

-- Create indexes for optimal performance
CREATE INDEX n8n_documentation_category_idx ON n8n_documentation (category);
CREATE INDEX n8n_documentation_subcategory_idx ON n8n_documentation (subcategory);
CREATE INDEX n8n_documentation_snippet_type_idx ON n8n_documentation (snippet_type);
CREATE INDEX n8n_documentation_keywords_idx ON n8n_documentation USING GIN (keywords);
CREATE INDEX n8n_documentation_content_search_idx ON n8n_documentation USING GIN (to_tsvector('english', content));
CREATE INDEX n8n_documentation_title_search_idx ON n8n_documentation USING GIN (to_tsvector('english', title));

-- Vector similarity search index
CREATE INDEX n8n_documentation_embedding_idx ON n8n_documentation 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Composite indexes for common query patterns
CREATE INDEX n8n_documentation_category_tokens_idx ON n8n_documentation (category, tokens);
CREATE INDEX n8n_documentation_category_subcategory_idx ON n8n_documentation (category, subcategory);

-- Full-text search index combining title and content
CREATE INDEX n8n_documentation_full_text_idx ON n8n_documentation 
USING GIN (to_tsvector('english', title || ' ' || content));

-- Create documentation usage analytics table
CREATE TABLE documentation_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documentation_id UUID REFERENCES n8n_documentation(id) ON DELETE CASCADE,
    user_id UUID, -- References your existing users table
    workflow_generation_id UUID, -- References generated workflows
    query_text TEXT,
    similarity_score FLOAT,
    was_helpful BOOLEAN,
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX documentation_usage_analytics_doc_id_idx ON documentation_usage_analytics (documentation_id);
CREATE INDEX documentation_usage_analytics_user_id_idx ON documentation_usage_analytics (user_id);
CREATE INDEX documentation_usage_analytics_created_at_idx ON documentation_usage_analytics (created_at);

-- Function to search documentation with vector similarity
CREATE OR REPLACE FUNCTION search_n8n_documentation(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_category text DEFAULT NULL,
    filter_subcategory text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    title text,
    content text,
    category text,
    subcategory text,
    source_url text,
    similarity float,
    snippet_type text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.title,
        d.content,
        d.category,
        d.subcategory,
        d.source_url,
        1 - (d.embedding <=> query_embedding) AS similarity,
        d.snippet_type
    FROM n8n_documentation d
    WHERE 
        1 - (d.embedding <=> query_embedding) > match_threshold
        AND (filter_category IS NULL OR d.category = filter_category)
        AND (filter_subcategory IS NULL OR d.subcategory = filter_subcategory)
    ORDER BY 
        d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to search documentation with full-text search
CREATE OR REPLACE FUNCTION search_n8n_documentation_text(
    search_query text,
    match_count int DEFAULT 10,
    filter_category text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    title text,
    content text,
    category text,
    subcategory text,
    source_url text,
    rank float,
    snippet_type text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.title,
        d.content,
        d.category,
        d.subcategory,
        d.source_url,
        ts_rank(to_tsvector('english', d.title || ' ' || d.content), plainto_tsquery('english', search_query)) AS rank,
        d.snippet_type
    FROM n8n_documentation d
    WHERE 
        to_tsvector('english', d.title || ' ' || d.content) @@ plainto_tsquery('english', search_query)
        AND (filter_category IS NULL OR d.category = filter_category)
    ORDER BY 
        rank DESC
    LIMIT match_count;
END;
$$;

-- Function to get documentation statistics
CREATE OR REPLACE FUNCTION get_documentation_stats()
RETURNS TABLE (
    total_documents bigint,
    total_categories bigint,
    total_subcategories bigint,
    total_tokens bigint,
    avg_tokens_per_doc float,
    categories_breakdown jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_documents,
        COUNT(DISTINCT category) as total_categories,
        COUNT(DISTINCT subcategory) as total_subcategories,
        SUM(tokens) as total_tokens,
        AVG(tokens) as avg_tokens_per_doc,
        jsonb_object_agg(category, category_count) as categories_breakdown
    FROM (
        SELECT 
            category,
            COUNT(*) as category_count,
            tokens
        FROM n8n_documentation 
        GROUP BY category, tokens
    ) stats;
END;
$$;

-- Function to update access tracking
CREATE OR REPLACE FUNCTION track_documentation_access(doc_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE n8n_documentation 
    SET 
        last_accessed = NOW(),
        access_count = access_count + 1
    WHERE id = doc_id;
END;
$$;

-- Enable Row Level Security (optional, for multi-tenant scenarios)
ALTER TABLE n8n_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for service role
CREATE POLICY "Allow all operations for service role" ON n8n_documentation
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for service role" ON documentation_usage_analytics
    FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON n8n_documentation TO postgres, anon, authenticated, service_role;
GRANT ALL ON documentation_usage_analytics TO postgres, anon, authenticated, service_role;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_n8n_documentation_updated_at 
    BEFORE UPDATE ON n8n_documentation 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a test record to verify the schema
INSERT INTO n8n_documentation (
    title,
    content,
    category,
    subcategory,
    file_path,
    source_url,
    tokens,
    snippet_type,
    keywords
) VALUES (
    'Schema Test Record',
    'This is a test record to verify the enhanced schema is working correctly.',
    'test',
    'schema-verification',
    'test/schema-test.md',
    'https://github.com/n8n-io/n8n-docs/blob/main/test/schema-test.md',
    15,
    'explanation',
    ARRAY['test', 'schema', 'verification']
);

-- Verify the schema is working
SELECT 'Schema setup completed successfully!' as status;
SELECT * FROM get_documentation_stats();
