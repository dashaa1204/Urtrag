import type { ReactNode } from "react";
import type { ListingType } from "@/types";
import { LISTING_COPY } from "@/constant/listings";
import { Card, PageContainer } from "@/components/ui";

/** Зар нэмэх/засах формын нийтлэг хайрцаг. Формоо children-ээр өгнө. */
export default function ListingFormView({
  type,
  mode,
  children,
}: {
  type: ListingType;
  mode: "new" | "edit";
  children: ReactNode;
}) {
  const copy = LISTING_COPY[type];

  return (
    <PageContainer width="narrow">
      <Card
        title={mode === "new" ? copy.newTitle : copy.editTitle}
        description={mode === "new" ? copy.newDescription : "Мэдээллээ шинэчлээд хадгална уу."}
      >
        {children}
      </Card>
    </PageContainer>
  );
}
