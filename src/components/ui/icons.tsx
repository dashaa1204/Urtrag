interface IconProps {
  className?: string;
}

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function ChatIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

export function SearchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function PackageIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="m7.5 4.3 9 5.1" />
      <path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

export function UserIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function LockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function ShieldIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 22s8-3.4 8-10V5.5l-8-3-8 3V12c0 6.6 8 10 8 10Z" />
    </svg>
  );
}

export function IdCardIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5 16a3.5 3.5 0 0 1 7 0" />
      <path d="M15 10h4" />
      <path d="M15 14h4" />
    </svg>
  );
}

export function UploadIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function BellIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M10.3 21a2 2 0 0 0 3.4 0" />
      <path d="M3.3 15.3A1 1 0 0 0 4 17h16a1 1 0 0 0 .7-1.7C19.4 14 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.4 6-2.7 7.3" />
    </svg>
  );
}

export function SendIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M4.7 4.3 20 12 4.7 19.7 7 12Z" />
      <path d="M7 12h13" />
    </svg>
  );
}
