"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, ReceiptText, LogOut, Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";

const ITENS_NAV = [
  { href: "/admin", label: "Visão geral", icon: LayoutGrid },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/assinaturas", label: "Assinaturas e compras", icon: ReceiptText },
];

export function AdminNav({ nome }: { nome: string }) {
  const pathname = usePathname();
  const ativo = (href: string) => (href === "/admin" ? pathname === href : pathname?.startsWith(href));

  return (
    <header className="print:hidden border-b border-line/80 bg-paper-certificate">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-8">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="shrink-0 sm:hidden" aria-label="Abrir menu">
                  <Menu className="size-5" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-56">
              {ITENS_NAV.map((item) => (
                <DropdownMenuLinkItem key={item.href} href={item.href}>
                  <item.icon className="size-4" />
                  {item.label}
                </DropdownMenuLinkItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/admin" className="flex items-center gap-2">
            <Logo />
            <span className="rounded-full border border-line px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Admin
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {ITENS_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  ativo(item.href) ? "bg-secondary text-ledger" : "text-ink-muted hover:text-ink"
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-ink-muted sm:inline">{nome}</span>
          <Link href="/dashboard" className="text-xs text-ink-muted hover:text-ink hover:underline">
            Meu painel
          </Link>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="icon" aria-label="Sair">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
