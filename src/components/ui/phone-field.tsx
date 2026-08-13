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
      {/*
        inputCls дотор w-full байгаа тул кодын өргөнийг w-32-оор заах гэвэл
        CSS-д хожим бичигдсэн w-full нь ялдаг. Өргөнийг багана өөрөө барина.
        Улсын нэр багтахаар өргөн хэрэгтэй тул нарийн дэлгэцэн дээр дээр доор нь тавина.
      */}
      <div className="grid gap-2 sm:grid-cols-[13rem_1fr]">
        {/*
          Нэр эхэлж бичигдэнэ — гар дээр үсэг дарахад браузер тухайн улс руу
          үсэрнэ. Далбаа урд нь байвал энэ таарахаа болино.
        */}
        <select name="phone_code" defaultValue={code} aria-label="Улсын код" className={inputCls}>
          <option value="">Улс сонгох</option>
          {DIAL_OPTIONS.map((option) => (
            <option key={option.code} value={option.dial}>
              {option.country} ({option.dial})
            </option>
          ))}
        </select>

        {/* min-w-0: input-ийн өгөгдмөл дотоод өргөн 1fr баганыг түлхэхээс сэргийлнэ */}
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          defaultValue={number}
          placeholder="660 123 4567"
          className={`${inputCls} min-w-0`}
        />
      </div>
    </Field>
  );
}
