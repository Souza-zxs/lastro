import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-ledger dark:text-ledger",
        className
      )}
    >
      <Image
        src="/revollution-mark.png"
        alt="Revollution Lastro"
        width={28}
        height={28}
        className="shrink-0 rounded-full"
        unoptimized
      />
      <span className="font-serif text-xl tracking-tight">
        Revollution Lastro
      </span>
    </Link>
  );
}
