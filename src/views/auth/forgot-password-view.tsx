import Link from "next/link";
import { ForgotPasswordForm } from "./components";

export default function ForgotPasswordView() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-slate-900">Нууц үг сэргээх</h1>
        <p className="mb-6 text-sm text-slate-500">
          Бүртгэлтэй имэйл хаягаа оруулна уу. Нууц үгээ шинэчлэх холбоос илгээнэ.
        </p>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Нэвтрэх хуудас руу буцах
          </Link>
        </p>
      </div>
    </div>
  );
}
