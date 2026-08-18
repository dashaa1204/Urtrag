import { ImageResponse } from "next/og";
import { SITE } from "@/constant/site";

/*
  Зар хуваалцахад Facebook, Telegram дээр гарах зураг.

  ВАЖНО: ImageResponse-ийн үндсэн фонт нь зөвхөн ЛАТИН үсэг агуулна. Тиймээс
  энд кирилл ("кг", "Аялалын зар") бичихгүй — хотын нэрс жагсаалтдаа латинаар
  хадгалагддаг тул чиглэл асуудалгүй, нэгж ба шошгыг англиар бичив. Мөн сум
  (→) зэрэг тэмдэгт латин дэд олонлогт байхгүй тул зурааснуудыг div-ээр зурав.
*/

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** OG зурагт зориулсан латин нэгжүүд (lib/format.ts нь кириллээр бичдэг). */
export function ogKg(kg: number): string {
  return `${Number.isInteger(kg) ? kg : kg.toFixed(1)} kg`;
}

export function ogEur(eur: number): string {
  return `${Number.isInteger(eur) ? eur : eur.toFixed(2)} €`;
}

const INK = "#16204d";
const PAPER = "#f4f4ec";
const ACCENT = "#fbbf24";

function Dot() {
  return <div style={{ width: 14, height: 14, borderRadius: 7, background: ACCENT }} />;
}

/**
 * Зарын OG зураг. Чиглэлээ дээд талд нь том, тоон мэдээллийг доор нь тэмдэгт
 * болгон харуулна — фийд дээр гүйлгэж яваа хүн гурван секундэд уншина.
 */
export function listingOgImage({
  kicker,
  from,
  to,
  facts,
}: {
  /** "Trip" / "Parcel" маягийн жижиг шошго. */
  kicker: string;
  from: string;
  to: string;
  /** 2-3 богино тэмдэглэл — огноо, жин, үнэ. */
  facts: string[];
}): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          color: PAPER,
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 2 }}>{SITE.name}</div>
          <div style={{ fontSize: 28, letterSpacing: 6, color: ACCENT }}>{kicker.toUpperCase()}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 18,
              paddingBottom: 18,
            }}
          >
            <Dot />
            <div style={{ width: 4, height: 96, background: "rgba(244,244,236,0.35)" }} />
            <Dot />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1 }}>{from}</div>
            <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1 }}>{to}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", gap: 16 }}>
            {facts.map((fact) => (
              <div
                key={fact}
                style={{
                  display: "flex",
                  borderRadius: 12,
                  border: "2px solid rgba(244,244,236,0.3)",
                  padding: "12px 24px",
                  fontSize: 32,
                }}
              >
                {fact}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 26, color: "rgba(244,244,236,0.65)" }}>
            Send your parcel with a traveler
          </div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}

/** Зар олдоогүй үед (устсан, буруу id) хоосон зураг гаргахгүйн тулд. */
export function fallbackOgImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: INK,
          color: PAPER,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: -2 }}>{SITE.name}</div>
        <div style={{ marginTop: 16, fontSize: 40, color: "rgba(244,244,236,0.7)" }}>
          Send your parcel with a traveler
        </div>
      </div>
    ),
    OG_SIZE
  );
}
