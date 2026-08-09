import Link from "next/link";
import { FormError } from "@/components/ui";
import { AuthCard, LoginForm } from "./components";

export default function LoginView({ next, error }: { next?: string; error?: string }) {
  return (
    <AuthCard
      title="Нэвтрэх"
      description="Замдаа платформд тавтай морил!"
      footer={
        <>
          <p>
            <Link href="/forgot-password" className="hover:text-indigo-600 hover:underline">
              Нууц үгээ мартсан уу?
            </Link>
          </p>
          <p>
            Бүртгэлгүй юу?{" "}
            <Link
              href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
              className="font-semibold text-indigo-600 hover:underline"
            >
              Бүртгүүлэх
            </Link>
          </p>
        </>
      }
    >
      {error ? (
        <div className="mb-4">
          <FormError message={error} />
        </div>
      ) : null}
      <LoginForm next={next} />
    </AuthCard>
  );
}
