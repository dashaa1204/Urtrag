import type { Metadata } from "next";
import LoginView from "@/views/auth/login-view";

export const metadata: Metadata = { title: "Нэвтрэх", robots: { index: false, follow: false }, };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <LoginView
      next={typeof next === "string" ? next : undefined}
      // /auth/callback холбоос хүчингүй эсвэл хугацаа нь дууссан үед
      error={error === "link" ? "Баталгаажуулах холбоос хүчингүй эсвэл хугацаа нь дууссан байна." : undefined}
    />
  );
}
