ALTER TABLE `Session` ADD `token` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `Session_token_unique` ON `Session` (`token`);