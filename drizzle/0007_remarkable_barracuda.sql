-- Create the 'socials_like' table if it doesn't exist
CREATE TABLE IF NOT EXISTS "socials_like" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar(255) NOT NULL,
  "post_id" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add foreign key for 'user_id' referencing 'socials_user'
DO $$ 
BEGIN
  ALTER TABLE "socials_like" 
  ADD CONSTRAINT "socials_like_user_id_socials_user_id_fk" 
  FOREIGN KEY ("user_id") 
  REFERENCES "public"."socials_user"("id") 
  ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add foreign key for 'post_id' referencing 'socials_post'
DO $$ 
BEGIN
  ALTER TABLE "socials_like" 
  ADD CONSTRAINT "socials_like_post_id_socials_post_id_fk" 
  FOREIGN KEY ("post_id") 
  REFERENCES "public"."socials_post"("id") 
  ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create an index if it doesn't already exist
CREATE INDEX IF NOT EXISTS "user_post_idx" 
ON "socials_like" USING btree ("user_id", "post_id");
