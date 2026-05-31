/*
  # Create Profiles Table for Codex Platform

  ## Summary
  Creates the `profiles` table that stores user-specific information including their
  chosen platform role (Writer, Reader, Artist, or Hybrid) and display name.

  ## New Tables
  - `profiles`
    - `id` (uuid, primary key, references auth.users)
    - `username` (text, optional display name)
    - `role` (text, one of: writer, reader, artist, hybrid)
    - `onboarding_complete` (boolean, tracks if user finished onboarding)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on `profiles` table
  - Users can read their own profile
  - Users can insert their own profile
  - Users can update their own profile

  ## Notes
  - Profile is created after signup during onboarding
  - The `role` column drives which dashboard the user sees
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  role text CHECK (role IN ('writer', 'reader', 'artist', 'hybrid')),
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
