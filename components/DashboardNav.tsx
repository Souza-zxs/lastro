"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, LayoutGrid, ShieldAlert, Landmark, LogOut, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  const isDashboardHome = pathname === "/dashboard";
  const isAlertas = pathname === "/dashboard/alertas";
  const isInpi = pathname?.startsWith("/dashboard/inpi") ?? false;

  return (
    <header className="print:hidden border-b border-line/80 bg-paper-certificate">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                isDashboardHome
                  ? "bg-secondary text-ledger"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <LayoutGrid className="size-3.5" />
              Painel
            </Link>
            <Link
              href="/dashboard/alertas"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                isAlertas
                  ? "bg-secondary text-ledger"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <ShieldAlert className="size-3.5" />
              Alertas
            </Link>
            <Link
              href="/dashboard/inpi"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                isInpi
                  ? "bg-secondary text-ledger"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <Landmark className="size-3.5" />
              INPI
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-ink-muted sm:inline">
            <strong className="text-ink">{usuario.creditos_disponiveis}</strong> créditos
          </span>
          <Link
            href="/dashboard/novo"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            <Plus className="size-3.5" />
            Novo registro
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
              <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
                <span className="text-sm font-medium text-ink">{usuario.nome}</span>
                <span className="text-xs font-normal text-ink-muted">{usuario.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/dashboard" />}>
                <User className="size-4" />
                Meu painel
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/precos" />}>
                Gerenciar plano
              </DropdownMenuItem>
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
