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
