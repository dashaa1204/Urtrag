ALTER TABLE "reviews" ADD COLUMN "read_at" timestamp with time zone;--> statement-breakpoint
-- Хуучин үнэлгээг уншсанд тооцно — эс бөгөөс шинэ багана нэмсэн даруйд бүх
-- хэрэглэгчийн хонх дээр хуучин мэдэгдлүүд шинэ мэт цугларна.
UPDATE "reviews" SET "read_at" = now();
