import { useSyncExternalStore } from "react";

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari não tem display-mode: standalone confiável, mas expõe isso.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function subscribeStandalone(notificar: () => void) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", notificar);
  window.addEventListener("appinstalled", notificar);
  return () => {
    media.removeEventListener("change", notificar);
    window.removeEventListener("appinstalled", notificar);
  };
}

const snapshotServidor = () => false;

/** true assim que o app passa a rodar instalado (standalone) — reage a mudanças, sem setState em efeito. */
export function useAppInstalado(): boolean {
  return useSyncExternalStore(subscribeStandalone, isStandalone, snapshotServidor);
}
