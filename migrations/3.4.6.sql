-- Added many-to-many relation between user and course as course editors
CREATE TABLE
	course_editors_user (
		userId VARCHAR(255) NOT NULL,
		courseId VARCHAR(255) NOT NULL,
		PRIMARY KEY (userId, courseId),
		CONSTRAINT `fk_jkhzsvdcuis78cs98csdc` FOREIGN KEY (userId) REFERENCES `user` (id) ON UPDATE CASCADE ON DELETE CASCADE,
		CONSTRAINT `fk_jkhzsvdcuis78cs9scehc` FOREIGN KEY (courseId) REFERENCES `course` (id) ON UPDATE CASCADE ON DELETE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;