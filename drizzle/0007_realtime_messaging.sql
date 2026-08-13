-- Мессежийг шууд (realtime) хүргэх хэсэг.
--
-- Supabase Realtime нь postgres_changes мэдэгдлийг захиалагч бүрийн JWT-ээр
-- RLS-ээр шүүдэг. Тиймээс энд эхний удаа SELECT policy үүсгэж байна:
-- харилцан ярианы хоёр оролцогч л өөрийн мессежээ уншиж чадна. Бусад хүснэгт
-- policy-гүй хэвээр тул нээлттэй API-аар юу ч уншигдахгүй.
--
-- Аппын өгөгдөл татах ажил сервер талдаа (DATABASE_URL) хэвээр үлдэнэ —
-- клиент зөвхөн "шинэ мессеж ирлээ" гэсэн дохиог сонсоод дахин татдаг.

-- 1) Оролцогчид зориулсан унших эрх.
--    auth.uid()-г SELECT-ээр боож өгвөл мөр бүрт дахин тооцохгүй.
CREATE POLICY "conversations_select_participant" ON "conversations"
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IN ("starter_id", "owner_id"));
--> statement-breakpoint

CREATE POLICY "messages_select_participant" ON "messages"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM "conversations" c
      WHERE c."id" = "messages"."conversation_id"
        AND (SELECT auth.uid()) IN (c."starter_id", c."owner_id")
    )
  );
--> statement-breakpoint

-- 2) Policy нь GRANT-ыг орлохгүй тул эрхийг ил зааж өгнө.
GRANT SELECT ON TABLE "conversations" TO authenticated;
--> statement-breakpoint
GRANT SELECT ON TABLE "messages" TO authenticated;
--> statement-breakpoint

-- 3) messages хүснэгтийг Realtime-ийн publication-д нэмнэ. Publication нь
--    Supabase төсөл бүрт бэлэн байдаг ч давхар нэмэхэд алдаа өгдөг тул шалгана.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'messages'
    )
  THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END
$$;
