-- Supabase Auth-тай холбох хэсэг. Drizzle нь auth схемийг мэддэггүй тул
-- эдгээрийг гараар бичнэ.

-- 1) profiles.id нь auth.users.id-тай заавал таарна. Хэрэглэгчийг устгахад
--    профайл болон түүний бүх зар/мессеж (cascade) дагаж устана.
ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_id_auth_users_fk"
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
--> statement-breakpoint

-- 2) Шинэ хэрэглэгч бүртгүүлэхэд profiles мөрийг автоматаар үүсгэнэ.
--    Нэр/утас нь signUp-ийн options.data-аас ирнэ.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''), 'Хэрэглэгч'),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'phone'), '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--> statement-breakpoint

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
--> statement-breakpoint

-- 3) RLS-ийг бүх хүснэгт дээр асаана. Policy огт үүсгэхгүй тул Supabase-ийн
--    нийтэд нээлттэй REST API (anon / authenticated түлхүүр) эдгээр хүснэгтээс
--    юу ч уншиж чадахгүй. Аппын сервер тал нь DATABASE_URL-ээр шууд холбогддог
--    (хүснэгтийн эзэн эрхээр) тул RLS-д хамаарахгүй бөгөөд хандах эрхийн
--    шалгалт server action-уудад хэвээр хийгдэнэ.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "trips" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "shipments" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
