"use client";

import { useState } from "react";
import { X, Smartphone } from "lucide-react";
import { InstallAppButton } from "@/components/InstallAppButton";
import { Button } from "@/components/ui/button";
import { useAppInstalado } from "@/lib/pwa";

const CHAVE_DISPENSADO = "lastro:card-instalar-dispensado";

function lerDispensado(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(CHAVE_DISPENSADO) === "1";
  } catch {
    return false;
  }
}

export function InstalarAppCard() {
  const instalado = useAppInstalado();
  const [dispensado, setDispensado] = useState(lerDispensado);

  function dispensar() {
    setDispensado(true);
    try {
      localStorage.setItem(CHAVE_DISPENSADO, "1");
    } catch {
      // Ignora: pior caso o card volta a aparecer na próxima visita.
    }
  }

  if (instalado || dispensado) return null;

  return (
    <div className="relative flex flex-col gap-4 border border-ledger/30 bg-paper-certificate p-5 sm:flex-row sm:items-center sm:justify-between">
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2 text-ink-muted"
        onClick={dispensar}
        aria-label="Dispensar"
      >
        <X className="size-4" />
      </Button>

      <div className="flex items-start gap-3 pr-6">
        <Smartphone className="mt-0.5 size-5 shrink-0 text-ledger" />
        <div>
          <p className="font-medium text-ink">Tenha o Revollution Lastro sempre à mão</p>
          <p className="mt-1 text-sm text-ink-muted">
            Instale o app no seu celular para acessar seus registros, alertas e processos do INPI
            direto da tela inicial, sem precisar abrir o navegador.
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <InstallAppButton size="sm" />
      </div>
    </div>
  );
}
