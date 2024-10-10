CREATE TABLE IF NOT EXISTS "socials_friend_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" varchar(255) NOT NULL,
	"receiver_id" varchar(255) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials_swipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"swiper_id" varchar(255) NOT NULL,
	"swiped_id" varchar(255) NOT NULL,
	"direction" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_friend_requests" ADD CONSTRAINT "socials_friend_requests_sender_id_socials_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_friend_requests" ADD CONSTRAINT "socials_friend_requests_receiver_id_socials_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_swipes" ADD CONSTRAINT "socials_swipes_swiper_id_socials_user_id_fk" FOREIGN KEY ("swiper_id") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_swipes" ADD CONSTRAINT "socials_swipes_swiped_id_socials_user_id_fk" FOREIGN KEY ("swiped_id") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
