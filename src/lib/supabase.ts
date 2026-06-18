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
  xp: number;
  rank: string;
  created_at: string;
  updated_at: string;
}

export interface SocialUpdate {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string | null;
  role: UserRole | null;
  xp: number;
  rank: string;
}

export interface BinderItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  order_index: number;
  status: 'draft' | 'in-progress' | 'review' | 'done';
  parent_id: string | null;
  item_type: 'chapter' | 'scene';
}

export type StoryElementCategory = 'character' | 'location' | 'rule';

export interface StoryElement {
  id: string;
  user_id: string;
  category: StoryElementCategory;
  name: string;
  description: string;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface WorldMap {
  id: string;
  user_id: string;
  storage_path: string;
  created_at: string;
  updated_at: string;
}

export interface MapPin {
  id: string;
  user_id: string;
  map_id: string;
  story_element_id: string | null;
  x_pct: number;
  y_pct: number;
  label: string | null;
  created_at: string;
}
