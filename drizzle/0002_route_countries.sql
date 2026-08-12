-- Чиглэл нь Австри↔Монгол хоёр утгаар хязгаарлагдаж байсныг улс хоорондын
-- чөлөөт хос болгож өргөтгөв. Эхлээд багануудыг хоосноор нэмж, хуучин мөрүүдийг
-- direction-оос нь дүгнэн дүүргээд, дараа нь NOT NULL болгоно.
ALTER TABLE "shipments" ADD COLUMN "from_country" text;--> statement-breakpoint
ALTER TABLE "shipments" ADD COLUMN "to_country" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "from_country" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "to_country" text;--> statement-breakpoint
UPDATE "trips" SET
  "from_country" = CASE WHEN "direction" = 'mn-at' THEN 'MN' ELSE 'AT' END,
  "to_country" = CASE WHEN "direction" = 'mn-at' THEN 'AT' ELSE 'MN' END;--> statement-breakpoint
UPDATE "shipments" SET
  "from_country" = CASE WHEN "direction" = 'mn-at' THEN 'MN' ELSE 'AT' END,
  "to_country" = CASE WHEN "direction" = 'mn-at' THEN 'AT' ELSE 'MN' END;--> statement-breakpoint
-- Хотын нэрийг жагсаалтын англи бичлэгт нийцүүлнэ
UPDATE "trips" SET
  "from_city" = CASE "from_city" WHEN 'Вена' THEN 'Vienna' WHEN 'Улаанбаатар' THEN 'Ulaanbaatar' WHEN 'Грац' THEN 'Graz' ELSE "from_city" END,
  "to_city" = CASE "to_city" WHEN 'Вена' THEN 'Vienna' WHEN 'Улаанбаатар' THEN 'Ulaanbaatar' WHEN 'Грац' THEN 'Graz' ELSE "to_city" END;--> statement-breakpoint
UPDATE "shipments" SET
  "from_city" = CASE "from_city" WHEN 'Вена' THEN 'Vienna' WHEN 'Улаанбаатар' THEN 'Ulaanbaatar' WHEN 'Грац' THEN 'Graz' ELSE "from_city" END,
  "to_city" = CASE "to_city" WHEN 'Вена' THEN 'Vienna' WHEN 'Улаанбаатар' THEN 'Ulaanbaatar' WHEN 'Грац' THEN 'Graz' ELSE "to_city" END;--> statement-breakpoint
ALTER TABLE "shipments" ALTER COLUMN "from_country" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shipments" ALTER COLUMN "to_country" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ALTER COLUMN "from_country" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ALTER COLUMN "to_country" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_shipments_route" ON "shipments" USING btree ("from_country","to_country");--> statement-breakpoint
CREATE INDEX "idx_trips_route" ON "trips" USING btree ("from_country","to_country");
