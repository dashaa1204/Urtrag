import { LottiePlayer, PageContainer, PageHeader } from "@/components/ui";

/*
  Түр зуурын жишээ хуудас — LottiePlayer ажиллаж байгааг нүдээр шалгах зориулалттай.
  Бодит анимацаа тавьсны дараа энэ хавтсыг устгаж болно.
*/
export default function LottieDemoPage() {
  return (
    <PageContainer>
      <PageHeader title="Lottie жишээ" />
      {/* aspect — JSON ирэхээс өмнө өндрөө барьж, layout shift үүсгэхгүй. */}
      <LottiePlayer
        src="/lottie/parcel.json"
        className="mx-auto aspect-[3/2] w-full max-w-[300px]"
      />
    </PageContainer>
  );
}
