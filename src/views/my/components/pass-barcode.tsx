// Чимэглэл — уншигддаг штрих код биш. Хэрэглэгчийн id-аас гардаг тул нэг хүнд
// үргэлж ижил хэв гарч, сервер/клиент хоёрын render зөрөхгүй.

const WIDTH_CLS = ["w-px", "w-0.5", "w-1"];
const BAR_COUNT = 42;

function bars(seed: string): string[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const code = seed.charCodeAt(i % seed.length) + i * 7;
    return WIDTH_CLS[code % WIDTH_CLS.length];
  });
}

export function PassBarcode({ seed }: { seed: string }) {
  return (
    <div aria-hidden className="flex h-8 items-stretch gap-px">
      {bars(seed).map((width, i) => (
        <span key={i} className={`${width} ${i % 2 === 0 ? "bg-ink" : "bg-transparent"}`} />
      ))}
    </div>
  );
}
