-- Add an optional `tags` column to `work_task`.
-- The tags are stored as a comma-separated list (TypeORM `simple-array`)
-- and are used to filter the task list of an assigned work in the UI.
ALTER TABLE work_task
ADD COLUMN `tags` text CHARACTER
SET
	utf8mb4 COLLATE utf8mb4_bin NULL;

-- Browser push (Web Push) subscriptions, one row per browser/device.
CREATE TABLE
	push_subscription (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`endpoint` varchar(512) NOT NULL,
		`p256dh` varchar(255) NOT NULL,
		`auth` varchar(255) NOT NULL,
		`user_agent` varchar(255) DEFAULT NULL,
		`userId` varchar(255) DEFAULT NULL,
		PRIMARY KEY (`id`),
		UNIQUE KEY `uq_push_subscription_endpoint` (`endpoint`),
		KEY `fk_push_subscription_user` (`userId`),
		CONSTRAINT `fk_push_subscription_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;
