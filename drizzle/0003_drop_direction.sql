ALTER TABLE "shipments" DROP COLUMN "direction";--> statement-breakpoint
ALTER TABLE "trips" DROP COLUMN "direction";--> statement-breakpoint
DROP TYPE "public"."direction";