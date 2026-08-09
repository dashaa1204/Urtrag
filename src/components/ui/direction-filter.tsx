import Link from "next/link";
import type { Direction } from "@/types";
import { DIRECTIONS } from "@/constant/directions";

const chipCls = (active: boolean) =>
  `inline-flex min-h-9 select-none items-center rounded-full border px-4 text-sm font-medium transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
    active
      ? "border-transparent bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-sm shadow-indigo-600/30"
      : "border-slate-200 bg-white text-slate-600 shadow-xs hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700 active:bg-indigo-100"
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
