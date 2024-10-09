CREATE TABLE IF NOT EXISTS "socials_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"bio" text,
	"university" varchar NOT NULL,
	"major" varchar NOT NULL,
	"graduation_year" integer NOT NULL,
	"interests" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "socials_profiles_user_id_unique" UNIQUE("user_id")
);
