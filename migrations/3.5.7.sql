-- Add many-to-many table course_material_videos_video
CREATE TABLE
	course_material_videos_video (
		videoId VARCHAR(255) NOT NULL,
		courseMaterialId VARCHAR(255) NOT NULL,
		PRIMARY KEY (videoId, courseMaterialId),
		CONSTRAINT `fk_jkh168279u3ibdjk28csdc` FOREIGN KEY (videoId) REFERENCES `video` (id) ON UPDATE CASCADE ON DELETE CASCADE,
		CONSTRAINT `fk_j52vfvyuhjgftyhjnbghyjmnhc` FOREIGN KEY (courseMaterialId) REFERENCES `course_material` (id) ON UPDATE CASCADE ON DELETE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

-- delete the courseMaterialId column from the video table
ALTER TABLE video
DROP COLUMN courseMaterialId;

-- Add titleColor and iSpinned columns to the course_material table
ALTER TABLE course_material
ADD COLUMN title_color VARCHAR(255) DEFAULT NULL,
ADD COLUMN is_pinned TINYINT (1) DEFAULT 0;