DROP INDEX "conversations_accepted_listing_key";--> statement-breakpoint
DROP INDEX "conversations_accepted_match_key";--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "trip_id" integer GENERATED ALWAYS AS (case when listing_type = 'trip' then listing_id else matched_listing_id end) STORED;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "shipment_id" integer GENERATED ALWAYS AS (case when listing_type = 'shipment' then listing_id else matched_listing_id end) STORED;--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_accepted_shipment_key" ON "conversations" USING btree ("shipment_id") WHERE deal_status = 'accepted' and shipment_id is not null;--> statement-breakpoint
CREATE INDEX "idx_conversations_accepted_trip" ON "conversations" USING btree ("trip_id") WHERE deal_status = 'accepted';