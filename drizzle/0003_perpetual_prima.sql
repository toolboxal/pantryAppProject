PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pantry_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date_bought` text NOT NULL,
	`date_expiry` text NOT NULL,
	`cost` text DEFAULT '0' NOT NULL,
	`consumed` integer DEFAULT false,
	`quantity` text DEFAULT '1' NOT NULL,
	`amount` text DEFAULT 'full' NOT NULL,
	`category` text NOT NULL,
	`location_id` integer NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_pantry_items`("id", "name", "date_bought", "date_expiry", "cost", "consumed", "quantity", "amount", "category", "location_id") SELECT "id", "name", "date_bought", "date_expiry", "cost", "consumed", "quantity", "amount", "category", "location_id" FROM `pantry_items`;--> statement-breakpoint
DROP TABLE `pantry_items`;--> statement-breakpoint
ALTER TABLE `__new_pantry_items` RENAME TO `pantry_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;