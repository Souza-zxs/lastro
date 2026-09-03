import { cn } from "@/lib/utils";
import type { TipoProcessoInpi } from "@/lib/types";

const styles: Record<TipoProcessoInpi, string> = {
  marca: "bg-ledger/10 text-ledger border-ledger/25",
  patente: "bg-seal-light text-seal border-seal/30",
  desenho_industrial: "bg-muted text-ink-muted border-line",
};

const labels: Record<TipoProcessoInpi, string> = {
  marca: "Marca",
  patente: "Patente",
  desenho_industrial: "Desenho industrial",
};

export function ProcessoInpiTipoBadge({ tipo, className }: { tipo: TipoProcessoInpi; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[tipo],
        className
      )}
    >
      {labels[tipo]}
    </span>
  );
}
