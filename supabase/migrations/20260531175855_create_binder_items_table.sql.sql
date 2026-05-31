/*
  # Create binder_items table

  1. New Tables
    - `binder_items`
      - `id` (uuid, primary key) - unique identifier for each document
      - `user_id` (uuid, foreign key to auth.users) - owner of the document
      - `title` (text) - document title
      - `content` (text) - document content/body
      - `created_at` (timestamptz) - creation timestamp
      - `updated_at` (timestamptz) - last modification timestamp

  2. Security
    - Enable RLS on `binder_items` table
    - Users can only access their own documents
    - Policies for SELECT, INSERT, UPDATE, DELETE operations

  3. Important Notes
    - Each user can only see and manage their own chapters/documents
    - The title has a sensible default for new documents
    - Updated_at automatically refreshes on modification
*/

CREATE TABLE IF NOT EXISTS binder_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Document',
  content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE binder_items ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to manage their own documents
CREATE POLICY "Users can view own binder items"
  ON binder_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own binder items"
  ON binder_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own binder items"
  ON binder_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own binder items"
  ON binder_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS binder_items_user_id_idx ON binder_items(user_id);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_binder_items_updated_at
  BEFORE UPDATE ON binder_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
