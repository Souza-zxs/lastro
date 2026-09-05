"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InstallAppButton } from "@/components/InstallAppButton";
import { isStandalone } from "@/lib/pwa";

const CHAVE_SESSAO = "lastro:boas-vindas-mostrada";

/** Decide uma única vez, na primeira renderização: abre o modal e já marca a sessão como vista. */
function decidirAbrirNaPrimeiraVez(): boolean {
  if (typeof window === "undefined" || isStandalone()) return false;
  try {
    if (sessionStorage.getItem(CHAVE_SESSAO)) return false;
    sessionStorage.setItem(CHAVE_SESSAO, "1");
    return true;
  } catch {
    return false;
  }
}

/** Mostra uma vez por sessão de navegador, na primeira visita ao painel após o login. */
export function BemVindoInstalarDialog({
  titulo = "Leve o Revollution Lastro com você",
  descricao = "Instale o app no seu celular para acessar seus certificados, alertas e processos do INPI rapidinho, direto da tela inicial.",
}: {
  titulo?: string;
  descricao?: string;
}) {
  const [aberto, setAberto] = useState(decidirAbrirNaPrimeiraVez);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <InstallAppButton className="w-full sm:w-auto" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
