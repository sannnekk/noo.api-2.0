ALTER TABLE `session`
ADD COLUMN `is_app` TINYINT(1) NULL DEFAULT NULL AFTER `is_mobile`;

ALTER TABLE `course_assignment`
ADD COLUMN `is_pinned` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_archived`;

ALTER TABLE `work_task`
CHANGE COLUMN `type` `type` ENUM('word', 'text', 'essay', 'final-essay', 'dictation') NOT NULL;