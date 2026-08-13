-- Мэдэгдлийг шууд (realtime) хүргэх хэсэг.
--
-- Мэдэгдлийн эх сурвалж нь хүлээж авсан үнэлгээ. 0007-той адил зарчим:
-- клиент зөвхөн "шинэ үнэлгээ орлоо" гэсэн дохиог сонсоод серверээс дахин
-- татна. Дохиог RLS-ээр шүүдэг тул үнэлгээ авсан хүн л мэдэгдлээ авна.

-- 1) Зөвхөн үнэлүүлсэн хүн өөрийнхөө авсан үнэлгээг уншина.
CREATE POLICY "reviews_select_reviewee" ON "reviews"
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = "reviewee_id");
--> statement-breakpoint

-- 2) Policy нь GRANT-ыг орлохгүй тул эрхийг ил зааж өгнө.
GRANT SELECT ON TABLE "reviews" TO authenticated;
--> statement-breakpoint

-- 3) reviews хүснэгтийг Realtime-ийн publication-д нэмнэ. Давхар нэмэхэд алдаа
--    өгдөг тул урьдчилж шалгана.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'reviews'
    )
  THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
  END IF;
END
$$;
