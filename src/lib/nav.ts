/**
 * "Хаашаа буцах" замыг цэвэрлэнэ. Зөвхөн дотоод зам зөвшөөрөгдөнө — "//"-ээр
 * эхэлсэн зам нь өөр домэйн руу заадаг тул нээлттэй redirect болно.
 */
export function internalPath(value: unknown): string | null {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : null;
}
