import Link from "next/link";
import { Logo, SketchIcon, type SketchName } from "@/components/ui";

const STEPS: { sketch: SketchName; title: string; text: string }[] = [
  {
    sketch: "route",
    title: "Зараа олоорой",
    text: "Чиглэл, огноогоор нь шүүж өөрт тохирох аялагч эсвэл ачааг олоорой.",
  },
  {
    sketch: "network",
    title: "Мессежээр тохиролцоорой",
    text: "Үнэ, уулзах газар, ачааны дэлгэрэнгүйг платформ дээрээ шууд ярилцаарай.",
  },
  {
    sketch: "verified",
    title: "Ачаагаа хүргүүлээрэй",
    text: "Аялагч ачааг тань авч очоод хүлээлгэн өгнө. Ихэвчлэн 1 кг нь 10–15€.",
  },
];

const MOCK_TRIPS = [
  { route: "Зальцбург → Улаанбаатар", tag: "at → mn", meta: "2026.08.22 · 10кг сул", price: "12€/кг" },
  { route: "Улаанбаатар → Линц", tag: "mn → at", meta: "2026.09.02 · 6кг сул", price: "14€/кг" },
  { route: "Инсбрук → Улаанбаатар", tag: "at → mn", meta: "2026.09.11 · 15кг сул", price: "11€/кг" },
  { route: "Улаанбаатар → Клагенфурт", tag: "mn → at", meta: "2026.09.19 · 9кг сул", price: "13€/кг" },
];

/** iPhone-ы статус мөрийн дүрсүүд. Өндрөө эцэг элементийн үсгийн хэмжээнээс авна. */
function StatusIcons() {
  return (
    <span className="flex items-center gap-[3px] text-ink sm:gap-1">
      {/* Сүлжээний баганууд */}
      <svg viewBox="0 0 18 12" fill="currentColor" aria-hidden className="h-[9px] w-auto sm:h-2.5">
        <rect x="0" y="8" width="3" height="4" rx="1" />
        <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
        <rect x="10" y="3" width="3" height="9" rx="1" />
        <rect x="15" y="0" width="3" height="12" rx="1" />
      </svg>

      {/* Wi-Fi */}
      <svg
        viewBox="0 0 16 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden
        className="h-[9px] w-auto sm:h-2.5"
      >
        <path d="M1.1 4.1a10 10 0 0 1 13.8 0" />
        <path d="M3.7 6.9a6.3 6.3 0 0 1 8.6 0" />
        <path d="M6.3 9.6a2.7 2.7 0 0 1 3.4 0" />
      </svg>

      {/* Батарей */}
      <svg viewBox="0 0 25 13" fill="none" aria-hidden className="h-[10px] w-auto sm:h-3">
        <rect x="0.5" y="0.5" width="21" height="12" rx="4" stroke="currentColor" strokeOpacity="0.35" />
        <rect x="2" y="2" width="15" height="9" rx="2.5" fill="currentColor" />
        <path d="M23.3 4.6a2.6 2.6 0 0 1 0 3.8" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.4" />
      </svg>
    </span>
  );
}

