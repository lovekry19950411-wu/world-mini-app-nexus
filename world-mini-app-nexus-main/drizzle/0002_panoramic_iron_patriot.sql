CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`referralCode` varchar(64),
	`rewardClaimed` int DEFAULT 0,
	`status` enum('pending','active','inactive') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskType` enum('daily_checkin','referral','transaction','social_share') NOT NULL,
	`status` enum('pending','completed','claimed') NOT NULL DEFAULT 'pending',
	`rewardAmount` decimal(20,8) NOT NULL,
	`rewardType` enum('nexus','wld') NOT NULL DEFAULT 'nexus',
	`metadata` text,
	`completedAt` timestamp,
	`claimedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokenExchanges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fromToken` enum('nexus','wld') NOT NULL,
	`toToken` enum('nexus','wld') NOT NULL,
	`fromAmount` decimal(20,8) NOT NULL,
	`toAmount` decimal(20,8) NOT NULL,
	`exchangeRate` decimal(20,8) NOT NULL,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`transactionHash` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `tokenExchanges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userTokenBalances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nexusBalance` decimal(20,8) NOT NULL DEFAULT '0',
	`wldBalance` decimal(20,8) NOT NULL DEFAULT '0',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userTokenBalances_id` PRIMARY KEY(`id`),
	CONSTRAINT `userTokenBalances_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `referrerIdx` ON `referrals` (`referrerId`);--> statement-breakpoint
CREATE INDEX `referredIdx` ON `referrals` (`referredUserId`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `tasks` (`userId`);--> statement-breakpoint
CREATE INDEX `taskTypeIdx` ON `tasks` (`taskType`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `tasks` (`status`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `tokenExchanges` (`userId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `tokenExchanges` (`status`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `userTokenBalances` (`userId`);