CREATE TABLE IF NOT EXISTS "socials_school_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_name" varchar(255) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"additional_info" text,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
