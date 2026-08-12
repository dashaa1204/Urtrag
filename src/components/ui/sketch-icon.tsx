import Image from "next/image";

/*
  public/sketch доторх бал үзгийн эскизүүд. Жинхэнэ хэмжээг нь энд төвлөрүүлж
  бичсэн нь дуудах бүрт width/height хайх шаардлагагүй болгож, next/image-д
  layout shift үүсгэхгүй байх мэдээллийг өгнө.
*/
const SKETCH = {
  suitcase: { src: "/sketch/suitcase.png", width: 320, height: 484 },
  "passport-open": { src: "/sketch/passport-open.png", width: 200, height: 264 },
  passport: { src: "/sketch/passport.png", width: 196, height: 252 },
  box: { src: "/sketch/box.png", width: 264, height: 252 },
  route: { src: "/sketch/route.png", width: 284, height: 244 },
  network: { src: "/sketch/network.png", width: 260, height: 232 },
  tracking: { src: "/sketch/tracking.png", width: 288, height: 236 },
  "route-alt": { src: "/sketch/route-alt.png", width: 308, height: 236 },
  traveler: { src: "/sketch/traveler.png", width: 192, height: 344 },
  verified: { src: "/sketch/verified.png", width: 280, height: 232 },
  "phone-route": { src: "/sketch/phone-route.png", width: 188, height: 248 },
  "phone-deliver": { src: "/sketch/phone-deliver.png", width: 208, height: 304 },
} as const;

export type SketchName = keyof typeof SKETCH;

/** Чимэглэлийн дүрс тул alt хоосон — утгыг нь дэргэдэх гарчиг өгнө. */
export function SketchIcon({
  name,
  className,
  priority = false,
  sizes,
}: {
  name: SketchName;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const { src, width, height } = SKETCH[name];
  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
