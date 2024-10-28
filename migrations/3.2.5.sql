-- Since 3.3 a course can have multiple authors, so we need a new table to store the relationship between courses and authors (many-to-many relationship).
CREATE TABLE
	IF NOT EXISTS `course_authors_user` (
		`courseId` VARCHAR(255) NOT NULL,
		`userId` VARCHAR(255) NOT NULL,
		PRIMARY KEY (`courseId`, `userId`),
		KEY `courseId` (`courseId`),
		KEY `userId` (`userId`),
		CONSTRAINT `FK_b74d093456d7uyhjcnd687r23ad` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
		CONSTRAINT `FK_sdscddwdu8sd97sdcd713ce55` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

-- Remove the authorId FK, indexes, constraints and column from the course table
ALTER TABLE `course`
DROP FOREIGN KEY `FK_98522d97c4ecc30c636f5f5115e`,
DROP `authorId`;

-- A material has now activate_at and is_work_available fields
-- The activate_at field is the date when the material will be available to the students
-- The is_work_available field is a flag to indicate if the work attached to material
-- is available to the students
ALTER TABLE `course_material`
ADD COLUMN `activate_at` timestamp(6) NULL DEFAULT NULL,
ADD COLUMN `is_work_available` tinyint (4) NOT NULL DEFAULT 1;

-- User settings has now a new field called `font_size` of type enum
ALTER TABLE `user_settings`
ADD COLUMN `font_size` ENUM ('small', 'medium', 'large') NOT NULL DEFAULT 'medium';