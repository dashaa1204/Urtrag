// text-base on mobile: iOS Safari zooms the page in when a focused input is under 16px.
export const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm";
export const labelCls = "mb-1 block text-sm font-medium text-slate-700";

/*
  Товчны суурь. Мобайл дээр 44px хүрэлтийн талбай, дэлгэц дээр 40px.
  Hover дээр нэг пиксель дээшилж, дарахад буцаж суудаг — "дарагдсан" мэдрэмж өгнө.
  Фокусыг ring биш outline-аар өгсөн нь товчны сүүдэртэй зөрчилдөхгүй.
*/
const btnBase =
  "inline-flex min-h-11 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none sm:min-h-10";

export const btnPrimary = `${btnBase} bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-sm shadow-indigo-600/30 outline-indigo-600 hover:from-indigo-400 hover:to-indigo-500 hover:shadow-md hover:shadow-indigo-600/40 active:from-indigo-600 active:to-indigo-700 active:shadow-sm`;
export const btnSecondary = `${btnBase} border border-slate-200 bg-white text-slate-700 shadow-xs outline-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm active:bg-slate-100`;
export const btnDanger = `${btnBase} border border-red-200 bg-white text-red-600 shadow-xs outline-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-sm active:bg-red-100`;

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
