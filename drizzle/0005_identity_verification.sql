CREATE TYPE "public"."verification_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "identity_verifications" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"status" "verification_status" DEFAULT 'pending' NOT NULL,
	"front_path" text,
	"back_path" text,
	"social_url" text,
	"note" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_verifications_status" ON "identity_verifications" USING btree ("status","submitted_at");--> statement-breakpoint
-- Бусад хүснэгтийн адил RLS-ийг асаана: Supabase-ийн нээлттэй REST API-аар
-- (anon түлхүүр) энэ хүснэгтэд хандах боломжгүй болно. Апп нь DATABASE_URL-ээр
-- шууд холбогддог тул хэвийн ажиллана.
ALTER TABLE "identity_verifications" ENABLE ROW LEVEL SECURITY;
