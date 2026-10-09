"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Field } from "./fields";
import { inputCls } from "./form";

export interface ComboboxOption {
  /** Талбарт бичигдэх, формоор илгээгдэх утга. */
  value: string;
  /** Мөрийн баруун талд гарах тайлбар — улсын нэр гэх мэт. */
  hint?: string;
  /** Утгандаа биш ч эдгээрээр хайхад олдоно. */
  keywords?: string[];
}

const MAX_SUGGESTIONS = 8;

/** Бичсэн текстээр эхэлдэг сонголтыг эхэнд нь, дотроо агуулсныг араас нь. */
function filterOptions(options: ComboboxOption[], query: string): ComboboxOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options.slice(0, MAX_SUGGESTIONS);

  const starts: ComboboxOption[] = [];
  const contains: ComboboxOption[] = [];
  for (const option of options) {
    const terms = [option.value, ...(option.keywords ?? [])].map((term) => term.toLowerCase());
    if (terms.some((term) => term.startsWith(q))) starts.push(option);
    else if (terms.some((term) => term.includes(q))) contains.push(option);
  }
  return [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
}

/**
 * Чөлөөтэй бичиж болох, доор нь санал болгодог талбар.
 * Утгыг эцэг компонент эзэмшинэ (сонгосон утгаас хамаарч өөр зүйл тооцоолохын тулд).
 */
export function ComboboxField({
  label,
  name,
  value,
  onValueChange,
  options,
  placeholder,
  optional,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  optional?: boolean;
  error?: string;
}) {
  const fieldId = useId();
  const listId = `${fieldId}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const suggestions = filterOptions(options, value);
  const visible = open && suggestions.length > 0;

  function select(option: ComboboxOption) {
    onValueChange(option.value);
    setOpen(false);
    setActive(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!visible) {
        setOpen(true);
        setActive(0);
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) => (index + step + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter" && visible) {
      event.preventDefault();
      select(suggestions[active] ?? suggestions[0]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <Field label={label} htmlFor={fieldId} optional={optional} error={error}>
      <div className="relative">
        <input
          id={fieldId}
          name={name}
          value={value}
          onChange={(event) => {
            onValueChange(event.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputCls}
          role="combobox"
          aria-expanded={visible}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
        />

        {visible ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border-2 border-ink/20 bg-card py-1"
          >
            {suggestions.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={index === active}
                // blur нь click-ээс өмнө ажилладаг тул mousedown дээр сонгоно
                onMouseDown={(event) => {
                  event.preventDefault();
                  select(option);
                }}
                onMouseEnter={() => setActive(index)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${
                  index === active ? "bg-ink/8 text-ink" : "text-ink-soft"
                }`}
              >
                <span>{option.value}</span>
                {option.hint ? <span className="shrink-0 text-xs text-ink-soft">{option.hint}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Field>
  );
}
