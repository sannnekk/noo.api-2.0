DROP TABLE IF EXISTS `assigned_work`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`assigned_work` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`slug` varchar(255) NOT NULL,
		`solve_status` enum (
			'not-started',
			'in-progress',
			'made-in-deadline',
			'made-after-deadline'
		) NOT NULL DEFAULT 'not-started',
		`check_status` enum (
			'not-checked',
			'in-progress',
			'checked-in-deadline',
			'checked-after-deadline',
			'checked-automatically'
		) NOT NULL DEFAULT 'not-checked',
		`solve_deadline_at` timestamp NULL DEFAULT NULL,
		`solve_deadline_shifted` tinyint NOT NULL DEFAULT '0',
		`check_deadline_at` timestamp NULL DEFAULT NULL,
		`check_deadline_shifted` tinyint NOT NULL DEFAULT '0',
		`solved_at` timestamp NULL DEFAULT NULL,
		`checked_at` timestamp NULL DEFAULT NULL,
		`score` int DEFAULT NULL,
		`max_score` int NOT NULL,
		`studentId` varchar(255) DEFAULT NULL,
		`workId` varchar(255) DEFAULT NULL,
		`is_archived_by_mentors` tinyint NOT NULL DEFAULT '0',
		`is_new_attempt` tinyint NOT NULL DEFAULT '0',
		`filtered_out_task_ids` json DEFAULT NULL,
		`is_archived_by_student` tinyint NOT NULL DEFAULT '0',
		`student_comment` longtext CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin,
			`mentor_comment` longtext CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin,
			PRIMARY KEY (`id`),
			KEY `FK_d5a5deb045955cf68b9123443cf` (`studentId`),
			KEY `FK_d0a1f4272790a2897c7ff2cbcaf` (`workId`),
			CONSTRAINT `FK_d0a1f4272790a2897c7ff2cbcaf` FOREIGN KEY (`workId`) REFERENCES `work` (`id`),
			CONSTRAINT `FK_d5a5deb045955cf68b9123443cf` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assigned_work_answer`
--
DROP TABLE IF EXISTS `assigned_work_answer`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`assigned_work_answer` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`slug` varchar(255) NOT NULL,
		`word` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
			`taskId` varchar(255) DEFAULT NULL,
			`assignedWorkId` varchar(255) DEFAULT NULL,
			`content` longtext CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin,
			PRIMARY KEY (`id`),
			KEY `FK_2b0ac7df7510ab4c57129ee96b5` (`taskId`),
			KEY `FK_e340c60c56c0d91f34ac93e7d2c` (`assignedWorkId`),
			CONSTRAINT `FK_2b0ac7df7510ab4c57129ee96b5` FOREIGN KEY (`taskId`) REFERENCES `work_task` (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assigned_work_comment`
