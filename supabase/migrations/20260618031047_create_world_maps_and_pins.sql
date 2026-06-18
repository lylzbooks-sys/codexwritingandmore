
-- Table to store map metadata per user
CREATE TABLE IF NOT EXISTS world_maps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE world_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_world_maps" ON world_maps FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_world_maps" ON world_maps FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_world_maps" ON world_maps FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_world_maps" ON world_maps FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Table for map pins
CREATE TABLE IF NOT EXISTS map_pins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  map_id uuid NOT NULL REFERENCES world_maps(id) ON DELETE CASCADE,
  story_element_id uuid REFERENCES story_elements(id) ON DELETE SET NULL,
  x_pct numeric(6,4) NOT NULL,
  y_pct numeric(6,4) NOT NULL,
  label text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE map_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_map_pins" ON map_pins FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_map_pins" ON map_pins FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_map_pins" ON map_pins FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_map_pins" ON map_pins FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for world maps (created via policy, bucket must be made via API)
INSERT INTO storage.buckets (id, name, public)
VALUES ('world_maps', 'world_maps', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "select_own_map_files" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'world_maps' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "insert_own_map_files" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'world_maps' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "update_own_map_files" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'world_maps' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "delete_own_map_files" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'world_maps' AND (storage.foldername(name))[1] = auth.uid()::text);
