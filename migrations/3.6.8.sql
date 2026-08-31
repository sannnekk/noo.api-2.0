-- Add an optional `tags` column to `work_task`.
-- The tags are stored as a comma-separated list (TypeORM `simple-array`)
-- and are used to filter the task list of an assigned work in the UI.
ALTER TABLE work_task
ADD COLUMN `tags` text CHARACTER
SET
	utf8mb4 COLLATE utf8mb4_bin NULL;
