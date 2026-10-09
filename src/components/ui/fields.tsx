import type { ComponentProps, ReactNode } from "react";
import { btnPrimary, FieldError, inputCls, labelCls } from "./form";

interface FieldShell {
  label: string;
  /** Гарчгийн ард "(заавал биш)" гэж бичнэ. */
  optional?: boolean;
  /** Талбарын доор гарах жижиг тайлбар — хаана харагдахыг мэдэгдэхэд. */
  hint?: string;
  error?: string;
}

/** Шошго + талбар + алдааны мессежийн нийтлэг байрлал. */
export function Field({
  label,
  htmlFor,
  optional,
  hint,
  error,
  children,
}: FieldShell & { htmlFor?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>
        {label} {optional ? <span className="font-normal text-ink-soft">(заавал биш)</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  );
}

/** Хоёр талбарыг зэрэгцүүлэх мөр (жин + үнэ, хаанаас + хаашаа гэх мэт). */
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

type InputProps = FieldShell & Omit<ComponentProps<"input">, "className">;

export function TextField({ label, optional, hint, error, id, name, ...props }: InputProps) {
  const fieldId = id ?? name;
  return (
    <Field label={label} htmlFor={fieldId} optional={optional} hint={hint} error={error}>
      <input id={fieldId} name={name} className={inputCls} {...props} />
    </Field>
  );
}

type TextAreaProps = FieldShell & Omit<ComponentProps<"textarea">, "className">;

export function TextAreaField({ label, optional, hint, error, id, name, ...props }: TextAreaProps) {
  const fieldId = id ?? name;
  return (
    <Field label={label} htmlFor={fieldId} optional={optional} hint={hint} error={error}>
      <textarea id={fieldId} name={name} className={inputCls} {...props} />
    </Field>
  );
}

type SelectProps = FieldShell & Omit<ComponentProps<"select">, "className">;

export function SelectField({ label, optional, hint, error, id, name, children, ...props }: SelectProps) {
  const fieldId = id ?? name;
  return (
    <Field label={label} htmlFor={fieldId} optional={optional} hint={hint} error={error}>
      <select id={fieldId} name={name} className={inputCls} {...props}>
        {children}
      </select>
    </Field>
  );
}

/** Формын илгээх товч — хүлээлтийн бичвэрийг нэг газраас удирдана. */
export function SubmitButton({
  pending,
  disabled = false,
  pendingLabel = "Хадгалж байна...",
  className = "",
  children,
}: {
  pending: boolean;
  /** Хүлээлтээс өөр шалтгаанаар идэвхгүй болгох (жишээ нь од сонгоогүй). */
  disabled?: boolean;
  pendingLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button type="submit" disabled={pending || disabled} className={`${btnPrimary} ${className}`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
