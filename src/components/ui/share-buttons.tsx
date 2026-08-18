"use client";

import { useEffect, useRef, useState } from "react";
import { SHARE_NETWORKS } from "@/lib/share";
import { btnSecondary, btnSm } from "./form";
import { CheckIcon, LinkIcon, ShareIcon } from "./icons";
import { useIsClient } from "./local-time";
import { SOCIAL_ICONS } from "./social-icons";

/**
 * Холбоосыг санах ойд хуулна.
 *
 * navigator.clipboard нь зөвхөн https (эсвэл localhost) дээр, бас зөвшөөрөл
 * олдсон үед л ажиллана. Утаснаас сүлжээний хаягаар (http://192.168.x.x)
 * орсон хүн ч хуулж чаддаг байхын тулд хуучин execCommand-аар нөхнө.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Доорх нөөц арга руу.
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.readOnly = true;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
}

/**
 * Холбоос хуваалцах товчнууд: утсан дээр системийн "Хуваалцах" цэс (Messenger,
 * Instagram, Viber зэрэг бүх апп нэг дор), дэлгэц дээр сүлжээ тус бүрийн цонх.
 * Хаана ч байсан "Холбоос хуулах" нь ажилладаг тул хэн ч хоосон гарахгүй.
 */
export function ShareButtons({
  url,
  text,
  title,
  className = "",
}: {
  url: string;
  text: string;
  /** navigator.share-д явах гарчиг — ихэнх апп зөвхөн үүнийг ба url-ыг уншина. */
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // navigator.share нь зөвхөн браузарт (ихэвчлэн утсан дээр) байдаг. Сервер
  // дээр байхгүй тул hydration зөрөхгүйн тулд клиент болсны дараа л шалгана.
  const nativeShare = useIsClient() && typeof navigator.share === "function";

  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    []
  );

  async function copyLink() {
    if (!(await copyToClipboard(url))) {
      // Хоёулаа бүтэлгүйтвэл ядаж гараараа хуулж авах боломж үлдээнэ.
      // prompt-ыг блоклодог орчин ч бий тул үүнийг ч хамгаална.
      try {
        window.prompt("Холбоосыг хуулж аваарай:", url);
      } catch {
        // Хийх зүйл алга — доорх сүлжээний товчнууд хэвээр ажиллана.
      }
      return;
    }
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    try {
      await navigator.share({ title, text, url });
    } catch {
      // Хэрэглэгч цуцалсан эсвэл апп нь татгалзсан — алдаа биш.
    }
  }

  const cls = `${btnSecondary} ${btnSm}`;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {nativeShare ? (
        <button type="button" onClick={share} className={cls}>
          <ShareIcon className="h-4 w-4" />
          Хуваалцах
        </button>
      ) : null}

      {SHARE_NETWORKS.map((network) => {
        const Icon = SOCIAL_ICONS[network.id];
        return (
          <a
            key={network.id}
            href={network.href(url, text)}
            target="_blank"
            rel="noopener noreferrer"
            className={cls}
          >
            <Icon className="h-4 w-4" />
            {network.label}
          </a>
        );
      })}

      <button type="button" onClick={copyLink} className={cls} aria-live="polite">
        {copied ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
        {copied ? "Хуулагдлаа" : "Холбоос хуулах"}
      </button>
    </div>
  );
}
