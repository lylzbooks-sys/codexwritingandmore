
-- Add XP and rank to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rank text NOT NULL DEFAULT 'Apprentice';

-- Social updates feed
CREATE TABLE IF NOT EXISTS social_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE social_updates ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read all updates
CREATE POLICY "select_social_updates" ON social_updates FOR SELECT
  TO authenticated USING (true);

-- Users can only insert their own
CREATE POLICY "insert_own_social_updates" ON social_updates FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own
CREATE POLICY "delete_own_social_updates" ON social_updates FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Join view helper: surface username alongside updates
CREATE OR REPLACE VIEW social_updates_with_profile AS
  SELECT
    su.id,
    su.user_id,
    su.content,
    su.created_at,
    p.username,
    p.role,
    p.xp,
    p.rank
  FROM social_updates su
  LEFT JOIN profiles p ON p.id = su.user_id;

GRANT SELECT ON social_updates_with_profile TO authenticated;
