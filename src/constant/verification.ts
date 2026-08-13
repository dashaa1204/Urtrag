// Бичиг баримтаар баталгаажуулах тохиргоо. Форм, server action, setup скрипт
// гурав нь ижил хязгаарыг уншина.

export const IDENTITY_BUCKET = "identity-docs";

export const MAX_DOC_BYTES = 5 * 1024 * 1024;
export const MAX_DOC_LABEL = "5 МБ";

export const DOC_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

/** input[accept] болон хэрэглэгчид харагдах бичвэр. */
export const DOC_ACCEPT = DOC_MIME_TYPES.join(",");
export const DOC_FORMATS_LABEL = "JPG, PNG, WebP эсвэл PDF";

export const VERIFICATION_STEPS = [
  "Иргэний үнэмлэх, гадаад паспорт эсвэл жолооны үнэмлэхийнхээ зургийг оруулна. Үнэмлэх, жолооны үнэмлэх бол ар талыг нь бас нэмнэ үү.",
  "Хүсвэл сошиал хаягийнхаа холбоосыг нэмж болно — таныг таньж баталгаажуулахад тусална.",
  "Бид 24-48 цагийн дотор шалгаж, баталгаажсан тэмдгийг тань идэвхжүүлнэ.",
];

/** Шийдвэр гарсны дараа файлыг устгана — эндээс хойш зөвхөн төлөв үлдэнэ. */
export const RETENTION_NOTE =
  "Баримтын зургийг зөвхөн шалгах зорилгоор, хаалттай хадгалалтад байршуулна. Шийдвэр гармагц файлыг устгаж, зөвхөн баталгаажсан төлөвийг үлдээнэ.";
