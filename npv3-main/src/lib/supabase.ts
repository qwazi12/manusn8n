import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type User = {
  id: string;
  email: string;
  credits: number;
  is_pro: boolean;
  created_at: string;
};

export type Workflow = {
  id: string;
  user_id: string;
  prompt: string;
  workflow_json: string;
  created_at: string;
};

export type UsageLog = {
  id: string;
  user_id: string;
  workflow_id: string;
  credits_used: number;
  created_at: string;
}; 