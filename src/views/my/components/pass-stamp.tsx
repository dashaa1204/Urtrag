/**
 * Тасалбар дээрх дугуй тамга — албан ёсны лац маягийн бэхэн дардас: гадна
 * цагирагт нумарсан бичиг, дотор нь бөмбөрцөг ба тамганы нэр. Аваагүй тамга
 * нь бүдэг боловч харагдсаар байна — дараа нь юу авч болохыг харуулах нь
 * өөрөө урам болно.
 */

/**
 * Гараар дарсан тамга шулуун сууж чаддаггүй. Өнцөг, шилжилт, бэхний өтгөнийг
 * шошгоны нэрнээс тогтмолоор гаргана — SSR ба клиент дээр ижил гарах ёстой тул
 * Math.random() ашиглаж болохгүй.
 */
const TILTS = [-11, 7, -6, 12, -3, 5];
const SHIFTS = [-4, 2, 5, -2];
const INKS = [0.85, 0.93, 1];

function pressOf(label: string) {
  // Байрлалаар нь жинлэнэ — эс тэгвээс ойролцоо урттай шошгууд ижил өнцөгт унана.
  let sum = 0;
  for (let i = 0; i < label.length; i += 1) sum += label.charCodeAt(i) * (i + 1);
  return {
    tilt: TILTS[sum % TILTS.length],
    dx: SHIFTS[sum % SHIFTS.length],
    dy: SHIFTS[(sum + 2) % SHIFTS.length],
    ink: INKS[sum % INKS.length],
  };
}

/** Цагирагийн дээд нум — үсгийн орой гадагшаа харна. */
const ARC_TOP = "M 13.5,60 A 46.5,46.5 0 0 1 106.5,60";
/** Доод нум — үсгийн орой төв рүү харснаар доод бичиг шулуун уншигдана. */
const ARC_BOTTOM = "M 5,60 A 55,55 0 0 0 115,60";

/** Хажуугийн од — цагирагийн зүүн, баруун зайг дүүргэнэ. */
const STAR = "M0,-3.2 L0.9,-1 L3.2,-1 L1.4,0.5 L2,2.9 L0,1.5 L-2,2.9 L-1.4,0.5 L-3.2,-1 L-0.9,-1 Z";

export function PassStamp({ label, title, earned }: { label: string; title: string; earned: boolean }) {
  const press = pressOf(label);
  // Шошго нь хоёр үгтэй — лацны төвд хоёр мөр болж буухад тэнцвэртэй харагдана.
  const [head, ...rest] = label.toUpperCase().split(" ");
  // Нэг хуудсанд хэд хэдэн тамга сууна — нумын id давхцахгүй байх ёстой.
  const uid = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div
      title={title}
      style={
        earned
          ? {
              transform: `rotate(${press.tilt}deg) translate(${press.dx}px, ${press.dy}px)`,
              opacity: press.ink,
            }
          : undefined
      }
      className={`relative -m-2 h-24 w-24 shrink-0 ${
        // Дарагдсан тамга давхцахдаа дээр гарна — хоосон талбар нь ард үлдэнэ.
        earned ? "z-10 text-ink" : "text-ink/25"
      }`}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden focusable="false">
        <g fill="none" stroke="currentColor">
          <circle cx="60" cy="60" r="57" strokeWidth="3.5" />
          <circle cx="60" cy="60" r="45.5" strokeWidth="1" />
          <circle cx="60" cy="60" r="38" strokeWidth="1.2" />
        </g>

        <defs>
          <path id={`${uid}-top`} d={ARC_TOP} />
          <path id={`${uid}-bottom`} d={ARC_BOTTOM} />
        </defs>

        <text fill="currentColor" fontSize="8.5" fontWeight="700" letterSpacing="0.6">
          <textPath href={`#${uid}-top`} startOffset="50%" textAnchor="middle">
            URTRAG VERIFIED
          </textPath>
        </text>

        <text fill="currentColor" fontSize="7.5" fontWeight="700" letterSpacing="0.4">
          <textPath href={`#${uid}-bottom`} startOffset="50%" textAnchor="middle">
            SECURE DOCUMENTATION
          </textPath>
        </text>

        <g fill="currentColor">
          <path d={STAR} transform="translate(9 60)" />
          <path d={STAR} transform="translate(111 60)" />
        </g>

        {/* Бөмбөрцөг — олон улсын тээврийн лац гэдгийг илтгэнэ */}
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="60" cy="36" r="7.5" />
          <ellipse cx="60" cy="36" rx="3.2" ry="7.5" />
          <path d="M52.5,36 h15 M53.7,31.5 h12.6 M53.7,40.5 h12.6" />
        </g>

        <text
          x="60"
          y="63"
          fill="currentColor"
          textAnchor="middle"
          fontSize="17"
          fontWeight="700"
          letterSpacing="-0.4"
        >
          URTRAG
        </text>
        <g fill="currentColor" textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="0.2">
          <text x="60" y="74">
            {head}
          </text>
          {rest.length > 0 ? (
            <text x="60" y="83">
              {rest.join(" ")}
            </text>
          ) : null}
        </g>
      </svg>

      <span className="sr-only">
        {title} — {earned ? "авсан" : "аваагүй"}
      </span>
    </div>
  );
}
