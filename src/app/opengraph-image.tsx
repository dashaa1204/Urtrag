import { ImageResponse } from "next/og";
import { SITE } from "@/constant/site";

// Facebook / Messenger дээр холбоос хуваалцахад гарах зураг.
// ImageResponse-ийн үндсэн фонт зөвхөн латин үсэг агуулдаг тул энд кирилл бичихгүй
// (кирилл текст хэрэгтэй бол репод .ttf фонт нэмээд `fonts` сонголтоор дамжуулна).
export const alt = `${SITE.name} — parcel delivery with travelers`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 140, fontWeight: 700, letterSpacing: -4 }}>{SITE.name}</div>
        <div style={{ marginTop: 16, fontSize: 44, opacity: 0.9 }}>
          Send your parcel with a traveler
        </div>
        <div style={{ marginTop: 48, fontSize: 32, opacity: 0.7 }}>
          Vienna · Ulaanbaatar · Seoul · Berlin · Tokyo
        </div>
      </div>
    ),
    size
  );
}
