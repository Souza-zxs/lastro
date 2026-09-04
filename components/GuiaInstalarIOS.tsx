import type { ReactNode } from "react";
import { Share, SquarePlus, MoreHorizontal } from "lucide-react";
import type { GuiaInstalacaoIOS } from "@/lib/pwa";

function Passo({ numero, children }: { numero: number; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ledger text-[11px] font-medium text-paper">
        {numero}
      </span>
      <span className="text-ink-muted">{children}</span>
    </li>
  );
}

export function GuiaInstalarIOS({ variante }: { variante: GuiaInstalacaoIOS }) {
  if (variante === "in-app") {
    return (
      <div className="max-w-xs space-y-2 text-xs">
        <p className="text-ink-muted">
          Este link foi aberto dentro de outro app (Instagram, TikTok etc.), que não deixa
          instalar sites na tela inicial.
        </p>
        <ol className="space-y-1.5">
          <Passo numero={1}>
            Toque em <MoreHorizontal className="inline size-3.5 align-text-bottom" /> ou{" "}
            <strong className="text-ink">⋯</strong> no canto da tela e escolha{" "}
            <strong className="text-ink">&quot;Abrir no navegador&quot;</strong> (ou &quot;Abrir no
            Safari&quot;).
          </Passo>
          <Passo numero={2}>Toque em &quot;Instalar app&quot; de novo a partir do Safari.</Passo>
        </ol>
      </div>
    );
  }

  if (variante === "outro-navegador") {
    return (
      <p className="max-w-xs text-xs text-ink-muted">
        No iPhone, só o <strong className="text-ink">Safari</strong> instala o app na tela
        inicial. Abra este link no Safari e toque em &quot;Instalar app&quot; de novo.
      </p>
    );
  }

  return (
    <ol className="max-w-xs space-y-1.5 text-xs">
      <Passo numero={1}>
        Toque no ícone de compartilhar <Share className="inline size-3.5 align-text-bottom" /> na
        barra do Safari.
      </Passo>
      <Passo numero={2}>
        Role a lista e toque em <SquarePlus className="inline size-3.5 align-text-bottom" />{" "}
        <strong className="text-ink">&quot;Adicionar à Tela de Início&quot;</strong>.
      </Passo>
      <Passo numero={3}>
        Toque em <strong className="text-ink">&quot;Adicionar&quot;</strong> no canto superior
        direito.
      </Passo>
    </ol>
  );
}
