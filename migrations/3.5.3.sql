-- added functionality to save videos
CREATE TABLE
  `video_saving` (
    `id` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
      `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      `userId` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
      `videoId` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
      PRIMARY KEY (`id`),
      KEY `FK_1ascklnasdkjcnsdsipld` (`videoId`),
      KEY `FK_1asck443567yuhjbyhiio` (`userId`),
      CONSTRAINT `FK_1asck09876trfgcvbno` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `FK_1a34567yuhgbnmnjklld` FOREIGN KEY (`videoId`) REFERENCES `video` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- added video reactions
CREATE TABLE
  `video_reaction` (
    `id` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
      `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      `userId` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
      `videoId` varchar(255) CHARACTER
    SET
      utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
      `reaction` enum ('like', 'dislike', 'happy', 'sad', 'mindblowing') NOT NULL,
      PRIMARY KEY (`id`),
      KEY `FK_1a762839rh2ibcipld` (`videoId`),
      KEY `FK_1abvhnjkiu8766hiio` (`userId`),
      CONSTRAINT `FK_1as678uijhbvgfthcddo` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `FK_1cfdre546789765trfgv` FOREIGN KEY (`videoId`) REFERENCES `video` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci