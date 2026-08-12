import type { Metadata } from "next";
import SignupView from "@/views/auth/signup-view";

export const metadata: Metadata = { title: "Бүртгүүлэх", robots: { index: false, follow: false }, };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  return <SignupView next={typeof next === "string" ? next : undefined} />;
}
