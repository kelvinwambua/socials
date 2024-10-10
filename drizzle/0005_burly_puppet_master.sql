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
CREATE TABLE IF NOT EXISTS "socials_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'sent' NOT NULL
);
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
