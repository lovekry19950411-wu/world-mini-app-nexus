CREATE TABLE `loans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`borrowerId` int NOT NULL,
	`collateralAmount` decimal(20,8) NOT NULL,
	`loanAmount` decimal(20,8) NOT NULL,
	`interestRate` decimal(5,2) NOT NULL,
	`dueDate` timestamp NOT NULL,
	`repaidAmount` decimal(20,8) DEFAULT '0',
	`status` enum('active','repaid','defaulted') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lotteries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticketCount` int NOT NULL,
	`costPerTicket` decimal(20,8) NOT NULL,
	`costType` enum('wld','platform_token') NOT NULL,
	`drawDate` timestamp NOT NULL,
	`prizeAmount` decimal(20,8),
	`status` enum('pending','won','lost') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lotteries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nullifiers` (
	`nullifier` varchar(256) NOT NULL,
	`action` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`verifiedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nullifiers_nullifier` PRIMARY KEY(`nullifier`)
);
--> statement-breakpoint
CREATE TABLE `platformTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`source` enum('transaction_reward','activity_reward','referral','lottery_prize','loan_interest') NOT NULL,
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platformTokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('new','used') NOT NULL,
	`condition` enum('excellent','good','fair') DEFAULT 'good',
	`price` decimal(20,8) NOT NULL,
	`images` text,
	`status` enum('listed','sold','delisted') DEFAULT 'listed',
	`views` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int NOT NULL,
	`productId` int NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`transactionId` varchar(256),
	`status` enum('pending','completed','cancelled') DEFAULT 'pending',
	`platformTokenReward` decimal(20,8) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `borrowerIdx` ON `loans` (`borrowerId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `loans` (`status`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `lotteries` (`userId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `lotteries` (`status`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `nullifiers` (`userId`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `platformTokens` (`userId`);--> statement-breakpoint
CREATE INDEX `sellerIdx` ON `products` (`sellerId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `buyerIdx` ON `transactions` (`buyerId`);--> statement-breakpoint
CREATE INDEX `sellerIdx` ON `transactions` (`sellerId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `transactions` (`status`);