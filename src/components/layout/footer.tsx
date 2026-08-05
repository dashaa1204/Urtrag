export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500">
        <p>✈️ Замдаа — Австри ↔ Монгол ачаа илгээлтийн платформ</p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
