import type { ReactNode } from "react";
import { Card, PageContainer } from "@/components/ui";

/** Нэвтрэх / бүртгүүлэх / нууц үг сэргээх дөрвөн хуудасны нийтлэг хайрцаг. */
export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <PageContainer width="form" roomy>
      <Card title={title} description={description}>
        {children}
        {footer ? <div className="mt-4 space-y-4 text-center text-sm text-ink-soft">{footer}</div> : null}
      </Card>
    </PageContainer>
  );
}
