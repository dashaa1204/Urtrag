import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500">
        <p>✈️ Замдаа — Австри ↔ Монгол ачаа илгээлтийн платформ</p>
        <div className="flex items-center gap-4">
          <Link href="/disclaimer" className="hover:text-slate-900 hover:underline">
            Хариуцлагын тайлбар
          </Link>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 pb-6 text-xs text-slate-400">
        Замдаа зөвхөн хэрэглэгчдийг холбоно. Ачаа, төлбөр, гаалийн хариуцлагыг талууд өөрсдөө хүлээнэ.
      </div>
    </footer>
  );
}
