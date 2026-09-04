"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, LayoutGrid, ShieldAlert, Landmark, LogOut, User, Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import type { Usuario } from "@/lib/types";

function initials(nome: string) {
  return nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardNav({ usuario }: { usuario: Usuario }) {
  const pathname = usePathname();

  const itensNav = [
    { href: "/dashboard", label: "Painel", icon: LayoutGrid, ativo: pathname === "/dashboard" },
    { href: "/dashboard/alertas", label: "Alertas", icon: ShieldAlert, ativo: pathname === "/dashboard/alertas" },
    { href: "/dashboard/inpi", label: "INPI", icon: Landmark, ativo: pathname?.startsWith("/dashboard/inpi") ?? false },
  ];

  return (
    <header className="print:hidden border-b border-line/80 bg-paper-certificate">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-8">
          {/* Menu mobile: os mesmos links de "nav" abaixo ficam escondidos
              em telas pequenas (sm:flex) sem isso, sem nenhum jeito de
              navegar entre Painel/Alertas/INPI pelo celular. */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="shrink-0 sm:hidden" aria-label="Abrir menu">
                  <Menu className="size-5" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-ink-muted">
                  <strong className="text-ink">{usuario.creditos_disponiveis}</strong> créditos
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {itensNav.map((item) => (
                <DropdownMenuLinkItem key={item.href} render={<Link href={item.href} />}>
                  <item.icon className="size-4" />
                  {item.label}
                </DropdownMenuLinkItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Logo />

          <nav className="hidden items-center gap-1 sm:flex">
            {itensNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  item.ativo ? "bg-secondary text-ledger" : "text-ink-muted hover:text-ink"
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-ink-muted sm:inline">
            <strong className="text-ink">{usuario.creditos_disponiveis}</strong> créditos
          </span>
          <Link
            href="/dashboard/novo"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5 px-2.5 sm:px-3")}
            aria-label="Novo registro"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Novo registro</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-ledger text-xs text-paper">
                      {initials(usuario.nome)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
                  <span className="text-sm font-medium text-ink">{usuario.nome}</span>
                  <span className="text-xs font-normal text-ink-muted">{usuario.email}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLinkItem render={<Link href="/dashboard" />}>
                <User className="size-4" />
                Meu painel
              </DropdownMenuLinkItem>
              <DropdownMenuLinkItem render={<Link href="/dashboard/perfil" />}>
                Perfil
              </DropdownMenuLinkItem>
              <DropdownMenuLinkItem render={<Link href="/precos" />}>
                Gerenciar plano
              </DropdownMenuLinkItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="size-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
