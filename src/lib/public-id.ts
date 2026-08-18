// Дотоод дугаарыг (1, 2, 3 ...) нийтэд харагдах богино код болгож хувиргана.
//
// Яагаад: URL дээр "/shipments/5" гэж гарах нь хоёр талаараа муу. Нэгд,
// сайтад хэдэн зар байгааг ил гаргана (5 дугаартай ачаа гэдэг нь тавдугаар
// ачаа). Хоёрт, 1-ээс дараалуулан бичээд бүх зарыг цуглуулах нь хэн ч
// хийчихээр амархан.
//
// ЭНЭ НЬ НУУЦЛАЛ БИШ — далдлалт. Алгоритм ба доорх давс нь эх код дотор
// байгаа тул мэддэг хүн буцааж тайлж чадна. Хэн юуг үзэх, засах эрхтэйг
// урьдын адил серверийн шалгалт (эзэмшил, RLS) шийднэ; код нь зөвхөн
// "дараалсан дугаар" гэдэг мэдээллийг хаяглалтаас арчина.
//
// Хэрхэн: 30 битийг Feistel сүлжээгээр орлуулаад base32-оор бичнэ. Feistel
// нь эргэх (bijective) тул код бүр яг нэг дугаартай тохирно — өөрөөр хэлбэл
// DB-д нэмэлт багана, давхар индекс хэрэггүй.

// Зөвхөн серверт. Давс нь браузарын багц дотор орвол хэн ч кодыг үүсгэж,
// 1-ээс эхлээд бүх зарын хаягийг гаргаж чадна — тэгвэл далдлалт утгагүй
// болно. Клиент компонентод хаяг хэрэгтэй бол серверээс бэлэн байдлаар нь
// (жишээ нь ConversationPreview.href) дамжуулна.
import "server-only";

/**
 * Төрөл бүр өөрийн түлхүүртэй. Ингэснээр 5 дугаартай аялал, 5 дугаартай ачаа
 * хоёр ӨӨР кодтой болно — эс бөгөөс хоёр хаягийн сүүл ижил гарч, дугаар нь
 * дараалсан гэдэг нь шууд илэрнэ.
 */
export type PublicIdKind = "trip" | "shipment" | "conversation";

/**
 * Кодыг тогтвортой байлгах давс. ҮҮНИЙГ СОЛИХГҮЙ — солих юм бол өмнө нь
 * тараагдсан бүх холбоос (сошиал дээрх постууд, Google-ийн индекс) 404 болно.
 */
const SALT = "crowdshipping.mn/2026";

/** Crockford base32 — I, L, O, U байхгүй тул 1/I, 0/O хоёрыг андуурахгүй. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Хагас бүр 15 бит: нийт 30 бит буюу 1,073,741,823 хүртэлх дугаар. */
const HALF_BITS = 15;
const HALF_MASK = 0x7fff;
const MAX_ID = 0x3fffffff;
const ROUNDS = 4;
/** 30 бит ÷ 5 бит = яг 6 тэмдэгт. Урт нь тогтмол тул код үргэлж ижил харагдана. */
const CODE_LENGTH = 6;

/** FNV-1a — раунд бүрийн түлхүүрийг давс, төрөл хоёроос гаргахад л хэрэглэнэ. */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

const keyCache = new Map<string, number[]>();

function roundKeys(kind: PublicIdKind): number[] {
  let keys = keyCache.get(kind);
  if (!keys) {
    keys = Array.from({ length: ROUNDS }, (_, round) => fnv1a(`${SALT}:${kind}:${round}`));
    keyCache.set(kind, keys);
  }
  return keys;
}

/** Feistel-ийн раундын функц. Эргэх шаардлагагүй — зөвхөн сайн холих ёстой. */
function scramble(value: number, key: number): number {
  let x = (value ^ key) >>> 0;
  x = Math.imul(x, 0x2545f491) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 0x9e3779b1) >>> 0;
  x ^= x >>> 15;
  return x & HALF_MASK;
}

/**
 * Дугаарыг 6 тэмдэгт код болгоно. Хязгаараас хэтэрсэн (эсвэл бүхэл биш)
 * дугаарт null — дуудагч тал ийм зар байхгүй мэт хандана.
 */
export function publicCode(kind: PublicIdKind, id: number): string | null {
  if (!Number.isInteger(id) || id <= 0 || id > MAX_ID) return null;

  const keys = roundKeys(kind);
  let left = id >>> HALF_BITS;
  let right = id & HALF_MASK;
  for (let round = 0; round < ROUNDS; round++) {
    const next = (left ^ scramble(right, keys[round])) & HALF_MASK;
    left = right;
    right = next;
  }

  let value = ((left << HALF_BITS) | right) >>> 0;
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code = ALPHABET[value & 31] + code;
    value >>>= 5;
  }
  return code;
}

/**
 * Кодыг буцааж дугаар болгоно. Танихгүй тэмдэгт, буруу урт, хязгаараас
 * хэтэрсэн утгад null.
 *
 * Жижиг үсгээр бичсэн ч, 1-ийн оронд I/l, 0-ийн оронд O бичсэн ч уншина —
 * хүн гараар хуулж бичихэд хамгийн их гардаг алдаа энэ хоёр.
 */
export function readPublicCode(kind: PublicIdKind, code: string): number | null {
  if (code.length !== CODE_LENGTH) return null;

  let value = 0;
  for (const char of code.toUpperCase()) {
    const digit = ALPHABET.indexOf(char === "I" || char === "L" ? "1" : char === "O" ? "0" : char);
    if (digit < 0) return null;
    value = ((value << 5) | digit) >>> 0;
  }

  const keys = roundKeys(kind);
  let left = value >>> HALF_BITS;
  let right = value & HALF_MASK;
  for (let round = ROUNDS - 1; round >= 0; round--) {
    const previous = (right ^ scramble(left, keys[round])) & HALF_MASK;
    right = left;
    left = previous;
  }

  const id = ((left << HALF_BITS) | right) >>> 0;
  return id > 0 && id <= MAX_ID ? id : null;
}
