import { useSyncExternalStore } from "react";

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Navegador embutido de apps como Instagram/TikTok/Facebook: geralmente nem mostra a opção de adicionar à tela de início. */
export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /FBAN|FBAV|Instagram|Line\/|MicroMessenger|TikTok|musical_ly/i.test(navigator.userAgent);
}

/** No iOS, só o Safari "de verdade" instala como PWA — Chrome/Firefox/Edge no iPhone são só a engine do Safari por baixo, sem esse recurso. */
export function isIOSSafari(): boolean {
  if (!isIOS() || isInAppBrowser()) return false;
  return /safari/i.test(navigator.userAgent) && !/crios|fxios|opios|edgios/i.test(navigator.userAgent);
}

export type GuiaInstalacaoIOS = "safari" | "outro-navegador" | "in-app";

export function getGuiaInstalacaoIOS(): GuiaInstalacaoIOS {
  if (isInAppBrowser()) return "in-app";
  if (isIOSSafari()) return "safari";
  return "outro-navegador";
}

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
