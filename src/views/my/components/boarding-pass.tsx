import type { SessionUser, UserRating } from "@/types";
import { avatarUrl } from "@/lib/avatar";
import { formatDate } from "@/lib/format";
import { countryFlag, countryName } from "@/constant/cities";
import { Avatar, LogoMark } from "@/components/ui";
import { PassBarcode } from "./pass-barcode";
import { PassStamp } from "./pass-stamp";

/** Шилдэг үнэлгээний босго — цөөн үнэлгээгээр 5.0 харагдахаас сэргийлнэ. */
const TOP_RATED = { minCount: 3, minAvg: 4.5 };

export interface PassCounts {
  trips: number;
  shipments: number;
  reviews: number;
}

/** "URT 2026 MN 3848" — тасалбарын дугаар мэт харагдах тогтмол код. */
function passCode(id: string, createdAt: Date): string {
  const digits = Number(id.replace(/\D/g, "").slice(0, 6) || 0) % 10000;
  return `URT ${createdAt.getFullYear()} MN ${digits.toString().padStart(4, "0")}`;
}

export function BoardingPass({
  user,
  rating,
  counts,
  identityVerified,
}: {
  user: SessionUser;
  rating: UserRating;
  counts: PassCounts;
  /** Бичиг баримтаар баталгаажсан эсэх (/settings/identity). */
  identityVerified: boolean;
}) {
  const stamps = [
    { label: "Баримт", title: "Бичиг баримтаар баталгаажсан", earned: identityVerified },
    { label: "Имэйл", title: "Имэйл баталгаажсан", earned: user.emailVerified },
    { label: "Утас", title: "Утасны дугаар нэмсэн", earned: Boolean(user.phone) },
    {
      label: "Шилдэг",
      title: `Шилдэг үнэлгээтэй (${TOP_RATED.minAvg}+, ${TOP_RATED.minCount}-аас дээш үнэлгээ)`,
      earned: rating.count >= TOP_RATED.minCount && rating.avg >= TOP_RATED.minAvg,
    },
  ];

  const stats = [
    { label: "Аялал", value: String(counts.trips) },
    { label: "Ачаа", value: String(counts.shipments) },
    { label: "Үнэлгээ", value: String(counts.reviews) },
    { label: "Оноо", value: rating.count > 0 ? `★ ${rating.avg.toFixed(1)}` : "—" },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-ink/12 bg-card">
      <div className="flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-5">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-ink">
          <LogoMark className="h-6 w-6" />
          Boarding pass
        </p>
        <div className="hidden shrink-0 text-right sm:block">
          <PassBarcode seed={user.id} />
          <p className="mt-1 text-[10px] tracking-[0.2em] text-ink-soft/70">
            {passCode(user.id, user.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={user.name} src={avatarUrl(user.avatarPath)} size="xl" shape="square" />
          <div className="min-w-0">
            <PassField label="Нэр" value={user.name} />
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
              {user.country ? (
                <PassField
                  label="Улс"
                  value={`${countryFlag(user.country)} ${countryName(user.country)}`}
                  small
                />
              ) : null}
              <PassField label="Гишүүн болсон" value={formatDate(user.createdAt)} small />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-3">
          {stamps.map((stamp) => (
            <PassStamp key={stamp.label} {...stamp} />
          ))}
        </div>
      </div>

      {/* Тасалбарын хэрчих зурвас — доор нь тоон хураангуй */}
      <div className="grid grid-cols-2 border-t-2 border-dashed border-ink/15 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`px-4 py-3 text-center ${i % 2 === 1 ? "border-l border-ink/10" : ""} ${
              i >= 2 ? "border-t border-ink/10" : ""
            } sm:border-t-0 ${i > 0 ? "sm:border-l sm:border-ink/10" : "sm:border-l-0"}`}
          >
            <p className="text-lg font-bold text-ink">{stat.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft/70">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Тасалбарын нэг талбар: жижиг гарчиг + утга. */
function PassField({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft/70">{label}</p>
      <p className={`truncate font-bold text-ink ${small ? "text-sm" : "text-xl uppercase"}`}>{value}</p>
    </>
  );
}
