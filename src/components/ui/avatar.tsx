import Image from "next/image";

const sizeCls = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-xl",
  xl: "h-20 w-20 text-3xl",
};

/** Дугуй нь профайлын хаа сайгүй; дөрвөлжин нь зөвхөн тасалбарын зурган нүд. */
const shapeCls = {
  circle: "rounded-full bg-ink/10 text-ink",
  square: "rounded-xl bg-ink text-paper",
};

/** next/image-ийн srcset тооцоолол — дэлгэц дээрх ойролцоо пиксел. */
const sizePx = { sm: 32, md: 40, lg: 56, xl: 80 };

interface AvatarProps {
  name: string;
  /** Профайлын зургийн URL. Байхгүй бол нэрийн эхний үсэг гарна. */
  src?: string | null;
  size?: keyof typeof sizeCls;
  shape?: keyof typeof shapeCls;
  className?: string;
}

export function Avatar({ name, src, size = "md", shape = "circle", className = "" }: AvatarProps) {
  const base = `flex ${sizeCls[size]} shrink-0 items-center justify-center font-bold`;

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        aria-hidden
        // Cloudinary нь URL дотроо аль хэдийн тайрч, f_auto/q_auto хийсэн тул
        // Next-ийн оптимизатораар дахин боловсруулах нь илүүц зардал.
        unoptimized
        width={sizePx[size]}
        height={sizePx[size]}
        className={`${sizeCls[size]} ${shapeCls[shape]} shrink-0 object-cover ${className}`}
      />
    );
  }

  return (
    <span aria-hidden className={`${base} ${shapeCls[shape]} ${className}`}>
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
