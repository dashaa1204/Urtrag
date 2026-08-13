import { DIAL_OPTIONS } from "@/constant/cities";
import { Field } from "./fields";
import { inputCls } from "./form";

/**
 * Улсын код + дугаар. Хоёулаа тусдаа нэртэй тул server action дээр
 * joinPhone()-оор нийлүүлнэ (src/lib/phone.ts).
 */
export function PhoneField({
  code,
  number,
  hint,
  error,
}: {
  code?: string;
  number?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <Field label="Утас" htmlFor="phone" optional hint={hint} error={error}>
      <div className="flex gap-2">
        <select
          name="phone_code"
          defaultValue={code}
          aria-label="Улсын код"
          className={`${inputCls} w-32 shrink-0`}
        >
          <option value="">Код</option>
          {DIAL_OPTIONS.map((option) => (
            <option key={option.code} value={option.dial}>
              {option.flag} {option.dial}
            </option>
          ))}
        </select>

        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          defaultValue={number}
          placeholder="660 123 4567"
          className={inputCls}
        />
      </div>
    </Field>
  );
}
