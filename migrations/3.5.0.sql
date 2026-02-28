-- Added video and video_chapter entity
CREATE TABLE
  `video` (
    `id` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
      `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      `description` text COLLATE utf8mb4_general_ci,
      `url` varchar(512) COLLATE utf8mb4_general_ci DEFAULT NULL,
      `service_type` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      `unique_identifier` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      `duration` int NOT NULL,
      `state` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      `published_at` timestamp NOT NULL,
      `upload_url` varchar(512) COLLATE utf8mb4_general_ci DEFAULT NULL,
      `size_in_bytes` bigint NOT NULL,
      `uploadedById` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
      `thumbnailId` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
      `courseMaterialId` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `REL_1adf3c18a8d7b082ac24430903` (`thumbnailId`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

ALTER TABLE video ADD COLUMN access_type VARCHAR(255) NOT NULL;
ALTER TABLE video ADD COLUMN access_value VARCHAR(255) NULL DEFAULT NULL;

CREATE TABLE
  `video_chapter` (
    `id` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
      `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      `description` text COLLATE utf8mb4_general_ci,
      `timestamp` int NOT NULL,
      `videoId` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
      PRIMARY KEY (`id`),
      CONSTRAINT `FK_1ascklnaco59sipld` FOREIGN KEY (`videoId`) REFERENCES `video` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

CREATE TABLE
  `video_comment` (
    `id` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
      `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      `text` text COLLATE utf8mb4_general_ci NOT NULL,
      `userId` varchar(255) COLLATE utf8mb3_general_ci,
      `videoId` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
      PRIMARY KEY (`id`),
      CONSTRAINT `FK_1ascklnaco59sipld` FOREIGN KEY (`videoId`) REFERENCES `video` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `FK_1asck46578dyhiio` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;