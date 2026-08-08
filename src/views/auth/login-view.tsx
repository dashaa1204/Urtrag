import Link from "next/link";
import { FormError } from "@/components/ui";
import { LoginForm } from "./components";

export default function LoginView({ next, error }: { next?: string; error?: string }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-slate-900">Нэвтрэх</h1>
        <p className="mb-6 text-sm text-slate-500">Замдаа платформд тавтай морил!</p>
        {error ? (
          <div className="mb-4">
            <FormError message={error} />
          </div>
        ) : null}
        <LoginForm next={next} />
        <p className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-slate-500 hover:text-indigo-600 hover:underline">
            Нууц үгээ мартсан уу?
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-slate-500">
          Бүртгэлгүй юу?{" "}
          <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-semibold text-indigo-600 hover:underline">
            Бүртгүүлэх
          </Link>
        </p>
      </div>
    </div>
  );
}
