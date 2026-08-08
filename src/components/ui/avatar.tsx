const sizeCls = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-xl",
};

interface AvatarProps {
  name: string;
  size?: keyof typeof sizeCls;
  className?: string;
}

/** Зураг ороогүй тул нэрийн эхний үсгээр дүрсэлнэ. */
export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={`flex ${sizeCls[size]} shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600 ${className}`}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
