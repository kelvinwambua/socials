CREATE TABLE IF NOT EXISTS "socials_approved_schools" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"domain" varchar(100) NOT NULL,
	CONSTRAINT "socials_approved_schools_domain_unique" UNIQUE("domain")
);
