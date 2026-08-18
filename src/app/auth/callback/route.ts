import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { internalPath } from "@/lib/nav";

/**
 * Имэйл баталгаажуулах / нууц үг сэргээх / Google-ээр нэвтрэх холбоосны буулт.
 * Supabase-ийн имэйл загвараас хамааран `token_hash` эсвэл `code` ирдэг тул
 * хоёуланг дэмжинэ. OAuth нь үргэлж `code` буцаана.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  // Нээлттэй redirect-ээс сэргийлэх шалгалт нэг л газарт (lib/nav.ts) байна.
  const next = internalPath(searchParams.get("next")) ?? "/";

  // Хэрэглэгч Google дээр цуцлах эсвэл эрх өгөхгүй бол код огт ирэхгүй.
  if (searchParams.get("error")) {
    return NextResponse.redirect(`${origin}/login?error=google`);
  }

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=link`);
}
