import Link from "next/link";
import { ChatIcon, PackageIcon, SearchIcon } from "@/components/ui";

const STEPS = [
  {
    Icon: SearchIcon,
    title: "Зараа олоорой",
    text: "Чиглэл, огноогоор нь шүүж өөрт тохирох аялагч эсвэл ачааг олоорой.",
  },
  {
    Icon: ChatIcon,
    title: "Мессежээр тохиролцоорой",
    text: "Үнэ, уулзах газар, ачааны дэлгэрэнгүйг платформ дээрээ шууд ярилцаарай.",
  },
  {
    Icon: PackageIcon,
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

/** Онгоцны нислэгийн зам. globals.css дахь .zd-plane-ын offset-path-тай ижил байх ёстой. */
const ROUTE_PATH = "M 90 196 C 400 52, 800 52, 1110 132";

const GLOBE_R = 199;
/** Туйлын тэнхлэгийн хазайлтын синус — бөмбөрцгийг арай дээрээс харж буй мэт болгоно. */
const GLOBE_TILT = 0.34;
const GLOBE_TILT_COS = Math.sqrt(1 - GLOBE_TILT ** 2);

/**
 * Өргөргийн шугамууд. Бөмбөрцөг дээрх φ өргөрөг нь дэлгэцэд эллипс болж
 * буулна: хагас тэнхлэгүүд нь R·cosφ ба R·cosφ·sin(хазайлт), төв нь
 * туйлын тэнхлэг дагуу R·sinφ·cos(хазайлт)-аар шилжинэ.
 */
const PARALLELS = [-60, -40, -20, 0, 20, 40, 60].map((deg) => {
  const phi = (deg * Math.PI) / 180;
  const rx = GLOBE_R * Math.cos(phi);
  return {
    deg,
    rx: +rx.toFixed(1),
    ry: +(rx * GLOBE_TILT).toFixed(1),
    cy: +(200 - GLOBE_R * Math.sin(phi) * GLOBE_TILT_COS).toFixed(1),
  };
});

/**
 * Уртрагийн шугамууд. Эргэлдэх үед эллипсийн rx нь R·cos(уртраг) хэмээн
 * хэлбэлздэг — үүнийг globals.css дахь zd-spin гүйцэтгэнэ. Хагас эргэлт бүрд
 * нэг мөчлөг (40 сек) тул 45°-аар зайтай 4 шугамыг 10 сек-ээр ээлжлүүлнэ.
 * rx атрибут нь хөдөлгөөнгүй үеийн байрлал.
 */
const MERIDIANS = [
  { rx: 199, delay: "0s" },
  { rx: 141, delay: "-10s" },
  { rx: 76, delay: "-20s" },
  { rx: 24, delay: "-30s" },
];

/**
 * Тогтмол үртэй хуурамч санамсаргүй тоо [0,1).
 * Math.random() ашиглавал дахин рендэрлэх бүрт одод үсэрнэ.
 */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** y-г 1.9 зэрэгт дэвшүүлснээр одод дээд хэсэгт нягтарна. */
const STARS = Array.from({ length: 64 }, (_, i) => ({
  x: +(seeded(i * 3 + 1) * 100).toFixed(2),
  y: +(seeded(i * 3 + 2) ** 1.9 * 66).toFixed(2),
  r: +(0.7 + seeded(i * 3 + 3) * 1.4).toFixed(2),
  delay: +(seeded(i * 5 + 4) * 4.5).toFixed(2),
  duration: +(2.4 + seeded(i * 5 + 5) * 3).toFixed(2),
}));

/** Хэсгийн хоосон дэвсгэрийг дүүргэх чимэглэл — шөнийн тэнгэр, бөмбөрцөг, маршрут. */
function RouteBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Дээд хэсгийг харанхуйлж шөнийн тэнгэрийн мэдрэмж өгнө */}
      <div className="absolute inset-x-0 top-0 h-3/4 bg-gradient-to-b from-indigo-950/85 via-indigo-950/35 to-transparent" />

      {/* Анивчих одод */}
      <svg className="absolute inset-0 h-full w-full">
        {STARS.map((star, i) => (
          <circle
            key={i}
            className="zd-star"
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.r}
            fill="white"
            opacity="0.35"
            style={{ animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s` }}
          />
        ))}
      </svg>

      {/* Эргэлдэх бөмбөрцөг — баруун доод буланд хэсэгчлэн хальж байрлана */}
      <svg
        viewBox="0 0 400 400"
        fill="none"
        className="absolute -bottom-28 -right-28 h-[380px] w-[380px] sm:h-[460px] sm:w-[460px]"
      >
        <defs>
          {/* Зүүн дээд талаас гэрэлтүүлж, ирмэг рүү бүдгэрүүлнэ */}
          <radialGradient id="zd-globe-face" cx="34%" cy="28%" r="78%">
            <stop offset="0%" stopColor="white" stopOpacity="0.17" />
            <stop offset="55%" stopColor="white" stopOpacity="0.06" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          {/* Ирмэгийн гэрэл — бөмбөлөг мэт мэдрэмж өгнө */}
          <radialGradient id="zd-globe-rim" cx="50%" cy="50%" r="50%">
            <stop offset="90%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.3" />
          </radialGradient>
          <clipPath id="zd-globe-clip">
            <circle cx="200" cy="200" r={GLOBE_R} />
          </clipPath>
        </defs>

        <circle cx="200" cy="200" r={GLOBE_R} fill="url(#zd-globe-face)" />

        <g clipPath="url(#zd-globe-clip)" stroke="white" strokeOpacity="0.14">
          {PARALLELS.map(({ deg, rx, ry, cy }) => (
            <ellipse key={deg} cx="200" cy={cy} rx={rx} ry={ry} />
          ))}
          {MERIDIANS.map(({ rx, delay }) => (
            <ellipse
              key={rx}
              className="zd-meridian"
              cx="200"
              cy="200"
              rx={rx}
              ry={GLOBE_R}
              style={{ animationDelay: delay }}
            />
          ))}
        </g>

        <circle cx="200" cy="200" r={GLOBE_R} fill="url(#zd-globe-rim)" />
      </svg>

      {/* Вена → Улаанбаатар маршрут ба нисэх онгоц */}
      {/*
        Дэвсгэрийг агуулгад уях. Cap байхгүй бол өргөн дэлгэц дээр SVG
        цонхтойгоо хамт сунаж, онгоц хэт томроод бүдүүлэг харагдана.
      */}
      <div className="absolute inset-x-0 top-0 mx-auto w-full max-w-[1280px]">
        <svg viewBox="0 0 1200 260" fill="none" className="w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="zd-plane-glow">
              <stop offset="0%" stopColor="white" stopOpacity="0.35" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>

            {/*
              Хоёр үзүүрийг харанхуй руу уусгах маск. Маск дотор цагаан нь
              харагдана, хар нь нуугдана гэсэн үг. Ингэснээр зам хаанаас
              эхэлж, хаана дуусахаа зааж өгөх тэмдэг хэрэггүй болно.
            */}
            <linearGradient id="zd-route-fade-grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="black" />
              <stop offset="0.16" stopColor="white" />
              <stop offset="0.84" stopColor="white" />
              <stop offset="1" stopColor="black" />
            </linearGradient>
            <mask id="zd-route-fade">
              <rect width="1200" height="260" fill="url(#zd-route-fade-grad)" />
            </mask>
          </defs>

          <g mask="url(#zd-route-fade)">
            <path d={ROUTE_PATH} stroke="white" strokeOpacity="0.26" strokeWidth="2.5" strokeDasharray="10 12" />

            {/*
              Онгоцны ард үлдэх гэрэлт мөр. pathLength=100 болгосон тул зурааст
              хэсгийн байрлал замын уртын хувиар илэрхийлэгдэж, онгоцны
              offset-distance-тэй яг синхрон явна.
            */}
            <path
              className="zd-trail"
              d={ROUTE_PATH}
              pathLength="100"
              stroke="white"
              strokeOpacity="0.5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="13 100"
            />

            {/*
              Онгоцны хөдөлгөөнийг globals.css дахь .zd-plane хариуцна.
              Дүрс нь дээшээ харсан тул зам дагуух чиглэлд (+x) эргүүлнэ.
              Маскийн дотор байгаа тул харанхуйгаас гарч ирж, харанхуйд шингэнэ.
            */}
            <g className="zd-plane">
              <circle r="24" fill="url(#zd-plane-glow)" />
              <path
                transform="rotate(90) scale(1.5) translate(-12 -12)"
                d="M21 16v-2l-8-5V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                fill="white"
                fillOpacity="0.85"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

/** iPhone-ы статус мөрийн дүрсүүд. Өндрөө эцэг элементийн үсгийн хэмжээнээс авна. */
function StatusIcons() {
  return (
    <span className="flex items-center gap-[3px] text-slate-900 sm:gap-1">
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
      <div className="rounded-[2rem] border-8 border-slate-900 bg-slate-900 shadow-2xl sm:rounded-[2.5rem] sm:border-[10px]">
        <div className="relative aspect-[393/852] overflow-hidden rounded-[1.5rem] bg-slate-50 sm:rounded-[1.875rem]">
          {/*
            Статус мөр. Гурван баганат grid тул Dynamic Island үргэлж голлож,
            цаг болон дүрсүүд түүнтэй давхцах боломжгүй.
            Island-ын өргөн нь дэлгэцийн 31.8%, харьцаа нь 125:37 (жинхэнэ утга).
          */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 px-3 pt-1.5 text-[8px] font-semibold text-slate-900 sm:px-4 sm:pt-2 sm:text-[10px]">
            <span>9:41</span>
            <span className="aspect-[125/37] w-[58px] rounded-full bg-slate-900 sm:w-[70px] md:w-[79px]" />
            <span className="justify-self-end">
              <StatusIcons />
            </span>
          </div>

          <div className="mt-1.5 flex items-center border-b border-slate-200 bg-white px-2.5 py-2 sm:mt-2 sm:px-3 sm:py-2.5">
            <span className="text-xs font-bold text-indigo-600 sm:text-sm">✈️ Замдаа</span>
          </div>

          <div className="space-y-2 p-2.5 sm:space-y-2.5 sm:p-3">
            {MOCK_TRIPS.map((trip) => (
              <div
                key={trip.route}
                className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm sm:rounded-xl sm:p-3"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <p className="text-[11px] font-semibold leading-snug text-slate-900 sm:text-[13px]">{trip.route}</p>
                  <span className="shrink-0 text-[8px] font-medium uppercase text-slate-400 sm:text-[9px]">
                    {trip.tag}
                  </span>
                </div>
                <p className="mt-1 text-[9px] text-slate-500 sm:mt-1.5 sm:text-[11px]">
                  {trip.meta} · <span className="font-semibold text-indigo-600">{trip.price}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Доод ирмэг рүү бүдгэрүүлж, гүйлгэх боломжтой мэт харуулна */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 to-transparent" />
          <div className="absolute bottom-2 left-1/2 h-1 w-1/3 -translate-x-1/2 rounded-full bg-slate-900/70" />
        </div>
      </div>

      {/* Тохиролцооны мөчийг харуулсан хөвөгч карт */}
      <div className="absolute -bottom-4 -left-6 w-[88%] rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-slate-900/5">
        <p className="text-xs font-semibold text-emerald-600">Тохиролцлоо</p>
        <p className="mt-1.5 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Болдоо</span> 5кг ачаа авч явахаар боллоо.
        </p>
        <p className="mt-1 text-xs text-slate-400">Вена, 08.19 · 55€</p>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600">
      <RouteBackdrop />

      <div className="relative mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 px-4 py-14 sm:gap-12 md:grid-cols-2 md:py-20">
        <PhoneMockup />

        <div>
          <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">Хэрхэн ажилладаг вэ?</h2>
          <p className="mt-2.5 max-w-md text-sm leading-snug text-indigo-100 sm:mt-3 sm:text-base sm:leading-normal">
            Бүртгүүлээд гурван алхмаар ачаагаа явуулах хүнээ ол. Апп татах шаардлагагүй.
          </p>

          <ul className="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
            {STEPS.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-3 sm:gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white sm:h-10 sm:w-10">
                  <Icon />
                </span>
                <div className="max-w-md">
                  <h3 className="text-[15px] font-semibold text-white sm:text-base">{title}</h3>
                  <p className="mt-0.5 text-[13px] leading-snug text-indigo-100 sm:mt-1 sm:text-sm sm:leading-relaxed">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/trips"
            className="mt-7 inline-flex min-h-11 select-none items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-indigo-600 shadow-lg shadow-indigo-950/30 transition duration-150 ease-out hover:-translate-y-px hover:bg-indigo-50 hover:shadow-xl hover:shadow-indigo-950/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0 active:bg-indigo-100 sm:mt-8 sm:min-h-10"
          >
            Аялалуудыг үзэх →
          </Link>
        </div>
      </div>
    </section>
  );
}
