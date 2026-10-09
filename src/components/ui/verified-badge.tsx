interface VerifiedBadgeProps {
  className?: string;
}

/** Instagram-ын verified цэнхэр. */
const BLUE = "#0095F6";
/** Долгионтой ирмэг — дугуйн эргэн тойронд 12 жижиг дугуй. */
const BUMPS = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);

/**
 * Бичиг баримтаар баталгаажсан хэрэглэгчийн тэмдэг.
 *
 * Facebook, Instagram-ын цэнхэр "verified" тэмдэгтэй ижил хэлбэр, өнгөтэй —
 * хүмүүс тайлбаргүйгээр шууд таньдаг тул санаатайгаар сайтын өнгөнөөс гадуур.
 */
export function VerifiedBadge({ className = "h-4 w-4" }: VerifiedBadgeProps) {
  return (
    <svg viewBox="0 0 24 24" role="img" className={`shrink-0 ${className}`}>
      <title>Бичиг баримтаар баталгаажсан</title>
      <g fill={BLUE}>
        <circle cx="12" cy="12" r="10.2" />
        {BUMPS.map((angle) => (
          <circle
            key={angle}
            cx={(12 + 9.6 * Math.cos(angle)).toFixed(2)}
            cy={(12 + 9.6 * Math.sin(angle)).toFixed(2)}
            r="2.2"
          />
        ))}
      </g>
      <path
        d="m7.6 12.3 3 3 5.8-6.2"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
