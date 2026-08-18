import Link from "next/link";
import { FormError } from "@/components/ui";
import { AuthCard, GoogleAuth, LoginForm } from "./components";

export default function LoginView({ next, error }: { next?: string; error?: string }) {
  return (
    <AuthCard
      title="Нэвтрэх"
      description="Urtrag платформд тавтай морил!"
      footer={
        <>
          <p>
            <Link href="/forgot-password" className="hover:text-stamp hover:underline">
              Нууц үгээ мартсан уу?
            </Link>
          </p>
          <p>
            Бүртгэлгүй юу?{" "}
            <Link
              href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
              className="font-semibold text-stamp hover:underline"
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
      <GoogleAuth next={next} />
      <LoginForm next={next} />
    </AuthCard>
  );
}
