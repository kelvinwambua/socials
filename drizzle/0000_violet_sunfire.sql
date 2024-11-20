CREATE TABLE IF NOT EXISTS "socials_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "socials_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials_approved_schools" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"domain" varchar(100) NOT NULL,
	CONSTRAINT "socials_approved_schools_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials_conversation_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"last_read" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"date" timestamp NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials_friend_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" varchar(255) NOT NULL,
	"receiver_id" varchar(255) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials_like" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"post_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'sent' NOT NULL
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
CREATE TABLE IF NOT EXISTS "socials_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(500) NOT NULL,
	"type" varchar(20) NOT NULL,
	"media" varchar(255),
	"created_by" varchar(255) NOT NULL,
	"likes_count" integer DEFAULT 0,
	"comments_count" integer DEFAULT 0,
	"shares_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials_product" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(225) NOT NULL,
	"description" text,
	"category" text,
	"price" integer NOT NULL,
	"seller_id" varchar(225) NOT NULL,
	"image" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
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
CREATE TABLE IF NOT EXISTS "socials_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "socials_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_account" ADD CONSTRAINT "socials_account_user_id_socials_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_conversation_participants" ADD CONSTRAINT "socials_conversation_participants_conversation_id_socials_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."socials_conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_conversation_participants" ADD CONSTRAINT "socials_conversation_participants_user_id_socials_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_events" ADD CONSTRAINT "socials_events_created_by_socials_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
 ALTER TABLE "socials_like" ADD CONSTRAINT "socials_like_user_id_socials_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_like" ADD CONSTRAINT "socials_like_post_id_socials_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."socials_post"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_messages" ADD CONSTRAINT "socials_messages_conversation_id_socials_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."socials_conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_messages" ADD CONSTRAINT "socials_messages_sender_id_socials_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_post" ADD CONSTRAINT "socials_post_created_by_socials_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_product" ADD CONSTRAINT "socials_product_seller_id_socials_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "socials_session" ADD CONSTRAINT "socials_session_user_id_socials_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."socials_user"("id") ON DELETE no action ON UPDATE no action;
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
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "socials_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_post_idx" ON "socials_like" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_by_idx" ON "socials_post" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "socials_post" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "socials_session" USING btree ("user_id");