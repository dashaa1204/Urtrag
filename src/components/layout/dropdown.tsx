"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface DropdownProps {
  /** Товчны aria-label */
  label: string;
  trigger: ReactNode;
  triggerCls: string;
  panelCls?: string;
  children: ReactNode;
}

/** Навигацийн хонх/профайл цэсэнд зориулсан нээгддэг самбар. */
export function Dropdown({ label, trigger, triggerCls, panelCls = "w-56", children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);
  const rootRef = useRef<HTMLDivElement>(null);

  // Хуудас солигдоход цэсийг хаана.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className={triggerCls}
      >
        {trigger}
      </button>

      {open ? (
        <div
          role="menu"
          className={`absolute right-0 top-full mt-2 ${panelCls} rounded-lg border-2 border-ink/20 bg-card p-1.5`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
