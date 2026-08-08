import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Админ эрхтэй клиент (хэрэглэгч устгах, seed). SERVICE_ROLE түлхүүр нь RLS-ийг
 * бүрэн тойрдог тул браузерт хэзээ ч гаргаж болохгүй.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL болон SUPABASE_SERVICE_ROLE_KEY тохируулаагүй байна.");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
