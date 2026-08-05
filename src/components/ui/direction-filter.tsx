import Link from "next/link";
import type { Direction } from "@/types";
import { DIRECTIONS } from "@/constant/directions";

const chipCls = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm font-medium transition ${
    active
      ? "border-indigo-600 bg-indigo-600 text-white"
      : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300 hover:text-slate-900"
  }`;

export function DirectionFilter({ current, basePath }: { current?: Direction; basePath: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={basePath} className={chipCls(!current)}>
        Бүгд
      </Link>
      {(Object.keys(DIRECTIONS) as Direction[]).map((direction) => (
        <Link
          key={direction}
          href={`${basePath}?direction=${direction}`}
          className={chipCls(current === direction)}
        >
          {DIRECTIONS[direction].label}
        </Link>
      ))}
    </div>
  );
}
