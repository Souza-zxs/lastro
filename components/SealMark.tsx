import { cn } from "@/lib/utils";

interface SealMarkProps {
  className?: string;
  size?: number;
}

export function SealMark({ className, size = 40 }: SealMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="30.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="1.25" strokeDasharray="1.2 4.6" />
      <path
        d="M20 36.5 L27.5 44 L44 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
