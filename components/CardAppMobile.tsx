"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

type EstadoNotificacao = "verificando" | "indisponivel" | "negada" | "inativa" | "ativa";

/** Converte a chave pública VAPID (base64url) pro Uint8Array que a Push API espera. */
function paraUint8Array(base64url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = atob(base64);
  return Uint8Array.from([...bruto].map((c) => c.charCodeAt(0)));
}

export function CardAppMobile() {
  const [estado, setEstado] = useState<EstadoNotificacao>("verificando");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function verificar() {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        setEstado("indisponivel");
        return;
      }
      if (Notification.permission === "denied") {
        setEstado("negada");
        return;
      }
      try {
        const registro = await navigator.serviceWorker.getRegistration();
        const inscricao = await registro?.pushManager.getSubscription();
        setEstado(inscricao ? "ativa" : "inativa");
      } catch {
        setEstado("inativa");
      }
    }
    verificar();
  }, []);

  async function ativarNotificacoes() {
    const chavePublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!chavePublica) {
      setEstado("indisponivel");
      return;
    }

    setCarregando(true);
    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== "granted") {
        setEstado("negada");
        return;
      }

      const registro = await navigator.serviceWorker.register("/sw.js");
      const inscricao = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: paraUint8Array(chavePublica) as BufferSource,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inscricao.toJSON()),
      });

      setEstado("ativa");
    } catch {
      setEstado("inativa");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 border border-ledger/30 bg-paper-certificate p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Smartphone className="mt-0.5 size-5 shrink-0 text-ledger" />
        <div>
          <p className="font-medium text-ink">Tenha o Revollution Lastro no seu celular</p>
          <p className="mt-1 text-sm text-ink-muted">
            Funciona como app em Android e iPhone: no menu do navegador, escolha{" "}
            <strong className="text-ink">&quot;Adicionar à tela inicial&quot;</strong> (ou{" "}
            <strong className="text-ink">&quot;Instalar app&quot;</strong>). No iPhone é pelo botão de
            compartilhar do Safari.
          </p>
        </div>
      </div>

      <div className="shrink-0">
        {estado === "ativa" ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-ledger">
            <BellRing className="size-4" />
            Notificações ativadas
          </span>
        ) : estado === "negada" ? (
          <p className="max-w-56 text-xs text-ink-muted">
            Notificações bloqueadas no navegador. Libere nas configurações do site pra ativar.
          </p>
        ) : estado === "indisponivel" ? null : (
          <Button size="sm" className="gap-1.5" onClick={ativarNotificacoes} disabled={carregando}>
            <Bell className="size-3.5" />
            {carregando ? "Ativando…" : "Ativar notificações"}
          </Button>
        )}
      </div>
    </div>
  );
}
