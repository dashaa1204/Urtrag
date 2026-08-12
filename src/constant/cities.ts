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

export const COUNTRIES: Record<string, { country: string; flag: string }> = {
  MN: { country: "Mongolia", flag: "🇲🇳" },
  AT: { country: "Austria", flag: "🇦🇹" },
  DE: { country: "Germany", flag: "🇩🇪" },
  CZ: { country: "Czechia", flag: "🇨🇿" },
  SK: { country: "Slovakia", flag: "🇸🇰" },
  HU: { country: "Hungary", flag: "🇭🇺" },
  PL: { country: "Poland", flag: "🇵🇱" },
  CH: { country: "Switzerland", flag: "🇨🇭" },
  NL: { country: "Netherlands", flag: "🇳🇱" },
  BE: { country: "Belgium", flag: "🇧🇪" },
  FR: { country: "France", flag: "🇫🇷" },
  GB: { country: "United Kingdom", flag: "🇬🇧" },
  IT: { country: "Italy", flag: "🇮🇹" },
  ES: { country: "Spain", flag: "🇪🇸" },
  SE: { country: "Sweden", flag: "🇸🇪" },
  TR: { country: "Turkey", flag: "🇹🇷" },
  RU: { country: "Russia", flag: "🇷🇺" },
  KR: { country: "South Korea", flag: "🇰🇷" },
  JP: { country: "Japan", flag: "🇯🇵" },
  CN: { country: "China", flag: "🇨🇳" },
  US: { country: "United States", flag: "🇺🇸" },
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

export function isCountryCode(value: unknown): value is string {
  return typeof value === "string" && value in COUNTRIES;
}

export function countryFlag(code: string): string {
  return COUNTRIES[code]?.flag ?? "🌍";
}

export function countryName(code: string): string {
  return COUNTRIES[code]?.country ?? code;
}
