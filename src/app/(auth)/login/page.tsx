import type { Metadata } from "next";
import LoginView from "@/views/auth/login-view";

export const metadata: Metadata = { title: "Нэвтрэх" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return <LoginView next={typeof next === "string" ? next : undefined} />;
}
