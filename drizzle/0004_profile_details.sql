-- Тохиргооны хуудсанд засах профайлын нэмэлт талбарууд.
-- Хоёулаа заавал биш: хуучин хэрэглэгчид хоосон утгатай үлдэнэ.
ALTER TABLE "profiles" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "bio" text;
