CREATE TABLE IF NOT EXISTS "socials_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"date" timestamp NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials_postData" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"shares" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "socials_post" ALTER COLUMN "name" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "socials_post" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "socials_post" ADD COLUMN "type" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "socials_post" ADD COLUMN "media" varchar(255);--> statement-breakpoint
ALTER TABLE "socials_post" ADD COLUMN "likes_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "socials_post" ADD COLUMN "comments_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "socials_post" ADD COLUMN "shares_count" integer DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_events" ADD CONSTRAINT "socials_events_created_by_socials_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_postData" ADD CONSTRAINT "socials_postData_post_id_socials_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."socials_post"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_postData" ADD CONSTRAINT "socials_postData_user_id_socials_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
