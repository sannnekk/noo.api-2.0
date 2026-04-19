-- Add `is_public` boolean column to `courses` table, defaulting to false
ALTER TABLE course
ADD COLUMN is_public TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE `user`
ADD COLUMN phone VARCHAR(30) NULL;
