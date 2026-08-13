import Image from "next/image";

const sizeCls = {
  xs: "h-6 w-6 text-[10px]",
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
const sizePx = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };

/** Идэвхтэйн цэг — зургийн хэмжээнд тохируулна. */
const dotCls = {
  xs: "h-2 w-2",
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
  xl: "h-4 w-4",
};

interface AvatarProps {
  name: string;
  /** Профайлын зургийн URL. Байхгүй бол нэрийн эхний үсэг гарна. */
  src?: string | null;
  size?: keyof typeof sizeCls;
  shape?: keyof typeof shapeCls;
  /**
   * Заавал өгөх шаардлагагүй. Өгвөл зургийн буланд идэвхтэйн цэг гарах зай
   * үлдээнэ — true үед л цэг харагдана.
   */
  online?: boolean;
  className?: string;
}

export function Avatar({ name, src, size = "md", shape = "circle", online, className = "" }: AvatarProps) {
  const base = `flex ${sizeCls[size]} shrink-0 items-center justify-center font-bold`;

  const picture = src ? (
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
  ) : (
    <span aria-hidden className={`${base} ${shapeCls[shape]} ${className}`}>
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );

  if (online === undefined) return picture;

  return (
    <span className="relative inline-flex shrink-0">
      {picture}
      {online ? (
        // ring нь картны дэвсгэрийн өнгө — цэг зурагнаас тусгаарлагдаж харагдана
        <span
          role="img"
          aria-label="Идэвхтэй"
          className={`absolute -bottom-0.5 -right-0.5 ${dotCls[size]} rounded-full bg-emerald-500 ring-2 ring-card`}
        />
      ) : null}
    </span>
  );
}
