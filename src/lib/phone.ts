// Утасны дугаарыг нэг л текст баганад ("+43 660 1234567") хадгална. Формд
// улсын код, дугаар хоёр тусдаа талбар байдаг тул энд салгаж, нийлүүлнэ.

import { findDialCode, isDialCode } from "@/constant/cities";

export interface PhoneParts {
  /** "+43" — олдоогүй бол хоосон. */
  code: string;
  number: string;
}

/** Хадгалсан утгыг формын хоёр талбар болгоно. */
export function splitPhone(phone: string | null | undefined): PhoneParts {
  const value = phone?.trim() ?? "";
  if (!value) return { code: "", number: "" };

  const dial = findDialCode(value);
  return dial
    ? { code: dial, number: value.slice(dial.length).trim() }
    : { code: "", number: value };
}

const DIGITS_RE = /^[\d\s()-]+$/;

/**
 * Формын утгыг шалгаж, хадгалах хэлбэрт нийлүүлнэ.
 * Дугаар хоосон бол утас өгөөгүй гэж үзнэ (заавал биш талбар).
 */
export function joinPhone(
  code: string,
  number: string
): { ok: true; phone: string | null } | { ok: false; error: string } {
  let dial = code;
  let value = number.trim();
  if (value.length === 0) return { ok: true, phone: null };

  // Бүтэн дугаараа ("+43 660 ...") дугаарын нүдэнд буулгасан бол салгаж авна
  if (value.startsWith("+")) {
    const parts = splitPhone(value);
    if (parts.code) {
      dial = parts.code;
      value = parts.number;
    }
  }

  if (!DIGITS_RE.test(value)) return { ok: false, error: "Дугаарыг зөвхөн тоогоор бичнэ үү." };

  const digits = value.replace(/\D/g, "");
  if (digits.length < 4 || digits.length > 15) return { ok: false, error: "Утасны дугаар буруу байна." };
  if (!isDialCode(dial)) return { ok: false, error: "Улсын кодоо сонгоно уу." };

  // Хэрэглэгчийн бичсэн зайг хэвээр үлдээнэ — уншихад амар байлгах үүднээс.
  return { ok: true, phone: `${dial} ${value.replace(/\s+/g, " ")}` };
}
