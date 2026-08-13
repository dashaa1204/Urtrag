CREATE TYPE "public"."deal_status" AS ENUM('pending', 'accepted', 'cancelled');--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "deal_status" "deal_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "deal_decided_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_accepted_listing_key" ON "conversations" USING btree ("listing_type","listing_id") WHERE deal_status = 'accepted';--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_accepted_match_key" ON "conversations" USING btree ("listing_type","matched_listing_id") WHERE deal_status = 'accepted' and matched_listing_id is not null;