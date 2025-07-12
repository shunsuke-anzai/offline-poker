CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"members" text NOT NULL,
	"stack" text NOT NULL,
	"bb" text NOT NULL,
	"keyword" text NOT NULL,
	"current_members" serial DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'waiting' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
