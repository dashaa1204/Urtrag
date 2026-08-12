import Link from "next/link";
import { Logo } from "@/components/ui";
import { SITE } from "@/constant/site";

export function Footer() {
  return (
    <footer className="border-t-2 border-ink/10 bg-card">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-ink-soft">
        <p className="flex items-center gap-2">
          <Logo className="h-5 w-auto" />
          <span>— {SITE.tagline}</span>
        </p>
        <div className="flex items-center gap-4">
          <Link href="/disclaimer" className="hover:text-ink hover:underline">
            Хариуцлагын тайлбар
          </Link>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 pb-6 text-xs text-ink-soft/70">
        Zamdaa зөвхөн хэрэглэгчдийг холбоно. Ачаа, төлбөр, гаалийн хариуцлагыг талууд өөрсдөө хүлээнэ.
      </div>
    </footer>
  );
}
