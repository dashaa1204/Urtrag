const STEPS = [
  {
    icon: "🔍",
    title: "Зараа олоорой",
    text: "Чиглэл, огноогоор нь шүүж өөрт тохирох аялагч эсвэл ачааг олоорой.",
  },
  {
    icon: "💬",
    title: "Мессежээр тохиролцоорой",
    text: "Үнэ, уулзах газар, ачааны дэлгэрэнгүйг платформ дээрээ шууд ярилцаарай.",
  },
  {
    icon: "🤝",
    title: "Ачаагаа хүргүүлээрэй",
    text: "Аялагч ачааг тань авч очоод хүлээлгэн өгнө. Ихэвчлэн 1 кг нь 10–15€.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12">
      <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">Хэрхэн ажилладаг вэ?</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="text-3xl">{step.icon}</div>
            <h3 className="mt-3 font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
