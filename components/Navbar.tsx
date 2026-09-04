"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/precos", label: "Preços" },
  { href: "/verificar", label: "Verificar um certificado" },
];

export function Navbar() {
  return (
    <header className="border-b border-line/80 bg-paper/85 backdrop-blur supports-backdrop-filter:bg-paper/70 sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {/* Menu mobile: os mesmos links de "nav" abaixo (e "Entrar")
              ficam escondidos em telas pequenas, sem isso não tinha jeito
              de navegar pelo celular além de "Criar conta".
              DropdownMenuLinkItem usa href direto (não render={<Link/>}):
              aninhar o <Link> do Next aqui causava uma race intermitente
              entre o prefetch/router dele e o menu, que às vezes engolia
              o clique sem navegar — href puro é uma navegação de verdade
              do navegador, sem essa race. */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="shrink-0 md:hidden" aria-label="Abrir menu">
                  <Menu className="size-5" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-56">
              {links.map((link) => (
                <DropdownMenuLinkItem key={link.href} href={link.href}>
                  {link.label}
                </DropdownMenuLinkItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLinkItem href="/login">Entrar</DropdownMenuLinkItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Logo />
        </div>

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
