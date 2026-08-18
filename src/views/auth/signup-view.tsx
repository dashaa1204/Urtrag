import Link from "next/link";
import { AuthCard, GoogleAuth, SignupForm } from "./components";

export default function SignupView({ next }: { next?: string }) {
  return (
    <AuthCard
      title="Бүртгүүлэх"
      description="Аялал эсвэл ачаагаа зарлахын тулд бүртгүүлээрэй."
      footer={
        <p>
          Бүртгэлтэй юу?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-semibold text-stamp hover:underline"
          >
            Нэвтрэх
          </Link>
        </p>
      }
    >
      <GoogleAuth next={next} terms />
      <SignupForm next={next} />
    </AuthCard>
  );
}
