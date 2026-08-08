import { ResetPasswordForm } from "./components";

export default function ResetPasswordView() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-slate-900">Шинэ нууц үг</h1>
        <p className="mb-6 text-sm text-slate-500">Шинэ нууц үгээ оруулснаар нэвтэрсэн хэвээр үлдэнэ.</p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
