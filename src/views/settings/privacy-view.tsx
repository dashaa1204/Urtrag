import Link from "next/link";
import { Card } from "@/components/ui";
import { RETENTION_LABEL } from "@/constant/settings";
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
        description="Устгасны дараа сэргээх боломжгүй. Нэвтрэх эрх, профайлын зураг, бичиг баримтын файл тань шууд устна."
        headingAs="h2"
        className="border-red-300"
      >
        <div className="mb-6 space-y-2 text-sm text-ink-soft">
          <p>
            <span className="font-semibold text-ink">Хэнтэй ч тохиролцоо хийж байгаагүй бол</span> зар, мессеж,
            үнэлгээ зэрэг бүх өгөгдөл тань шууд устна.
          </p>
          <p>
            <span className="font-semibold text-ink">Тохиролцоо хийж байсан бол</span> профайл тань нуугдаж,
            &quot;Устгагдсан хэрэглэгч&quot; гэж харагдана. Харин нэр, имэйл, утас болон тохиролцооны мессеж
            сүүлийн тохиролцооноос хойш {RETENTION_LABEL} хаалттай хадгалагдана. Ачаа алга болох зэрэг
            маргаан гарвал эсвэл хууль хяналтын байгууллага албан ёсоор хүсвэл энэ мэдээллийг ашиглана. Хугацаа
            дуусахад бүгд бүрэн устна.
          </p>
        </div>
        <DeleteAccountForm />
      </Card>
    </div>
  );
}