--
DROP TABLE IF EXISTS `assigned_work_comment`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`assigned_work_comment` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`slug` varchar(255) NOT NULL,
		`content` longtext CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`score` float NOT NULL,
			`taskId` varchar(255) DEFAULT NULL,
			`assignedWorkId` varchar(255) DEFAULT NULL,
			`detailed_score` longtext CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin,
			PRIMARY KEY (`id`),
			KEY `FK_c3d0f77a4843b554b8711860cb8` (`taskId`),
			KEY `FK_af11d390d482785c8184ac5b2d0` (`assignedWorkId`),
			CONSTRAINT `FK_c3d0f77a4843b554b8711860cb8` FOREIGN KEY (`taskId`) REFERENCES `work_task` (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assigned_work_mentors_user`
--
DROP TABLE IF EXISTS `assigned_work_mentors_user`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`assigned_work_mentors_user` (
		`assignedWorkId` varchar(255) NOT NULL,
		`userId` varchar(255) NOT NULL,
		PRIMARY KEY (`assignedWorkId`, `userId`),
		KEY `IDX_effbcd17c11ba0a6d40df13ce5` (`assignedWorkId`),
		KEY `IDX_b74d09864361e5f2229ea9788a` (`userId`),
		CONSTRAINT `FK_b74d09864361e5f2229ea9788ad` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
		CONSTRAINT `FK_effbcd17c11ba0a6d40df13ce55` FOREIGN KEY (`assignedWorkId`) REFERENCES `assigned_work` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `blog_post`
--
DROP TABLE IF EXISTS `blog_post`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`blog_post` (
		`id` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
			`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
			`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
			`title` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`content` json NOT NULL,
			`tags` text CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`reaction_counts` json NOT NULL,
			`authorId` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
			`pollId` varchar(255) DEFAULT NULL,
			PRIMARY KEY (`id`),
			UNIQUE KEY `REL_448822ded3f863f79ae10d3735` (`pollId`),
			KEY `FK_657e11001f05ef48b5383f5a637` (`authorId`),
			CONSTRAINT `FK_448822ded3f863f79ae10d37357` FOREIGN KEY (`pollId`) REFERENCES `poll` (`id`),
			CONSTRAINT `FK_657e11001f05ef48b5383f5a637` FOREIGN KEY (`authorId`) REFERENCES `user` (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = latin1;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `blog_post_reaction`
--
DROP TABLE IF EXISTS `blog_post_reaction`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`blog_post_reaction` (
		`id` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
			`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
			`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
			`reaction` varchar(255) NOT NULL,
			`postId` varchar(255) DEFAULT NULL,
			`userId` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
			PRIMARY KEY (`id`),
			KEY `FK_8aed7a6d9288516ab753f0349b1` (`userId`),
			CONSTRAINT `FK_8aed7a6d9288516ab753f0349b1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = latin1;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `calender_event`
--
DROP TABLE IF EXISTS `calender_event`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`calender_event` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`title` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`description` text CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`url` varchar(255) NOT NULL,
			`type` enum (
				'student-deadline',
				'mentor-deadline',
				'work-checked',
				'work-made',
				'event'
			) NOT NULL DEFAULT 'event',
			`date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
			`username` varchar(255) NOT NULL,
			`visibility` enum (
				'all',
				'own-students',
				'all-mentors',
				'own-mentor',
				'private'
			) NOT NULL DEFAULT 'private',
			`assignedWorkId` varchar(255) DEFAULT NULL,
			PRIMARY KEY (`id`),
			KEY `FK_a8547b3392f8c2203ba2c5f6776` (`assignedWorkId`),
			CONSTRAINT `FK_a8547b3392f8c2203ba2c5f6776` FOREIGN KEY (`assignedWorkId`) REFERENCES `assigned_work` (`id`) ON DELETE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course`
--
DROP TABLE IF EXISTS `course`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`course` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`slug` varchar(255) NOT NULL,
		`name` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`description` text NOT NULL,
			`authorId` varchar(255) DEFAULT NULL,
			`subjectId` varchar(255) DEFAULT NULL,
			PRIMARY KEY (`id`),
			KEY `FK_98522d97c4ecc30c636f5f5115e` (`authorId`),
			KEY `FK_33b8f63c3518fa33a82e3779253` (`subjectId`),
			CONSTRAINT `FK_33b8f63c3518fa33a82e3779253` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`id`),
			CONSTRAINT `FK_98522d97c4ecc30c636f5f5115e` FOREIGN KEY (`authorId`) REFERENCES `user` (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_assignment`
--
DROP TABLE IF EXISTS `course_assignment`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`course_assignment` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`studentId` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
			`courseId` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
			`assignerId` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
			`is_archived` tinyint NOT NULL DEFAULT '0',
			PRIMARY KEY (`id`),
			KEY `FK_e708883b96f046f6f04fa683e20` (`courseId`),
			KEY `FK_e7813065cdf2ffceed59673e142` (`studentId`),
			KEY `FK_5ed4390c91a01460123ad6c5255` (`assignerId`),
			CONSTRAINT `FK_5ed4390c91a01460123ad6c5255` FOREIGN KEY (`assignerId`) REFERENCES `user` (`id`) ON DELETE SET NULL,
			CONSTRAINT `FK_e708883b96f046f6f04fa683e20` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE,
			CONSTRAINT `FK_e7813065cdf2ffceed59673e142` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON DELETE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_chapter`
--
DROP TABLE IF EXISTS `course_chapter`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`course_chapter` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`name` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`slug` varchar(255) NOT NULL,
			`courseId` varchar(255) DEFAULT NULL,
			`order` int NOT NULL,
			`is_active` tinyint NOT NULL DEFAULT '0',
			PRIMARY KEY (`id`),
			KEY `FK_2665491bd44cc8d4159c7db7d31` (`courseId`),
			CONSTRAINT `FK_2665491bd44cc8d4159c7db7d31` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_material`
--
DROP TABLE IF EXISTS `course_material`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`course_material` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`slug` varchar(255) NOT NULL,
		`name` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`description` text CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`content` longtext CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`chapterId` varchar(255) DEFAULT NULL,
			`workId` varchar(255) DEFAULT NULL,
			`order` int NOT NULL DEFAULT '0',
			`work_solve_deadline` timestamp NULL DEFAULT NULL,
			`work_check_deadline` timestamp NULL DEFAULT NULL,
			`is_active` tinyint NOT NULL DEFAULT '0',
			`pollId` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
			`activate_at` timestamp(6) NULL DEFAULT NULL,
			`is_work_available` tinyint NOT NULL DEFAULT '1',
			PRIMARY KEY (`id`),
			KEY `FK_07c90ceb4b7e2a4a255ec4e7762` (`chapterId`),
			KEY `FK_95c1e1d8f8fc11858b12424bb04` (`workId`),
			CONSTRAINT `FK_07c90ceb4b7e2a4a255ec4e7762` FOREIGN KEY (`chapterId`) REFERENCES `course_chapter` (`id`) ON DELETE CASCADE,
			CONSTRAINT `FK_95c1e1d8f8fc11858b12424bb04` FOREIGN KEY (`workId`) REFERENCES `work` (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_material_reaction`
--
DROP TABLE IF EXISTS `course_material_reaction`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`course_material_reaction` (
		`id` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
			`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
			`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
			`reaction` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
			`materialId` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
			`userId` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
			PRIMARY KEY (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_request`
--
DROP TABLE IF EXISTS `course_request`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`course_request` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`course_id` varchar(255) NOT NULL,
		`email` varchar(255) NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event`
--
DROP TABLE IF EXISTS `event`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`event` (
		`id` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
			`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
			`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
			`type` enum ('download-course-file') COLLATE utf8mb4_general_ci NOT NULL,
			`payload` json NOT NULL,
			`userId` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
			PRIMARY KEY (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faq_article`
--
DROP TABLE IF EXISTS `faq_article`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`faq_article` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`for` text NOT NULL,
		`title` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`content` longtext CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`order` int NOT NULL DEFAULT '0',
			`categoryId` varchar(255) DEFAULT NULL,
			PRIMARY KEY (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faq_category`
--
DROP TABLE IF EXISTS `faq_category`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`faq_category` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`name` varchar(255) NOT NULL,
		`order` int NOT NULL DEFAULT '0',
		`parentCategoryId` varchar(255) DEFAULT NULL,
		PRIMARY KEY (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faq_category_closure`
--
DROP TABLE IF EXISTS `faq_category_closure`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`faq_category_closure` (
		`ancestorId` varchar(255) NOT NULL,
		`descendantId` varchar(255) NOT NULL,
		PRIMARY KEY (`ancestorId`, `descendantId`),
		KEY `IDX_a5f0cd556d964f1336ad47c71c` (`ancestorId`),
		KEY `IDX_7c05c81d2e284926db8c65fef4` (`descendantId`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `google_sheets_binding`
--
DROP TABLE IF EXISTS `google_sheets_binding`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`google_sheets_binding` (
		`id` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
			`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
			`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
			`entity_name` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
			`entity_selector` longtext CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`google_oauth_token` text CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci,
			`status` enum ('active', 'inactive', 'error') CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
			`frequency` enum ('hourly', 'daily', 'weekly', 'monthly') CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'daily',
			`name` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
			`google_refresh_token` text CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci,
			`last_run_at` timestamp(6) NULL DEFAULT NULL,
			`file_path` text CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
			`google_credentials` json DEFAULT NULL,
			`last_error_text` text CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci,
			PRIMARY KEY (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `media`
--
DROP TABLE IF EXISTS `media`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`media` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`src` varchar(1024) NOT NULL,
		`mime_type` enum ('image/jpeg', 'image/png', 'application/pdf') NOT NULL,
		`courseMaterialId` varchar(255) DEFAULT NULL,
		`courseId` varchar(255) DEFAULT NULL,
		`name` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`pollAnswerId` varchar(255) DEFAULT NULL,
			`blogPostId` varchar(255) DEFAULT NULL,
			`order` int NOT NULL DEFAULT '0',
			PRIMARY KEY (`id`),
			KEY `FK_92ac27f1c007f520b4df39bbeff` (`courseMaterialId`),
			KEY `FK_f1a37d00aa49aee56e34bc4c54c` (`courseId`),
			KEY `FK_e6e40efea48663d30cd7e004792` (`pollAnswerId`),
			CONSTRAINT `FK_92ac27f1c007f520b4df39bbeff` FOREIGN KEY (`courseMaterialId`) REFERENCES `course_material` (`id`) ON DELETE CASCADE,
			CONSTRAINT `FK_e6e40efea48663d30cd7e004792` FOREIGN KEY (`pollAnswerId`) REFERENCES `poll_answer` (`id`) ON DELETE SET NULL,
			CONSTRAINT `FK_f1a37d00aa49aee56e34bc4c54c` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mentor_assignment`
--
DROP TABLE IF EXISTS `mentor_assignment`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`mentor_assignment` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`mentorId` varchar(255) DEFAULT NULL,
		`studentId` varchar(255) DEFAULT NULL,
		`subjectId` varchar(255) DEFAULT NULL,
		PRIMARY KEY (`id`),
		KEY `FK_4d5c7b17048d35975a7c22ca71e` (`mentorId`),
		KEY `FK_72b01e9e0be6768a1804e68bf01` (`studentId`),
		KEY `FK_dc453257b8cb49d54ed10e20c38` (`subjectId`),
		CONSTRAINT `FK_4d5c7b17048d35975a7c22ca71e` FOREIGN KEY (`mentorId`) REFERENCES `user` (`id`),
		CONSTRAINT `FK_72b01e9e0be6768a1804e68bf01` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`),
		CONSTRAINT `FK_dc453257b8cb49d54ed10e20c38` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification`
--
DROP TABLE IF EXISTS `notification`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`notification` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`title` varchar(255) NOT NULL,
		`message` text CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin,
			`link` varchar(255) DEFAULT NULL,
			`status` enum ('read', 'unread') NOT NULL DEFAULT 'unread',
			`type` varchar(255) NOT NULL,
			`userId` varchar(255) DEFAULT NULL,
			`is_banner` tinyint NOT NULL DEFAULT '0',
			PRIMARY KEY (`id`),
			KEY `FK_sdcnp4i3n4r3n4l2rk3` (`userId`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `poll`
--
DROP TABLE IF EXISTS `poll`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`poll` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`title` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`description` text CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin,
			`can_vote` text CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
			`can_see_results` text CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
			`require_auth` tinyint NOT NULL DEFAULT '0',
			`stop_at` timestamp NULL DEFAULT NULL,
			`is_stopped` tinyint NOT NULL DEFAULT '0',
			`voted_count` int NOT NULL DEFAULT '0',
			PRIMARY KEY (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = latin1;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `poll_answer`
--
DROP TABLE IF EXISTS `poll_answer`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`poll_answer` (
		`id` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
			`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
			`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
			`question_type` enum (
				'text',
				'number',
				'date',
				'file',
				'choice',
				'rating'
			) NOT NULL,
			`text` text CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin,
			`number` int DEFAULT NULL,
			`date` timestamp NULL DEFAULT NULL,
			`choices` text CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin,
			`rating` int DEFAULT NULL,
			`questionId` varchar(255) DEFAULT NULL,
			`userId` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
			`user_auth_type` varchar(255) NOT NULL DEFAULT 'api',
			`user_auth_identifier` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
			`user_auth_data` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
			PRIMARY KEY (`id`),
			KEY `FK_9e6ed2837d53b2009c0fe34af5a` (`questionId`),
			KEY `FK_650b099675459b4b4eb3a06e03d` (`userId`),
			CONSTRAINT `FK_650b099675459b4b4eb3a06e03d` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
			CONSTRAINT `FK_9e6ed2837d53b2009c0fe34af5a` FOREIGN KEY (`questionId`) REFERENCES `poll_question` (`id`) ON DELETE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = latin1;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `poll_question`
--
DROP TABLE IF EXISTS `poll_question`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`poll_question` (
		`id` varchar(255) NOT NULL,
		`order` int NOT NULL DEFAULT '0',
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`text` text CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`description` text CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin,
			`type` enum (
				'text',
				'number',
				'date',
				'file',
				'choice',
				'rating'
			) NOT NULL,
			`required` tinyint NOT NULL DEFAULT '1',
			`choices` text CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin,
			`min_choices` int DEFAULT NULL,
			`max_choices` int DEFAULT NULL,
			`min_rating` int DEFAULT NULL,
			`max_rating` int DEFAULT NULL,
			`only_integer_rating` tinyint NOT NULL DEFAULT '0',
			`max_file_size` int DEFAULT NULL,
			`max_file_count` int DEFAULT NULL,
			`allowed_file_types` text CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci,
			`min_length` int DEFAULT NULL,
			`max_length` int DEFAULT NULL,
			`min_value` int DEFAULT NULL,
			`max_value` int DEFAULT NULL,
			`only_integer_value` tinyint NOT NULL DEFAULT '0',
			`only_future_date` tinyint NOT NULL DEFAULT '0',
			`only_past_date` tinyint NOT NULL DEFAULT '0',
			`pollId` varchar(255) DEFAULT NULL,
			PRIMARY KEY (`id`),
			KEY `FK_cbf32fde59a0d705dfa23ba0346` (`pollId`),
			CONSTRAINT `FK_cbf32fde59a0d705dfa23ba0346` FOREIGN KEY (`pollId`) REFERENCES `poll` (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = latin1;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `poll_voted_users_user`
--
DROP TABLE IF EXISTS `poll_voted_users_user`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`poll_voted_users_user` (
		`pollId` varchar(255) NOT NULL,
		`userId` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
			PRIMARY KEY (`pollId`, `userId`),
			KEY `IDX_b1deb8f9b0e4f7533d04a9a88b` (`pollId`),
			KEY `IDX_6ef48a2fdae11dd87f3dba2d28` (`userId`),
			CONSTRAINT `FK_6ef48a2fdae11dd87f3dba2d282` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
			CONSTRAINT `FK_b1deb8f9b0e4f7533d04a9a88b3` FOREIGN KEY (`pollId`) REFERENCES `poll` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = latin1;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `session`
--
DROP TABLE IF EXISTS `session`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`session` (
		`id` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
			`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
			`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
			`user_agent` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
			`is_mobile` tinyint NOT NULL,
			`browser` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
			`os` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
			`device` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
			`ip_address` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
			`last_request_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
			`userId` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
			PRIMARY KEY (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `snippet`
--
DROP TABLE IF EXISTS `snippet`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`snippet` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`name` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`content` longtext CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`userId` varchar(255) DEFAULT NULL,
			PRIMARY KEY (`id`),
			KEY `FK_da314b917a063a91ffbc59b28e6` (`userId`),
			CONSTRAINT `FK_da314b917a063a91ffbc59b28e6` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subject`
--
DROP TABLE IF EXISTS `subject`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`subject` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`name` varchar(255) CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`color` varchar(255) NOT NULL,
			PRIMARY KEY (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--
DROP TABLE IF EXISTS `user`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`user` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`username` varchar(255) NOT NULL,
		`slug` varchar(255) NOT NULL,
		`role` enum ('student', 'mentor', 'teacher', 'admin') NOT NULL DEFAULT 'student',
		`name` varchar(255) NOT NULL,
		`email` varchar(255) NOT NULL,
		`telegram_id` varchar(255) DEFAULT NULL,
		`telegram_username` varchar(255) DEFAULT NULL,
		`password` varchar(255) DEFAULT NULL,
		`is_blocked` tinyint NOT NULL DEFAULT '0',
		`forbidden` int NOT NULL DEFAULT '0',
		`verification_token` varchar(255) DEFAULT NULL,
		`new_email` varchar(255) DEFAULT NULL,
		`avatarId` varchar(255) CHARACTER
		SET
			utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
			`telegram_notifications_enabled` tinyint NOT NULL DEFAULT '1',
			PRIMARY KEY (`id`),
			UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`),
			UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`),
			UNIQUE KEY `IDX_58f5c71eaab331645112cf8cfa` (`avatarId`),
			UNIQUE KEY `REL_58f5c71eaab331645112cf8cfa` (`avatarId`),
			KEY `FK_58f5c71eaab331645112cf8cfa5` (`avatarId`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_avatar`
--
DROP TABLE IF EXISTS `user_avatar`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`user_avatar` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`avatar_type` enum ('telegram', 'custom') NOT NULL DEFAULT 'custom',
		`telegram_avatar_url` varchar(255) DEFAULT NULL,
		`mediaId` varchar(255) DEFAULT NULL,
		PRIMARY KEY (`id`),
		UNIQUE KEY `REL_2e4ee4aca05bad6572574c6811` (`mediaId`),
		CONSTRAINT `FK_2e4ee4aca05bad6572574c68110` FOREIGN KEY (`mediaId`) REFERENCES `media` (`id`) ON DELETE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_settings`
--
DROP TABLE IF EXISTS `user_settings`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`user_settings` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`backgroundImageId` varchar(255) DEFAULT NULL,
		`userId` varchar(255) NOT NULL,
		PRIMARY KEY (`id`),
		UNIQUE KEY `REL_2e4ee4acawedfe11` (`userId`),
		UNIQUE KEY `REL_2e4ee4aca0weded` (`backgroundImageId`),
		CONSTRAINT `FK_2e4ee4aca0wwweew10` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
		CONSTRAINT `FK_2e4ee4acedwed6572574c68110` FOREIGN KEY (`backgroundImageId`) REFERENCES `media` (`id`) ON DELETE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `work`
--
DROP TABLE IF EXISTS `work`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`work` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`slug` varchar(255) NOT NULL,
		`name` varchar(255) NOT NULL,
		`description` text NOT NULL,
		`type` enum (
			'trial-work',
			'phrase',
			'mini-test',
			'test',
			'second-part'
		) NOT NULL DEFAULT 'test',
		`subjectId` varchar(255) DEFAULT NULL,
		PRIMARY KEY (`id`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `work_task`
--
DROP TABLE IF EXISTS `work_task`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
	`work_task` (
		`id` varchar(255) NOT NULL,
		`created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
		`updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
		`slug` varchar(255) NOT NULL,
		`content` longtext CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			`highest_score` int NOT NULL,
			`type` enum ('text', 'word', 'essay', 'final-essay') NOT NULL DEFAULT 'text',
			`right_answer` varchar(255) DEFAULT NULL,
			`workId` varchar(255) DEFAULT NULL,
			`order` int NOT NULL,
			`checking_strategy` enum ('type1', 'type2', 'type3', 'type4') DEFAULT NULL,
			`solve_hint` longtext CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin,
			`check_hint` longtext CHARACTER
		SET
			utf8mb4 COLLATE utf8mb4_bin,
			`is_answer_visible_before_check` tinyint NOT NULL DEFAULT '0',
			PRIMARY KEY (`id`),
			KEY `FK_1cc5c4cfd0931bb1962860c6e59` (`workId`),
			CONSTRAINT `FK_1cc5c4cfd0931bb1962860c6e59` FOREIGN KEY (`workId`) REFERENCES `work` (`id`) ON DELETE CASCADE
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;