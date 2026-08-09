import Link from "next/link";
import { AuthCard, ForgotPasswordForm } from "./components";

export default function ForgotPasswordView() {
  return (
    <AuthCard
      title="Нууц үг сэргээх"
      description="Бүртгэлтэй имэйл хаягаа оруулна уу. Нууц үгээ шинэчлэх холбоос илгээнэ."
      footer={
        <p>
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Нэвтрэх хуудас руу буцах
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
