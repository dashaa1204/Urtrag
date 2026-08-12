import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import ResetPasswordView from "@/views/auth/reset-password-view";

export const metadata: Metadata = { title: "Шинэ нууц үг", robots: { index: false, follow: false }, };

export default async function ResetPasswordPage() {
  // Имэйл дэх холбоос /auth/callback дээр session үүсгэсэн байх ёстой.
  // Шууд орж ирвэл нэвтрэх хуудас руу шилжинэ.
  await requireUser("/reset-password");
  return <ResetPasswordView />;
}
