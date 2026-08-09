import { AuthCard, ResetPasswordForm } from "./components";

export default function ResetPasswordView() {
  return (
    <AuthCard title="Шинэ нууц үг" description="Шинэ нууц үгээ оруулснаар нэвтэрсэн хэвээр үлдэнэ.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
