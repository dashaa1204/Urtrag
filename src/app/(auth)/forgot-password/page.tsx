import type { Metadata } from "next";
import ForgotPasswordView from "@/views/auth/forgot-password-view";

export const metadata: Metadata = { title: "Нууц үг сэргээх", robots: { index: false, follow: false }, };

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
