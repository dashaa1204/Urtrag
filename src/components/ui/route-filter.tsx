import Link from "next/link";
import { COUNTRY_OPTIONS } from "@/constant/cities";
import { btnPrimary, btnSecondary, btnSm, inputCls, labelCls } from "./form";

/**
 * Жагсаалтын улсын шүүлтүүр. GET форм тул JS-гүйгээр ажиллаж,
 * сонголт нь URL-д үлдэж, хуваалцаж болдог холбоос үүсгэнэ.
 */
export function RouteFilter({
  basePath,
  fromCountry,
  toCountry,
}: {
  basePath: string;
  fromCountry?: string;
  toCountry?: string;
}) {
  const filtered = Boolean(fromCountry || toCountry);

  return (
    <form action={basePath} method="get" className="flex flex-wrap items-end gap-3">
      <CountrySelect label="Хаанаас" name="from" value={fromCountry} />
      <CountrySelect label="Хаашаа" name="to" value={toCountry} />

      <button type="submit" className={`${btnPrimary} ${btnSm}`}>
        Шүүх
      </button>
      {filtered ? (
        <Link href={basePath} className={`${btnSecondary} ${btnSm}`}>
          Цэвэрлэх
        </Link>
      ) : null}
    </form>
  );
}

function CountrySelect({ label, name, value }: { label: string; name: string; value?: string }) {
  return (
    <div className="min-w-40 flex-1 sm:max-w-56">
      <label htmlFor={`filter-${name}`} className={labelCls}>
        {label}
      </label>
      <select id={`filter-${name}`} name={name} defaultValue={value ?? ""} className={inputCls}>
        <option value="">Бүх улс</option>
        {/* Нэр эхэлж бичигдэнэ — гар дээр үсэг дарахад браузер тухайн улс руу үсэрнэ. */}
        {COUNTRY_OPTIONS.map((country) => (
          <option key={country.code} value={country.code}>
            {country.country} {country.flag}
          </option>
        ))}
      </select>
    </div>
  );
}
