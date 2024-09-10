CREATE TABLE IF NOT EXISTS "goals" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"desired-weekly-freequency" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
