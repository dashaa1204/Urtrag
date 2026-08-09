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
  profileTitle: string;
  newTitle: string;
  newDescription: string;
  editTitle: string;
  submitLabel: string;
}

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
    myTitle: "Аялалууд",
    myEmpty: "Та одоогоор аялал зарлаагүй байна.",
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
    myTitle: "Ачаанууд",
    myEmpty: "Та одоогоор ачааны хүсэлт оруулаагүй байна.",
    profileTitle: "Идэвхтэй ачаанууд",
    newTitle: "Ачаа илгээх хүсэлт",
    newDescription:
      "Ачааныхаа мэдээллийг оруулбал тухайн чиглэлд аялах хүмүүс тантай мессежээр холбогдоно.",
    editTitle: "Ачааны хүсэлт засах",
    submitLabel: "Хүсэлт нийтлэх",
  },
};
