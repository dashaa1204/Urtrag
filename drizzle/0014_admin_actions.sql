CREATE TYPE "public"."admin_action" AS ENUM('listing_close', 'listing_reopen', 'listing_delete', 'verification_approve', 'verification_reject');--> statement-breakpoint
CREATE TABLE "admin_actions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_actions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"actor_id" uuid NOT NULL,
	"actor_name" text NOT NULL,
	"action" "admin_action" NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_admin_actions_created" ON "admin_actions" USING btree ("created_at");--> statement-breakpoint
-- Бусад хүснэгтийн адил RLS-ийг асааж, policy огт үүсгэхгүй: Supabase-ийн
-- нийтэд нээлттэй REST API (anon / authenticated) энэ хүснэгтээс юу ч уншиж
-- чадахгүй. Хэн юуг устгасан гэдэг түүх нь хэрэглэгчид харагдах ёсгүй.
ALTER TABLE "admin_actions" ENABLE ROW LEVEL SECURITY;