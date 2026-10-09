import type { SessionUser, UserRating } from "@/types";
import { avatarUrl } from "@/lib/avatar";
import { formatDate } from "@/lib/format";
import { countryFlag, countryName } from "@/constant/cities";
import { Avatar, LogoMark } from "@/components/ui";
import { PassBarcode } from "./pass-barcode";
import { PassStamp } from "./pass-stamp";

/** Шилдэг үнэлгээний босго — цөөн үнэлгээгээр 5.0 харагдахаас сэргийлнэ. */
const TOP_RATED = { minCount: 3, minAvg: 4.5 };

/** "URT 2026 MN 3848" — тасалбарын дугаар мэт харагдах тогтмол код. */
function passCode(id: string, createdAt: Date): string {
  const digits = Number(id.replace(/\D/g, "").slice(0, 6) || 0) % 10000;
  return `URT ${createdAt.getFullYear()} MN ${digits.toString().padStart(4, "0")}`;
}

export function BoardingPass({
  user,
  rating,
  identityVerified,
}: {
  user: SessionUser;
  rating: UserRating;
  /** Бичиг баримтаар баталгаажсан эсэх (/settings/identity). */
  identityVerified: boolean;
}) {
  // Тамганы бичиг англиар — лац өөрөө англи "Urtrag" тамдагтай тул нэг аястай
  // байх ба тайлбар (title/sr-only) монголоор хэвээр.
  const stamps = [
    { label: "ID verified", title: "Бичиг баримтаар баталгаажсан", earned: identityVerified },
    { label: "Email verified", title: "Имэйл баталгаажсан", earned: user.emailVerified },
    { label: "Phone added", title: "Утасны дугаар нэмсэн", earned: Boolean(user.phone) },
    {
      label: "Top rated",
      title: `Шилдэг үнэлгээтэй (${TOP_RATED.minAvg}+, ${TOP_RATED.minCount}-аас дээш үнэлгээ)`,
      earned: rating.count >= TOP_RATED.minCount && rating.avg >= TOP_RATED.minAvg,
    },
  ];

  // Энд өмнө нь Аялал / Ачаа / Үнэлгээ гэсэн гурван тоо байсан — гэтэл яг 24px
  // доорх табууд тэр гурвыг нэгэнт харуулдаг. Нэг дэлгэцэн дээр ижил гурван
  // тоог хоёр удаа хэлэх нь давхардал төдийгүй хуудасны хамгийн үнэтэй хэсгийг
  // зарцуулж байсан: тасалбар нь утсан дээр 439px буюу дэлгэцийн 54%-ийг эзэлж,
  // хэрэглэгчийн ирсэн зорилго болох зарын жагсаалт нь 685px дээр дөнгөж хальт
  // харагддаг байв.
  //
  // Үлдсэн хоёр нь давхардаагүй: онооны ДУНДАЖ (таб нь үнэлгээний ТООГ хэлдэг)
  // ба тасалбарын дугаар (өмнө нь зөвхөн sm-ээс дээш харагддаг байсан тул
  // утсан дээр огт байхгүй байлаа).
  const scoreValue = rating.count > 0 ? `★ ${rating.avg.toFixed(1)}` : "—";

  return (
    // overflow-hidden биш — тамга нь тасалбарын ирмэгээс халин гарч байж
    // гараар дарсан лац шиг үнэмшилтэй харагдана.
    <section className="rounded-2xl border-2 border-ink/12 bg-card">
      <div className="flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-5">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-ink">
          <LogoMark className="h-6 w-6" />
          Boarding pass
        </p>
        {/* Дугаар нь доорх ишэнд бүх өргөнд гарах болсон тул энд давтахгүй. */}
        <div className="hidden shrink-0 text-right sm:block">
          <PassBarcode seed={user.id} />
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

        {/* Байрлал хэвээр (утсанд 4 нэг мөрөнд, дэлгэцэнд 2x2) — зөвхөн тамганууд
            хоорондоо давхцахаар ойртож, баруун ирмэгээс халина. */}
        <div className="grid w-fit grid-cols-4 sm:-mr-8 sm:grid-cols-2">
          {stamps.map((stamp) => (
            <PassStamp key={stamp.label} {...stamp} />
          ))}
        </div>
      </div>

      {/* Тасалбарын хэрчих зурвас — нэг мөрийн иш. Зүүнд оноо, баруунд дугаар:
          жинхэнэ тасалбарын иш яг ийм хоёр зүйлийг үүрдэг. */}
      <div className="flex items-center justify-between gap-4 border-t-2 border-dashed border-ink/15 px-4 py-3 sm:px-6">
        <div>
          <p className="text-lg font-bold text-ink">{scoreValue}</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft">
            Оноо
          </p>
        </div>
        <p className="shrink-0 text-right text-[10px] tracking-[0.2em] text-ink-soft">
          {passCode(user.id, user.createdAt)}
        </p>
      </div>
    </section>
  );
}

/** Тасалбарын нэг талбар: жижиг гарчиг + утга. */
function PassField({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft">{label}</p>
      <p className={`truncate font-bold text-ink ${small ? "text-sm" : "text-xl uppercase"}`}>{value}</p>
    </>
  );
}
