CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room` text NOT NULL,
	`spot_direction` text NOT NULL,
	`spot_noun` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `pantry_items` ADD `location_id` integer NOT NULL REFERENCES locations(id);--> statement-breakpoint
ALTER TABLE `pantry_items` DROP COLUMN `location`;--> statement-breakpoint
ALTER TABLE `pantry_items` DROP COLUMN `remarks`;