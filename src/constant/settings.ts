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

/** Бүртгэл устгахын өмнө бичүүлэх үг. Санамсаргүй дарахаас хамгаална. */
export const DELETE_CONFIRM_WORD = "УСТГАХ";
