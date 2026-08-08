import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function env(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} тохируулаагүй байна. .env.local файлаа шалгана уу.`);
  return value;
}

/** Server Component / Server Action-д зориулсан Supabase клиент. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component-оос дуудагдвал cookie бичих боломжгүй.
          // Session-ийг proxy.ts шинэчилдэг тул алгасаж болно.
        }
      },
    },
  });
}
