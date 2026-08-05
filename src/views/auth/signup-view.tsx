import Link from "next/link";
import { SignupForm } from "./components";

export default function SignupView({ next }: { next?: string }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-slate-900">Бүртгүүлэх</h1>
        <p className="mb-6 text-sm text-slate-500">Аялал эсвэл ачаагаа зарлахын тулд бүртгүүлээрэй.</p>
        <SignupForm next={next} />
        <p className="mt-6 text-center text-sm text-slate-500">
          Бүртгэлтэй юу?{" "}
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-indigo-600 hover:underline">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}
