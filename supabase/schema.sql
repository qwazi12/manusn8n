-- NodePilot Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'payg')),
    credits_remaining INTEGER DEFAULT 75,
    total_credits_purchased INTEGER DEFAULT 75,
    stripe_customer_id VARCHAR(255),
    subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due')),
    subscription_id VARCHAR(255),
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    workflow_json JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    credits_used INTEGER DEFAULT 1,
    tags TEXT[],
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit history table
CREATE TABLE IF NOT EXISTS credit_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
    credits_amount INTEGER NOT NULL,
    credits_before INTEGER NOT NULL,
    credits_after INTEGER NOT NULL,
    description TEXT,
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('pro', 'payg')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment history table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
    payment_method VARCHAR(50),
    description TEXT,
    credits_purchased INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_credit_history_user_id ON credit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_history_created_at ON credit_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for workflows table
CREATE POLICY "Users can view own workflows" ON workflows
    FOR SELECT USING (auth.uid()::text = user_id::text OR is_public = true);

CREATE POLICY "Users can insert own workflows" ON workflows
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own workflows" ON workflows
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own workflows" ON workflows
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- RLS Policies for credit_history table
CREATE POLICY "Users can view own credit history" ON credit_history
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can insert credit history" ON credit_history
    FOR INSERT WITH CHECK (true);

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can manage subscriptions" ON subscriptions
    FOR ALL USING (true);

-- RLS Policies for payments table
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can insert payments" ON payments
    FOR INSERT WITH CHECK (true);

-- Insert sample data for testing (optional)
-- You can remove this section if you don't want sample data

-- Sample user (for testing purposes)
INSERT INTO users (id, email, username, first_name, last_name, plan_type, credits_remaining)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'test@nodepilot.dev',
    'testuser',
    'Test',
    'User',
    'free',
    75
) ON CONFLICT (email) DO NOTHING;

-- Sample workflow
INSERT INTO workflows (user_id, title, description, prompt, workflow_json, credits_used)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Sample Email Automation',
    'A simple workflow that sends welcome emails to new users',
    'Create a workflow that sends a welcome email when a new user signs up',
    '{"nodes": [{"id": "trigger", "type": "webhook", "name": "Webhook Trigger"}, {"id": "email", "type": "email", "name": "Send Email"}], "connections": {"trigger": {"main": [["email"]]}}}',
    1
) ON CONFLICT DO NOTHING;

-- Sample credit history
INSERT INTO credit_history (user_id, transaction_type, credits_amount, credits_before, credits_after, description)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'purchase',
    75,
    0,
    75,
    'Initial free trial credits'
) ON CONFLICT DO NOTHING; 