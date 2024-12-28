-- Add checkOneByOneEnabled column to the work table
ALTER TABLE work_task
ADD COLUMN is_check_one_by_one_enabled TINYINT (4) NOT NULL DEFAULT 0;