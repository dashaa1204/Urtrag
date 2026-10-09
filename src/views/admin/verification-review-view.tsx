import type { PendingVerification } from "@/types";
import { decideVerificationAction } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import {
  btnDanger,
  btnPrimary,
  btnSm,
  Card,
  EmptyState,
  inputCls,
  labelCls,
  SectionHeader,
} from "@/components/ui";

export interface VerificationRow extends PendingVerification {
  /** Богино хугацааны signed URL — bucket нь хаалттай тул шууд зам ажиллахгүй. */
  front_url: string | null;
  back_url: string | null;
}

const docCls = "text-sm font-semibold text-stamp hover:underline";

export default function VerificationReviewView({ rows }: { rows: VerificationRow[] }) {
  return (
    <div>
      {/* Хуудасны гарчиг, таб нь /admin layout-аас ирнэ. */}
      <SectionHeader title="Баримт шалгах" />
      <p className="mb-4 text-sm text-ink-soft">
        Хүлээгдэж буй хүсэлтүүд. Шийдвэр гармагц баримтын файл устна.
      </p>

      {rows.length === 0 ? (
        <EmptyState title="Хүлээгдэж буй хүсэлт алга." />
      ) : (
        <div className="space-y-6">
          {rows.map((row) => (
            <Card key={row.user_id} title={row.name} headingAs="h2">
              <p className="text-sm text-ink-soft">
                Илгээсэн: {formatDate(row.submitted_at)}
                {row.social_url ? (
                  <>
                    {" · "}
                    <a href={row.social_url} target="_blank" rel="noreferrer" className={docCls}>
                      Сошиал хаяг
                    </a>
                  </>
                ) : null}
              </p>

              <div className="mt-3 flex flex-wrap gap-4">
                {row.front_url ? (
                  <a href={row.front_url} target="_blank" rel="noreferrer" className={docCls}>
                    Нүүр талыг харах
                  </a>
                ) : (
                  <span className="text-sm text-ink-soft">Нүүр тал алга</span>
                )}
                {row.back_url ? (
                  <a href={row.back_url} target="_blank" rel="noreferrer" className={docCls}>
                    Ар талыг харах
                  </a>
                ) : null}
              </div>

              <form action={decideVerificationAction} className="mt-4 space-y-3">
                <input type="hidden" name="user_id" value={row.user_id} />
                <div>
                  <label htmlFor={`note-${row.user_id}`} className={labelCls}>
                    Тайлбар (татгалзсан бол хэрэглэгчид харагдана)
                  </label>
                  <input
                    id={`note-${row.user_id}`}
                    name="note"
                    className={inputCls}
                    placeholder="Жишээ нь: зураг бүдэг байна."
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    name="decision"
                    value="approved"
                    className={`${btnPrimary} ${btnSm}`}
                  >
                    Баталгаажуулах
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="rejected"
                    className={`${btnDanger} ${btnSm}`}
                  >
                    Татгалзах
                  </button>
                </div>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
