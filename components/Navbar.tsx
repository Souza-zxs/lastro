import Link from "next/link";
import { Logo } from "@/components/Logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/precos", label: "Preços" },
  { href: "/verificar", label: "Verificar um certificado" },
];

export function Navbar() {
  return (
    <header className="border-b border-line/80 bg-paper/85 backdrop-blur supports-backdrop-filter:bg-paper/70 sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
