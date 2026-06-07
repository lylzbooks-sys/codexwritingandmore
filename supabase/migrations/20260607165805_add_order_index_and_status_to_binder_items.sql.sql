/*
  # Add order_index and status columns to binder_items

  1. New Columns
    - `order_index` (int) - determines the display order of chapters
    - `status` (text) - chapter status (draft, in-progress, review, done)

  2. Defaults
    - order_index defaults to 0, will be backfilled
    - status defaults to 'draft'
*/

-- Add order_index column
ALTER TABLE binder_items ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0;

-- Add status column with check constraint
ALTER TABLE binder_items ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'in-progress', 'review', 'done'));

-- Backfill order_index based on created_at ordering
UPDATE binder_items
SET order_index = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) - 1 AS row_num
  FROM binder_items
) AS subquery
WHERE binder_items.id = subquery.id;

-- Create index for ordered queries
CREATE INDEX IF NOT EXISTS binder_items_user_order_idx ON binder_items(user_id, order_index);
