import Link from "next/link";
import { Card } from "@/components/ui";
import { DeleteAccountForm } from "./components";

const STORED = [
  "Нэр, имэйл, (өгсөн бол) утас, улс, танилцуулга",
  "Таны нийтэлсэн аялал, ачааны зарууд",
  "Бусад хэрэглэгчтэй солилцсон мессеж",
  "Өгсөн болон авсан үнэлгээ",
];

export default function PrivacySettingsView() {
  return (
    <div className="space-y-6">
      <Card title="Таны өгөгдөл" headingAs="h2">
        <p className="text-sm text-ink-soft">Бид дараах мэдээллийг хадгалдаг:</p>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
          {STORED.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden className="text-ink-soft/50">
                •
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-soft">
          Дэлгэрэнгүйг{" "}
          <Link href="/disclaimer" className="font-semibold text-stamp hover:underline">
            хариуцлагын тайлбар
          </Link>{" "}
          хэсгээс уншина уу.
        </p>
      </Card>

      <Card
        title="Бүртгэл устгах"
        description="Устгасны дараа сэргээх боломжгүй. Таны зар, мессеж, үнэлгээ бүгд хамт устана."
        headingAs="h2"
        className="border-red-300"
      >
        <DeleteAccountForm />
      </Card>
    </div>
  );
}
