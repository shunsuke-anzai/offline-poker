ALTER TABLE "rooms" RENAME COLUMN "members" TO "max_members";--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "stack" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "bb" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "player_names" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "current_members";