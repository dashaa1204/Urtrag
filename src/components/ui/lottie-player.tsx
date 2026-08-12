"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/*
  lottie-web ~250KB тул үндсэн бандлд оруулахгүй, хэрэгтэй үед нь салангид
  chunk-аар татна. `ssr: false` — lottie-web нь window/DOM шаарддаг.
*/
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Сервер дээр мэдэх боломжгүй тул тэнд үргэлж false — гидрацийн зөрүү гарахгүй. */
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

type LottiePlayerProps = {
  /** public доторх JSON-ы зам, ж: "/lottie/parcel.json" */
  src: string;
  className?: string;
  loop?: boolean;
};

/**
 * After Effects-ээс Bodymovin-оор гаргасан Lottie JSON-г тоглуулна.
 *
 * Дэлгэцэнд ойртох хүртэл JSON-г ч, lottie-web-ийг ч татахгүй — хуудасны
 * эхний ачаалалд огт нөлөөлөхгүй. Чимэглэлийн дүрс тул `aria-hidden`.
 */
export function LottiePlayer({ src, className, loop = true }: LottiePlayerProps) {
  const holderRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;

    let cancelled = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        fetch(src)
          .then((res) => res.json())
          .then((json) => {
            if (!cancelled) setData(json);
          })
          .catch(() => {
            /* Чимэглэл учир алдвал юу ч харуулахгүй өнгөрнө. */
          });
      },
      // Дэлгэцэнд орж ирэхээс өмнө татаж эхэлбэл хоосон нүх анивчихгүй.
      { rootMargin: "200px" },
    );

    observer.observe(holder);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [src]);

  // Хөдөлгөөн багасгах тохиргоотой хэрэглэгчид эхний фрэйм дээр зогсоно.
  const reducedMotion = useReducedMotion();

  return (
    <div ref={holderRef} className={className} aria-hidden>
      {data ? <Lottie animationData={data} loop={loop} autoplay={!reducedMotion} /> : null}
    </div>
  );
}
