-- Assists can archive assigned works
ALTER TABLE assigned_work
ADD COLUMN `is_archived_by_assistants` TINYINT (4) NOT NULL DEFAULT 0;

-- Add assistant role to the user
ALTER TABLE user MODIFY COLUMN `role` ENUM (
	'student',
	'teacher',
	'mentor',
	'admin',
	'assistant'
) NOT NULL DEFAULT 'student';