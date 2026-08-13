import { cache } from "react";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "./db";
import { profiles } from "./db/schema";
import { internalPath } from "./nav";
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

  const emailVerified = Boolean(user.email_confirmed_at);

  const [profile] = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      phone: profiles.phone,
      country: profiles.country,
      bio: profiles.bio,
      avatarPath: profiles.avatarPath,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  // Профайл нь auth.users дээрх trigger-ээр үүсдэг. Ямар нэг шалтгаанаар
  // үүсээгүй бол metadata-аас сэргээж, тасалдал үүсгэхгүй.
  if (!profile) {
    const name = (user.user_metadata?.name as string | undefined)?.trim() || "Хэрэглэгч";
    const phone = (user.user_metadata?.phone as string | undefined)?.trim() || null;
    await db.insert(profiles).values({ id: user.id, name, phone }).onConflictDoNothing();
    return {
      id: user.id,
      email: user.email ?? "",
      name,
      phone,
      country: null,
      bio: null,
      avatarPath: null,
      emailVerified,
      createdAt: new Date(),
    };
  }

  return {
    id: profile.id,
    email: user.email ?? "",
    name: profile.name,
    phone: profile.phone,
    country: profile.country,
    bio: profile.bio,
    avatarPath: profile.avatarPath,
    emailVerified,
    createdAt: profile.createdAt,
  };
});

/**
 * Хянагчийн эрх. Тусдаа хүснэгт барихын оронд орчны хувьсагчид id-г нь
 * жагсаана — хянагч цөөхөн бөгөөд эрхийг код байрлуулалтаар л өөрчилнө.
 */
function adminIds(): string[] {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAdmin(user: SessionUser | null): boolean {
  return Boolean(user && adminIds().includes(user.id));
}

/** Хянагч биш бол 404 — админ хуудас байгаа эсэхийг ч мэдэгдэхгүй. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!isAdmin(user)) notFound();
  return user as SessionUser;
}

/** Нэвтрээгүй бол /login руу шилжүүлнэ. next нь зөвхөн дотоод зам байх ёстой. */
export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const target = internalPath(next);
    redirect(target ? `/login?next=${encodeURIComponent(target)}` : "/login");
  }
  return user;
}
