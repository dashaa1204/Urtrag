// Сошиал сүлжээний лого. icons.tsx-ийн зураасан дүрсүүдээс ялгаатай нь эдгээр
// нь брэндийн дүрс тул дүүргэлттэй (fill) — өнгийг нь эцгээсээ (currentColor)
// авдаг учир бэхэн өнгөт товчин дотор ижилхэн харагдана.

import type { ComponentType } from "react";
import type { ShareNetwork } from "@/lib/share";

interface IconProps {
  className?: string;
}

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
} as const;

function FacebookIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M9.1 23.7v-8H6.6v-3.7h2.5v-1.6c0-4.1 1.9-6 5.9-6 .4 0 1 0 1.5.1.5.1.9.2 1.1.2v3.3l-.7-.1h-.7c-.7 0-1.3.1-1.7.3-.3.2-.5.4-.7.7-.3.4-.4 1-.4 1.7V12h3.9l-.4 2.1-.3 1.6h-3.2V24c5.9-.7 10.5-5.8 10.5-11.9C24 5.4 18.6 0 12 0S0 5.4 0 12c0 5.7 3.9 10.4 9.1 11.7Z" />
    </svg>
  );
}

function TelegramIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0Zm4.9 7.2c.1 0 .3 0 .5.1.1.1.2.2.2.3v.5c-.2 1.9-1 6.5-1.4 8.6-.2.9-.5 1.2-.8 1.2-.7.1-1.2-.5-1.9-.9l-2.7-1.8c-1.2-.8-.4-1.2.3-1.9.2-.2 3.2-3 3.3-3.2v-.2c0-.1-.2 0-.2 0-.2 0-1.8 1.1-5.1 3.3-.5.3-.9.5-1.3.5-.4 0-1.3-.2-1.9-.4-.7-.3-1.3-.4-1.3-.8 0-.2.3-.4.9-.7 3.5-1.5 5.8-2.5 7-3 3.3-1.4 4-1.6 4.4-1.6Z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1l-.9 1.2c-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2.1 3.2 5 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4l-.5-.4M12 21.8a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.3-.4A9.9 9.9 0 0 1 2.1 12 9.9 9.9 0 0 1 12 2.1c2.6 0 5.1 1 7 2.9a9.8 9.8 0 0 1 2.9 7c0 5.4-4.4 9.8-9.9 9.8m8.4-18.3A11.8 11.8 0 0 0 11.9 0C5.4 0 .1 5.4.1 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7 1 3.7 1.5 5.7 1.5 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4" />
    </svg>
  );
}

function XIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M18.2 2.3h3.3l-7.2 8.2 8.5 11.2h-6.7l-5.2-6.8-6 6.8H1.7l7.7-8.8L1.3 2.3h6.8l4.7 6.2zm-1.2 17.5h1.9L7.1 4.1H5.1z" />
    </svg>
  );
}

/**
 * Google-ийн "G". Энэ файлын бусад дүрсээс ялгаатай нь дөрвөн өнгөө өөртөө
 * барина — Google-ийн брэндийн журам нэвтрэх товчин дээр логог өөрчлөхийг
 * хориглодог тул currentColor хэрэглэхгүй.
 */
export function GoogleIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.7-.2-2.5H12v4.8h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
      />
    </svg>
  );
}

/** Сүлжээний id → лого. lib/share.ts-ийн жагсаалт энэ бүртгэлтэй заавал тааруулна. */
export const SOCIAL_ICONS: Record<ShareNetwork["id"], ComponentType<IconProps>> = {
  facebook: FacebookIcon,
  telegram: TelegramIcon,
  whatsapp: WhatsAppIcon,
  x: XIcon,
};
