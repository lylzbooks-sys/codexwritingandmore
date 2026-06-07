/*
  # Create story_elements table

  1. New Table
    - `story_elements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `category` (text) - 'character', 'location', or 'rule'
      - `name` (text) - element name/title
      - `description` (text) - element details/notes
      - `metadata` (jsonb) - flexible key-value data (role, type, color, etc.)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - RLS enabled with per-verb policies scoped to authenticated users
*/

CREATE TABLE IF NOT EXISTS story_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('character', 'location', 'rule')),
  name text NOT NULL,
  description text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE story_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own story elements"
  ON story_elements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own story elements"
  ON story_elements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own story elements"
  ON story_elements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own story elements"
  ON story_elements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS story_elements_user_category_idx ON story_elements(user_id, category);

CREATE TRIGGER update_story_elements_updated_at
  BEFORE UPDATE ON story_elements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
