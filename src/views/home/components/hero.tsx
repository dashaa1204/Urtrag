import Link from "next/link";
import { btnLg, btnPrimary, btnSecondary } from "@/components/ui";
import { HeroSketch } from "./hero-sketch";

export function Hero() {
  return (
    <section className="border-b-2 border-ink/10">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-8 px-4 py-12 sm:py-20 lg:grid-cols-[1fr_auto] lg:gap-10">
        <div className="text-center lg:text-left">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-stamp">
            Дэлхийн аль ч хотоос — аль ч хот руу
          </p>
          <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight text-ink sm:text-4xl lg:mx-0">
            Ачаагаа аялагчтай хамт илгээ
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-soft lg:mx-0">
            Аялагчид сул ачааны жингээ зарлаж, илгээгчид ачаагаа хүргүүлэх хүнээ олдог платформ.
            Facebook группээр хайх шаардлагагүй — зараа тавиад, мессежээр шууд тохиролцоорой.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
            <Link href="/trips/new" className={`${btnPrimary} ${btnLg}`}>
              Аялал зарлах
            </Link>
            <Link href="/shipments/new" className={`${btnSecondary} ${btnLg}`}>
              Ачаа илгээх хүсэлт
            </Link>
          </div>
        </div>

        {/*
          Бал үзгийн эскиз: онгоцонд ачаагаа зөөж буй хүмүүс. Цаасны дэвсгэрийг
          alpha болгож салгасан тул хүрээ, сүүдэр, карт хэрэггүй — шууд хуудасны
          дэвсгэр дээр хэвтэнэ. Онгоцны хамар зүүн тийш, агуулга руугаа харна.
        */}
        <HeroSketch className="mx-auto w-full max-w-[460px] sm:max-w-[520px] lg:mx-0 lg:max-w-[460px]" />
      </div>
    </section>
  );
}
