// Тохиргооны хэсгүүд. Тус бүр өөрийн замтай тул хажуугийн цэс нь энгийн
// холбоос — JS-гүйгээр ажиллаж, шууд хуваалцаж болно.

export type SettingsIcon = "profile" | "identity" | "security" | "privacy";

export const SETTINGS_NAV: { href: string; label: string; icon: SettingsIcon }[] = [
  { href: "/settings", label: "Профайл", icon: "profile" },
  { href: "/settings/identity", label: "Бичиг баримт", icon: "identity" },
  { href: "/settings/security", label: "Аюулгүй байдал", icon: "security" },
  { href: "/settings/privacy", label: "Нууцлал", icon: "privacy" },
];

/** "Миний тухай" хэсгийн дээд хязгаар — форм ба server action хоёулаа шалгана. */
export const BIO_MAX = 500;

/** Бүртгэлээ устгасан, баримт нь хадгалагдаж буй хэрэглэгчийн харагдах нэр. */
export const DELETED_USER_NAME = "Устгагдсан хэрэглэгч";

/**
 * Тохиролцоо хийсэн хүн бүртгэлээ устгасны дараа түүний нэр, холбоо барих
 * мэдээлэл болон тохиролцооны яриаг хадгалах хугацаа — сүүлийн тохиролцооноос
 * тоолно. Postgres-ийн interval болон хэрэглэгчид харагдах бичвэр хоёулаа
 * эндээс уншина.
 */
export const RETENTION_INTERVAL = "1 year";
export const RETENTION_LABEL = "1 жил";