/**
 * Утасны хүрээнд бодит зарын карт — вэб нь мобайл дээр ингэж харагдана.
 * Хэмжээ нь iPhone-ы дэлгэцийн 393×852 pt харьцаагаар (≈2.17:1).
 */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[200px] sm:max-w-[240px] md:max-w-[270px]">
      <div className="rounded-[2rem] border-8 border-ink bg-ink sm:rounded-[2.5rem] sm:border-[10px]">
        <div className="relative aspect-[393/852] overflow-hidden rounded-[1.5rem] bg-paper sm:rounded-[1.875rem]">
          {/*
            Статус мөр. Гурван баганат grid тул Dynamic Island үргэлж голлож,
            цаг болон дүрсүүд түүнтэй давхцах боломжгүй.
            Island-ын өргөн нь дэлгэцийн 31.8%, харьцаа нь 125:37 (жинхэнэ утга).
          */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 px-3 pt-1.5 text-[8px] font-semibold text-ink sm:px-4 sm:pt-2 sm:text-[10px]">
            <span>9:41</span>
            <span className="aspect-[125/37] w-[58px] rounded-full bg-ink sm:w-[70px] md:w-[79px]" />
            <span className="justify-self-end">
              <StatusIcons />
            </span>
          </div>

          <div className="mt-1.5 flex items-center border-b-2 border-ink/10 px-2.5 py-2 sm:mt-2 sm:px-3 sm:py-2.5">
            <Logo className="h-3.5 w-auto sm:h-4" />
          </div>

          <div className="space-y-2 p-2.5 sm:space-y-2.5 sm:p-3">
            {MOCK_TRIPS.map((trip) => (
              <div key={trip.route} className="rounded-lg border-2 border-ink/12 bg-card p-2.5 sm:p-3">
                <div className="flex items-start justify-between gap-1.5">
                  <p className="text-[11px] font-semibold leading-snug text-ink sm:text-[13px]">{trip.route}</p>
                  <span className="shrink-0 text-[8px] font-medium uppercase text-ink-soft/70 sm:text-[9px]">
                    {trip.tag}
                  </span>
                </div>
                <p className="mt-1 text-[9px] text-ink-soft sm:mt-1.5 sm:text-[11px]">
                  {trip.meta} · <span className="font-bold text-stamp">{trip.price}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Доод ирмэг рүү бүдгэрүүлж, гүйлгэх боломжтой мэт харуулна */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent" />
          <div className="absolute bottom-2 left-1/2 h-1 w-1/3 -translate-x-1/2 rounded-full bg-ink/70" />
        </div>
      </div>

      {/* Тохиролцооны мөчийг харуулсан хөвөгч карт */}
      <div className="absolute -bottom-4 -left-6 w-[88%] rounded-xl border-2 border-ink/15 bg-card p-3.5">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Тохиролцлоо</p>
        <p className="mt-1.5 text-sm text-ink-soft">
          <span className="font-semibold text-ink">Болдоо</span> 5кг ачаа авч явахаар боллоо.
        </p>
        <p className="mt-1 text-xs text-ink-soft/70">Вена, 08.19 · 55€</p>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="border-y-2 border-ink/10 bg-card">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 px-4 py-14 sm:gap-12 md:grid-cols-2 md:py-20">
        <PhoneMockup />

        <div>
          <h2 className="text-2xl font-bold leading-tight text-ink sm:text-3xl">Хэрхэн ажилладаг вэ?</h2>
          <p className="mt-2.5 max-w-md text-sm leading-snug text-ink-soft sm:mt-3 sm:text-base sm:leading-normal">
            Бүртгүүлээд гурван алхмаар ачаагаа явуулах хүнээ ол. Апп татах шаардлагагүй.
          </p>

          <ul className="mt-6 space-y-5 sm:mt-8 sm:space-y-7">
            {STEPS.map(({ sketch, title, text }) => (
              <li key={title} className="flex items-start gap-4 sm:gap-5">
                {/* Эскиз шууд цаасан дээр — хүрээ, дэвсгэргүй */}
                <SketchIcon
                  name={sketch}
                  sizes="72px"
                  className="h-14 w-auto shrink-0 select-none sm:h-16"
                />
                <div className="max-w-md">
                  <h3 className="text-[15px] font-semibold text-ink sm:text-base">{title}</h3>
                  <p className="mt-0.5 text-[13px] leading-snug text-ink-soft sm:mt-1 sm:text-sm sm:leading-relaxed">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/trips"
            className="mt-7 inline-flex min-h-11 select-none items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-paper transition duration-150 ease-out hover:-translate-y-px hover:bg-ink/88 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-0 sm:mt-8 sm:min-h-10"
          >
            Аялалуудыг үзэх →
          </Link>
        </div>
      </div>
    </section>
  );
}
