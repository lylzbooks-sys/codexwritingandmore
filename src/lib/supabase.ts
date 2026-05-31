import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'writer' | 'reader' | 'artist' | 'hybrid';

export interface Profile {
  id: string;
  username: string | null;
  role: UserRole | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface BinderItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
