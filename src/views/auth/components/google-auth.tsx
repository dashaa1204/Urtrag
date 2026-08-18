"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { signInWithGoogle } from "@/lib/actions";
import { btnSecondary, GoogleIcon } from "@/components/ui";

/*
  Google-ээр нэвтрэх товч ба доорх зааглагч. Нэвтрэх, бүртгүүлэх хоёр хуудсанд
  ижилхэн харагдах ёстой тул нэг компонентоор барив.

  Формын үйлдэл нь serverside redirect хийдэг (useActionState-д буцаах төлөв
  байхгүй) учир хүлээлтийг useFormStatus-аар авна — тиймээс товчийг формын
  дотоод тусдаа компонент болгож бичсэн.
*/
function GoogleSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${btnSecondary} w-full`}>
      <GoogleIcon />
      {pending ? "Шилжиж байна..." : "Google-ээр үргэлжлүүлэх"}
    </button>
  );
}

export function GoogleAuth({ next, terms = false }: { next?: string; terms?: boolean }) {
  return (
    <div className="mb-6">
      <form action={signInWithGoogle}>
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <GoogleSubmit />
      </form>

      {/* Бүртгэл үүсгэх үед хариуцлагын тайлбарын шалгах нүд алгасагддаг тул
          зөвшөөрлийг товчны доор ил бичнэ. */}
      {terms ? (
        <p className="mt-2 text-center text-xs text-ink-soft">
          Үргэлжлүүлснээр{" "}
          <Link href="/disclaimer" target="_blank" className="font-semibold text-stamp hover:underline">
            хариуцлагын тайлбарыг
          </Link>{" "}
          хүлээн зөвшөөрч байна.
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-3 text-xs text-ink-soft">
        <span className="h-px flex-1 bg-ink/15" />
        эсвэл
        <span className="h-px flex-1 bg-ink/15" />
      </div>
    </div>
  );
}
