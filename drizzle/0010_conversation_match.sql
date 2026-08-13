-- Хүсэлт илгээхэд эхлүүлэгч өөрийн хос зараа (аялал ↔ ачаа) сонгодог болсон.
-- Хуучин яриануудад сонголт байхгүй тул багана NULL зөвшөөрнө.
ALTER TABLE "conversations" ADD COLUMN "matched_listing_id" integer;
