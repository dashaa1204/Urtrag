import type { ListingType } from "@/types";

/**
 * Аялал ба ачааны зар бүх дэлгэц дээр ижил бүтэцтэй, зөвхөн бичвэрээрээ ялгаатай.
 * Тиймээс хос бичвэрүүдийг энд төвлөрүүлж, нэг view-г хоёуланд нь ашиглана.
 */
interface ListingCopy {
  listTitle: string;
  listDescription: string;
  createLabel: string;
  createHref: string;
  basePath: string;
  emptyTitle: string;
  emptyDescription: string;
  homeTitle: string;
  homeEmpty: string;
  myTitle: string;
  myEmpty: string;
  /** Хоосон жагсаалт дээрх урих холбоос. */
  myEmptyAction: string;
  profileTitle: string;
  newTitle: string;
  newDescription: string;
  editTitle: string;
  submitLabel: string;
}

/** Зар дээр хүсэлт илгээхэд шаардагдах ХОС зарын тухай бичвэр. */
interface MatchCopy {
  /** Сонголтын гарчиг. */
  pickLabel: string;
  /** Сонголтгүй, өөр чиглэлийн эсвэл хэн нэгний зар илгээгдвэл. */
  pickError: string;
  /** Ачаа нь аль хэдийн өөр аялагчтай тохирсон бол (ачаа хуваагдахгүй). */
  takenError: string;
  /** Тухайн чиглэлд тохирох зар байхгүй үеийн урилга. */
  emptyTitle: string;
  emptyDescription: (route: string) => string;
  /** Зартай ч аль нь ч тохирохгүй бол — тохирчихсон эсвэл жин нь багтахгүй. */
  blockedTitle: string;
  blockedDescription: string;
}

/**
 * Түлхүүр нь ХОС зарын төрөл (lib/listing.ts → counterpartType):
 * аялалын зар руу хандахад ачааны зар, ачааны зар руу хандахад аялал хэрэгтэй.
 */
export const MATCH_COPY: Record<ListingType, MatchCopy> = {
  shipment: {
    pickLabel: "Аль ачаагаа илгээх вэ?",
    pickError: "Энэ чиглэлийн ачааны зараа сонгоно уу.",
    takenError: "Энэ ачаа тань өөр аялагчтай аль хэдийн тохирсон байна.",
    emptyTitle: "Энэ чиглэлд оруулсан ачааны зар алга байна.",
    emptyDescription: (route) =>
      `${route} чиглэлд ачааны зараа оруулбал аялагч танд юу, хэдэн кг илгээхийг хараад хариулна.`,
    blockedTitle: "Энэ аялалд багтах ачаа тань алга байна.",
    blockedDescription:
      "Ачаанууд тань аль хэдийн тохирсон эсвэл аялалын үлдсэн сул жинд багтахгүй байна. Хөнгөн ачааны зар оруулах эсвэл өөр аялал сонгоно уу.",
  },
  trip: {
    pickLabel: "Аль аялалдаа авах вэ?",
    pickError: "Энэ чиглэлийн аялалаа сонгоно уу.",
    takenError: "Энэ ачаа өөр аялагчтай аль хэдийн тохирсон байна.",
    emptyTitle: "Энэ чиглэлд зарласан аялал алга байна.",
    emptyDescription: (route) =>
      `${route} чиглэлд аялалаа зарлавал илгээгч таны огноо, үнийг хараад хариулна.`,
    blockedTitle: "Энэ ачааг авах аялал тань алга байна.",
    blockedDescription:
      "Аялалуудын тань сул жин хүрэлцэхгүй эсвэл энэ ачаа өөр аялагчтай аль хэдийн тохирчихсон байна.",
  },
};

export const LISTING_COPY: Record<ListingType, ListingCopy> = {
  trip: {
    listTitle: "Аялалууд",
    listDescription: "Ачаа авч явах боломжтой аялагчид",
    createLabel: "+ Аялал зарлах",
    createHref: "/trips/new",
    basePath: "/trips",
    emptyTitle: "Одоогоор идэвхтэй аялал алга байна.",
    emptyDescription: "Та аялахаар төлөвлөж байгаа бол эхний зараа оруулаарай!",
    homeTitle: "Сүүлийн аялалууд",
    homeEmpty: "Одоогоор идэвхтэй аялал алга. Эхнийх нь та байгаарай! ✈️",
    myTitle: "Миний аялалууд",
    myEmpty: "Та одоогоор аялал зарлаагүй байна.",
    myEmptyAction: "Эхний аялалаа зарлах",
    profileTitle: "Идэвхтэй аялалууд",
    newTitle: "Аялал зарлах",
    newDescription:
      "Аялалынхаа мэдээллийг оруулбал ачаа илгээх хүсэлтэй хүмүүс тантай мессежээр холбогдоно.",
    editTitle: "Аялалын зар засах",
    submitLabel: "Аялал зарлах",
  },
  shipment: {
    listTitle: "Ачаанууд",
    listDescription: "Илгээхээр хүлээгдэж буй ачааны хүсэлтүүд",
    createLabel: "+ Ачаа илгээх хүсэлт",
    createHref: "/shipments/new",
    basePath: "/shipments",
    emptyTitle: "Одоогоор идэвхтэй ачааны хүсэлт алга байна.",
    emptyDescription: "Та ачаа илгээх гэж байгаа бол эхний хүсэлтээ оруулаарай!",
    homeTitle: "Сүүлийн ачаанууд",
    homeEmpty: "Одоогоор ачааны хүсэлт алга. Эхнийх нь та байгаарай! 📦",
    myTitle: "Миний ачаанууд",
    myEmpty: "Та одоогоор ачааны хүсэлт оруулаагүй байна.",
    myEmptyAction: "Эхний хүсэлтээ нийтлэх",
    profileTitle: "Идэвхтэй ачаанууд",
    newTitle: "Ачаа илгээх хүсэлт",
    newDescription:
      "Ачааныхаа мэдээллийг оруулбал тухайн чиглэлд аялах хүмүүс тантай мессежээр холбогдоно.",
    editTitle: "Ачааны хүсэлт засах",
    submitLabel: "Хүсэлт нийтлэх",
  },
};
