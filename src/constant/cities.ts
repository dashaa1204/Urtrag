// Зар дээр сонгож болох хот, улсуудын жагсаалт.
// Нэрийг англиар нэгтгэж хадгална (кирилл бичлэг хүн бүр өөрөөр бичдэг тул),
// харин хайхдаа кирилл болон нутгийн бичлэгээр нь бас олдог болгов.
// Аль ч хотоос аль ч хот руу зар тавьж болно — хотын улс нь зөвхөн шүүлт,
// далбаа харуулахад ашиглагдана.

export interface City {
  /** Хадгалагдах жишиг нэр — "Vienna" */
  name: string;
  country: string;
  /** ISO 3166-1 alpha-2 — "AT" */
  code: string;
  flag: string;
  /** Хайлтад туслах өөр бичлэгүүд — "Вена", "Wien" */
  aliases: string[];
}

export const COUNTRIES: Record<string, { country: string; flag: string; dial: string }> = {
  MN: { country: "Mongolia", flag: "🇲🇳", dial: "+976" },
  AT: { country: "Austria", flag: "🇦🇹", dial: "+43" },
  DE: { country: "Germany", flag: "🇩🇪", dial: "+49" },
  CZ: { country: "Czechia", flag: "🇨🇿", dial: "+420" },
  SK: { country: "Slovakia", flag: "🇸🇰", dial: "+421" },
  HU: { country: "Hungary", flag: "🇭🇺", dial: "+36" },
  PL: { country: "Poland", flag: "🇵🇱", dial: "+48" },
  CH: { country: "Switzerland", flag: "🇨🇭", dial: "+41" },
  NL: { country: "Netherlands", flag: "🇳🇱", dial: "+31" },
  BE: { country: "Belgium", flag: "🇧🇪", dial: "+32" },
  FR: { country: "France", flag: "🇫🇷", dial: "+33" },
  GB: { country: "United Kingdom", flag: "🇬🇧", dial: "+44" },
  IT: { country: "Italy", flag: "🇮🇹", dial: "+39" },
  ES: { country: "Spain", flag: "🇪🇸", dial: "+34" },
  SE: { country: "Sweden", flag: "🇸🇪", dial: "+46" },
  TR: { country: "Turkey", flag: "🇹🇷", dial: "+90" },
  RU: { country: "Russia", flag: "🇷🇺", dial: "+7" },
  KR: { country: "South Korea", flag: "🇰🇷", dial: "+82" },
  JP: { country: "Japan", flag: "🇯🇵", dial: "+81" },
  CN: { country: "China", flag: "🇨🇳", dial: "+86" },
  US: { country: "United States", flag: "🇺🇸", dial: "+1" },
};

/** Улс тус бүрд [англи нэр, ...өөр бичлэгүүд]. */
const CITY_NAMES: Record<string, string[][]> = {
  MN: [
    ["Ulaanbaatar", "Улаанбаатар", "УБ", "Ulanbator"],
    ["Erdenet", "Эрдэнэт"],
    ["Darkhan", "Дархан"],
    ["Choibalsan", "Чойбалсан"],
    ["Murun", "Мөрөн"],
    ["Khovd", "Ховд"],
  ],
  AT: [
    ["Vienna", "Вена", "Wien"],
    ["Graz", "Грац"],
    ["Linz", "Линц"],
    ["Salzburg", "Зальцбург"],
    ["Innsbruck", "Инсбрук"],
    ["Klagenfurt", "Клагенфурт"],
  ],
  DE: [
    ["Berlin", "Берлин"],
    ["Munich", "München", "Muenchen", "Мюнхен"],
    ["Frankfurt", "Франкфурт"],
    ["Hamburg", "Гамбург"],
    ["Cologne", "Köln", "Koeln", "Кёльн"],
    ["Stuttgart", "Штутгарт"],
    ["Düsseldorf", "Dusseldorf", "Дюссельдорф"],
  ],
  CZ: [
    ["Prague", "Praha", "Прага"],
    ["Brno", "Брно"],
  ],
  SK: [["Bratislava", "Братислав"]],
  HU: [["Budapest", "Будапешт"]],
  PL: [
    ["Warsaw", "Warszawa", "Варшав"],
    ["Krakow", "Kraków", "Краков"],
  ],
  CH: [
    ["Zurich", "Zürich", "Цюрих"],
    ["Geneva", "Genève", "Женев"],
  ],
  NL: [["Amsterdam", "Амстердам"]],
  BE: [["Brussels", "Bruxelles", "Брюссель"]],
  FR: [["Paris", "Парис"]],
  GB: [
    ["London", "Лондон"],
    ["Manchester", "Манчестер"],
  ],
  IT: [
    ["Rome", "Roma", "Ром"],
    ["Milan", "Milano", "Милан"],
  ],
  ES: [
    ["Madrid", "Мадрид"],
    ["Barcelona", "Барселон"],
  ],
  SE: [["Stockholm", "Стокгольм"]],
  TR: [["Istanbul", "Стамбул"]],
  RU: [
    ["Moscow", "Москва"],
    ["Irkutsk", "Эрхүү", "Иркутск"],
    ["Ulan-Ude", "Улаан-Үд"],
  ],
  KR: [
    ["Seoul", "Сөүл"],
    ["Busan", "Пусан"],
  ],
  JP: [
    ["Tokyo", "Токио"],
    ["Osaka", "Осака"],
  ],
  CN: [
    ["Beijing", "Бээжин"],
    ["Hohhot", "Хөх хот"],
    ["Erenhot", "Эрээн"],
  ],
  US: [
    ["Chicago", "Чикаго"],
    ["New York", "Нью-Йорк"],
    ["Los Angeles", "Лос-Анжелес"],
  ],
};

