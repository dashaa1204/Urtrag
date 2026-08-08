import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase-ийн session токеныг сэргээж, шинэчилсэн cookie-г хариуд буцаана.
 * Server Component-ууд cookie бичиж чаддаггүй тул энэ давхарга шаардлагатай.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Токеныг шинэчилнэ. getUser() дуудахгүй бол хугацаа дуусахад хэрэглэгч гэнэт гарна.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Статик файл болон зургаас бусад бүх зам
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
