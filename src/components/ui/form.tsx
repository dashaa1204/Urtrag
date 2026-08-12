// text-base on mobile: iOS Safari zooms the page in when a focused input is under 16px.
export const inputCls =
  "w-full rounded-lg border-2 border-ink/15 bg-card px-3 py-2 text-base text-ink outline-none transition focus:border-ink/60 sm:text-sm";
export const labelCls = "mb-1 block text-sm font-medium text-ink";

/*
  Товчны суурь. Мобайл дээр 44px хүрэлтийн талбай, дэлгэц дээр 40px.

  Flat: градиент ба сүүдэр байхгүй — өнгө, шугам хоёроор л ялгана. Эскизүүд
  тэгш хавтгай бэхээр зурагдсан тул хэмжээст сүүдэр хажууд нь зохимжгүй.
  Hover дээр нэг пиксель дээшилж, дарахад буцаж суудаг мэдрэмжийг үлдээв.
*/
const btnBase =
  "inline-flex min-h-11 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 sm:min-h-10";

export const btnPrimary = `${btnBase} bg-ink text-paper outline-ink hover:bg-ink/88 active:bg-ink`;
export const btnSecondary = `${btnBase} border-2 border-ink/20 text-ink outline-ink hover:border-ink/45 hover:bg-ink/5 active:bg-ink/10`;
export const btnDanger = `${btnBase} border-2 border-red-300 text-red-700 outline-red-500 hover:border-red-400 hover:bg-red-50 active:bg-red-100`;

/* Хэмжээний нэмэлт: аль ч variant-ийн ард залгаж бичнэ. */
export const btnSm = "min-h-9 gap-1.5 rounded-lg px-3 sm:min-h-9";
// text-base биш text-[1rem]: суурь дэх text-sm-тэй мөргөлдөхөд arbitrary утга нь CSS-д хожим гарч ялна.
export const btnLg = "min-h-12 gap-2.5 px-6 text-[1rem] sm:min-h-12";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>;
}

export function FormNotice({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>;
}
