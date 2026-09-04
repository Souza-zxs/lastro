"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuiaInstalarIOS } from "@/components/GuiaInstalarIOS";
import { cn } from "@/lib/utils";
import { getGuiaInstalacaoIOS, isIOS, useAppInstalado } from "@/lib/pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "sm" | "lg";
}) {
  const instalado = useAppInstalado();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);

  useEffect(() => {
    function aoPromptar(evento: Event) {
      evento.preventDefault();
      setPromptEvent(evento as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", aoPromptar);
    return () => window.removeEventListener("beforeinstallprompt", aoPromptar);
  }, []);

  const instalar = useCallback(async () => {
    if (!promptEvent) {
      // Sem beforeinstallprompt (iPhone/iPad, ou navegador sem suporte):
      // não dá pra disparar a instalação por código, só mostrar o caminho manual.
      setMostrarInstrucoes(true);
      return;
    }
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  }, [promptEvent]);

  if (instalado) return null;

  return (
    <div className="flex flex-col gap-2">
      <Button size={size} className={cn("gap-1.5", className)} onClick={instalar}>
        <Download className="size-4" />
        Instalar app
      </Button>
      {mostrarInstrucoes &&
        (isIOS() ? (
          <GuiaInstalarIOS variante={getGuiaInstalacaoIOS()} />
        ) : (
          <p className="max-w-xs text-xs text-ink-muted">
            Procure &quot;Instalar app&quot; ou &quot;Adicionar à tela inicial&quot; no menu do
            navegador.
          </p>
        ))}
    </div>
  );
}
