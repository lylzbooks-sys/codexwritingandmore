/*
  # Add parent_id and item_type to binder_items

  1. New Columns
    - `parent_id` (uuid, nullable) - self-reference for nesting chapters/scenes
    - `item_type` (text, not null, default 'scene') - 'chapter' or 'scene'

  2. Constraints
    - Foreign key: parent_id -> binder_items(id) ON DELETE CASCADE
    - Check: item_type IN ('chapter', 'scene')

  3. Indexes
    - Index on parent_id for fast nested lookups
*/

-- Add parent_id column
ALTER TABLE binder_items ADD COLUMN IF NOT EXISTS parent_id uuid;

-- Add self-referencing foreign key
ALTER TABLE binder_items
  ADD CONSTRAINT binder_items_parent_id_fkey
  FOREIGN KEY (parent_id)
  REFERENCES binder_items(id)
  ON DELETE CASCADE;

-- Add item_type column with check constraint
ALTER TABLE binder_items ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'scene'
  CHECK (item_type IN ('chapter', 'scene'));

-- Backfill existing rows: first item becomes a chapter, rest become scenes
UPDATE binder_items SET item_type = 'chapter' WHERE id = (
  SELECT id FROM binder_items ORDER BY created_at ASC LIMIT 1
);

-- Create index for parent_id lookups
CREATE INDEX IF NOT EXISTS binder_items_parent_id_idx ON binder_items(parent_id);
