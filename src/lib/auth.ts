import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "./db";
import { profiles } from "./db/schema";
import { createClient } from "./supabase/server";
import type { SessionUser } from "@/types";

/**
 * Нэвтэрсэн хэрэглэгчийг буцаана. auth.getUser() нь токеныг Supabase дээр
 * баталгаажуулдаг тул getSession()-оос найдвартай.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile] = await db
    .select({ id: profiles.id, name: profiles.name, phone: profiles.phone })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  // Профайл нь auth.users дээрх trigger-ээр үүсдэг. Ямар нэг шалтгаанаар
  // үүсээгүй бол metadata-аас сэргээж, тасалдал үүсгэхгүй.
  if (!profile) {
    const name = (user.user_metadata?.name as string | undefined)?.trim() || "Хэрэглэгч";
    const phone = (user.user_metadata?.phone as string | undefined)?.trim() || null;
    await db.insert(profiles).values({ id: user.id, name, phone }).onConflictDoNothing();
    return { id: user.id, email: user.email ?? "", name, phone };
  }

  return { id: profile.id, email: user.email ?? "", name: profile.name, phone: profile.phone };
});

/** Нэвтрээгүй бол /login руу шилжүүлнэ. next нь зөвхөн дотоод зам байх ёстой. */
export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const target =
      next && next.startsWith("/") && !next.startsWith("//") ? `/login?next=${encodeURIComponent(next)}` : "/login";
    redirect(target);
  }
  return user;
}
