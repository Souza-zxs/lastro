import { cn } from "@/lib/utils";
import type { StatusAlerta } from "@/lib/types";

const styles: Record<StatusAlerta, string> = {
  novo: "bg-destructive/10 text-destructive border-destructive/25",
  revisado: "bg-seal-light text-seal border-seal/30",
  em_disputa: "bg-seal-light text-seal border-seal/30",
  ignorado: "bg-muted text-ink-muted border-line",
  resolvido: "bg-ledger/10 text-ledger border-ledger/25",
};

const labels: Record<StatusAlerta, string> = {
  novo: "Novo",
  revisado: "Revisado",
  em_disputa: "Em disputa",
  ignorado: "Ignorado",
  resolvido: "Resolvido",
};

export function AlertaStatusBadge({ status, className }: { status: StatusAlerta; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
