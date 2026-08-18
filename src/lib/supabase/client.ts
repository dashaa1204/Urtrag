import { createBrowserClient } from "@supabase/ssr";

// NEXT_PUBLIC_* хувьсагчийг build үед орлуулдаг тул түлхүүрээр нь биш,
// шууд бичиж уншина.
function env(key: string, value: string | undefined): string {
  if (!value) throw new Error(`${key} тохируулаагүй байна. .env.local файлаа шалгана уу.`);
  return value;
}

/**
 * Браузерын Supabase клиент. Өгөгдлийг сервер тал татдаг тул үүнийг зөвхөн
 * Realtime-д ашиглана. createBrowserClient нь өөрөө singleton бөгөөд session-оо
 * cookie-оос уншдаг учир RLS шалгалт нэвтэрсэн хэрэглэгчээр явна.
 */
export function createClient() {
  return createBrowserClient(
    env("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/**
 * Realtime захиалга үүсгэхэд ЗААВАЛ үүнийг ашиглана — createClient()-ийг шууд биш.
 *
 * Realtime нь RLS-ийг socket дээрх токеноор шалгадаг бөгөөд тухайн токеныг
 * захиалга (join) илгээх агшинд уншина. createBrowserClient нь session-оо
 * cookie-оос ASYNC уншдаг тул subscribe() түрүүлбэл join нь anon токеноор
 * явна. Тэр үед policy-ууд `TO authenticated` тул нэг ч мөр нэвтрэхгүй —
 * гэвч суваг "SUBSCRIBED" гэж хариулж, алдаа ч заахгүй тул чимээгүй унтардаг.
 *
 * Тиймээс захиалахаас өмнө токеноо ил тавина. Дараагийн шинэчлэлтийг
 * (TOKEN_REFRESHED) supabase-js өөрөө сувагт дамжуулна.
 */
export async function createRealtimeClient() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) supabase.realtime.setAuth(session.access_token);
  return supabase;
}