export const CITIES: City[] = Object.entries(CITY_NAMES).flatMap(([code, rows]) =>
  rows.map(([name, ...aliases]) => ({ name, code, ...COUNTRIES[code], aliases }))
);

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

const CITY_BY_KEY = new Map<string, City>();
for (const city of CITIES) {
  for (const key of [city.name, ...city.aliases]) CITY_BY_KEY.set(normalize(key), city);
}

/** Хэрэглэгчийн бичсэн текстийг жагсаалтын хоттой тааруулна (кирилл бичлэг ч болно). */
export function findCity(value: string | null | undefined): City | undefined {
  return value ? CITY_BY_KEY.get(normalize(value)) : undefined;
}

/** Шүүлтүүрийн сонголтод — зартай байж болох улсууд цагаан толгойн дарааллаар. */
export const COUNTRY_OPTIONS = Object.entries(COUNTRIES)
  .map(([code, { country, flag }]) => ({ code, country, flag }))
  .sort((a, b) => a.country.localeCompare(b.country));

/**
 * Утасны улсын кодын сонголт. Австри, Монгол хоёр хамгийн түгээмэл тул
 * жагсаалтын эхэнд, үлдсэн нь цагаан толгойн дарааллаар.
 */
const DIAL_FIRST = ["AT", "MN"];

function dialRank(code: string): number {
  const index = DIAL_FIRST.indexOf(code);
  return index === -1 ? DIAL_FIRST.length : index;
}

export const DIAL_OPTIONS = Object.entries(COUNTRIES)
  .map(([code, { country, flag, dial }]) => ({ code, country, flag, dial }))
  .sort((a, b) => dialRank(a.code) - dialRank(b.code) || a.country.localeCompare(b.country));

/** Урт кодыг эхэлж тааруулна: "+1" нь "+41"-ийг булаахаас сэргийлнэ. */
const DIALS_BY_LENGTH = [...new Set(DIAL_OPTIONS.map((option) => option.dial))].sort(
  (a, b) => b.length - a.length
);

export function isDialCode(value: unknown): value is string {
  return typeof value === "string" && DIALS_BY_LENGTH.includes(value);
}

export function dialCode(countryCode: string | null): string {
  return (countryCode && COUNTRIES[countryCode]?.dial) || "";
}

export function findDialCode(phone: string): string | undefined {
  return DIALS_BY_LENGTH.find((dial) => phone.startsWith(dial));
}

export function isCountryCode(value: unknown): value is string {
  return typeof value === "string" && value in COUNTRIES;
}

export function countryFlag(code: string): string {
  return COUNTRIES[code]?.flag ?? "🌍";
}

export function countryName(code: string): string {
  return COUNTRIES[code]?.country ?? code;
}
