"use client";

import { useEffect } from "react";

/**
 * Registra o service worker em toda visita ao site (não só quando o
 * usuário ativa notificações push em CardAppMobile). Sem um service
 * worker ativo com fetch handler, o Chrome não considera o site
 * instalável e beforeinstallprompt nunca dispara — é o que faz o botão
 * "Instalar app" funcionar de verdade.
 */
export function RegistrarServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
