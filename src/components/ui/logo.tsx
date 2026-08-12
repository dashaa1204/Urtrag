import Image from "next/image";
import { SITE } from "@/constant/site";

/*
  Логоны эх файл: public/logo.png (1232×240, ил тод дэвсгэртэй).
  Өндрийг нь className-ээр өгнө (жишээ нь `h-7`), өргөн нь `w-auto`-оор дагана.
  Доорх хэмжээ нь эх файлын биш, дэлгэц дээр гарах ойролцоо хэмжээ — next/image
  үүнээс srcset-ээ бодох тул жинхэнэ 1232px-ийг өгвөл хэрэггүй том зураг татна.
*/
const LOGO = { width: 308, height: 60 } as const;
const MARK = { width: 256, height: 256 } as const;

interface LogoProps {
  className?: string;
  /** Navbar шиг дэлгэцийн эхэнд харагдах логод л өгнө. */
  priority?: boolean;
}

export function Logo({ className = "h-7 w-auto", priority = false }: LogoProps) {
  return <Image src="/logo.png" alt={SITE.name} {...LOGO} priority={priority} className={className} />;
}

/** Зөвхөн илгээмжийн тэмдэг — нэр давхардах, эсвэл нарийн зайд хэрэглэнэ. */
export function LogoMark({ className = "h-6 w-6" }: Pick<LogoProps, "className">) {
  return <Image src="/logo-mark.png" alt="" aria-hidden {...MARK} className={className} />;
}
