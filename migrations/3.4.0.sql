-- Favourite task entity
CREATE TABLE
	IF NOT EXISTS favourite_task (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		taskId varchar(255) NOT NULL,
		userId varchar(255) NOT NULL,
		answer json NULL DEFAULT NULL,
		comment json NULL DEFAULT NULL,
		PRIMARY KEY (`id`),
		KEY `FK_skjcbdsicsdsdc80cy6uiolkmn` (taskId),
		KEY `FK_skjcbdsicuiwyec8s7dcnwkjs8` (userId),
		CONSTRAINT unique_favourite_task UNIQUE (taskId, userId),
		CONSTRAINT fk_favourite_task_taskId FOREIGN KEY (taskId) REFERENCES work_task (id) ON DELETE CASCADE ON UPDATE CASCADE,
		CONSTRAINT fk_favourite_task_userId FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;