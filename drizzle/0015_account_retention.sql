CREATE TABLE "deleted_accounts" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"deleted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"retain_until" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "deleted_accounts" ADD CONSTRAINT "deleted_accounts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_deleted_accounts_retain" ON "deleted_accounts" USING btree ("retain_until");--> statement-breakpoint
-- auth.users устахад профайл (тэгээд cascade-аар бүх зар, яриа, мессеж,
-- үнэлгээ) дагаж устдаг байсан. Тохиролцоо хийсэн хүн ачааг аваад дансаа
-- устгавал хохирогчийн гарт ч нотлох баримт үлдэхгүй. FK-г хасаж, устгалыг
-- аппын код (lib/account-retention.ts) удирдана. Dashboard-аас устгагдсан
-- хэрэглэгчийн өнчин профайлыг өдөр бүрийн cron цэвэрлэнэ.
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_id_auth_users_fk";
--> statement-breakpoint
-- Бусад хүснэгтийн адил RLS асаалттай, policy байхгүй — нийтийн REST API
-- энэ хүснэгтээс юу ч уншиж чадахгүй.
ALTER TABLE "deleted_accounts" ENABLE ROW LEVEL SECURITY;
