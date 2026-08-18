ALTER TABLE "conversations" ADD COLUMN "accepted_at" timestamp with time zone;--> statement-breakpoint
-- Одоо тохирсон байгаа хэлцлүүдэд утгыг нь нөхнө. Цуцлагдчихсан хуучин
-- хэлцлүүдийн анхны тохирсон хугацааг сэргээх боломжгүй тул NULL хэвээр
-- үлдэнэ — тэдгээрт үнэлгээ өгөх боломж хаагдана.
UPDATE "conversations"
SET "accepted_at" = COALESCE("deal_decided_at", "created_at")
WHERE "deal_status" = 'accepted';
