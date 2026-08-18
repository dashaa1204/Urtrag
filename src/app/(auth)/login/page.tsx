import type { Metadata } from "next";
import LoginView from "@/views/auth/login-view";

export const metadata: Metadata = { title: "Нэвтрэх", robots: { index: false, follow: false }, };

const ERRORS: Record<string, string> = {
  // /auth/callback холбоос хүчингүй эсвэл хугацаа нь дууссан үед
  link: "Баталгаажуулах холбоос хүчингүй эсвэл хугацаа нь дууссан байна.",
  google: "Google-ээр нэвтэрч чадсангүй. Дахин оролдоно уу.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <LoginView
      next={typeof next === "string" ? next : undefined}
      error={typeof error === "string" ? ERRORS[error] : undefined}
    />
  );
}
