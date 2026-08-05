import Link from "next/link";
import { btnPrimary, btnSecondary } from "@/components/ui";

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-indigo-50 to-slate-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 text-center sm:py-20">
        <p className="mb-3 text-sm font-semibold text-indigo-600">🇦🇹 Австри ↔ Монгол 🇲🇳</p>
        <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          Ачаагаа аялагчтай хамт илгээ
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Аялагчид сул ачааны жингээ зарлаж, илгээгчид ачаагаа хүргүүлэх хүнээ олдог платформ.
          Facebook группээр хайх шаардлагагүй — зараа тавиад, мессежээр шууд тохиролцоорой.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/trips/new" className={btnPrimary}>
            ✈️ Аялал зарлах
          </Link>
          <Link href="/shipments/new" className={btnSecondary}>
            📦 Ачаа илгээх хүсэлт
          </Link>
        </div>
      </div>
    </section>
  );
}
