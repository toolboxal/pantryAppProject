CREATE TABLE `pantry_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date_bought` text NOT NULL,
	`date_expiry` text NOT NULL,
	`cost` real DEFAULT 0 NOT NULL,
	`consumed` integer DEFAULT false,
	`quantity` integer DEFAULT 1 NOT NULL,
	`amount` text DEFAULT 'full' NOT NULL,
	`category` text NOT NULL,
	`location` text NOT NULL,
	`remarks` text NOT NULL
);
