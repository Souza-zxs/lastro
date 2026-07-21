import { cn } from "@/lib/utils";
import type { StatusRegistro } from "@/lib/types";

const styles: Record<StatusRegistro, string> = {
  confirmado: "bg-ledger/10 text-ledger border-ledger/25",
  processando: "bg-seal-light text-seal border-seal/30",
};

const labels: Record<StatusRegistro, string> = {
  confirmado: "Registro confirmado",
  processando: "Carimbo em processamento",
};

export function StatusBadge({
  status,
  className,
}: {
  status: StatusRegistro;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[status],
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "confirmado" ? "bg-ledger" : "bg-seal animate-pulse"
        )}
      />
      {labels[status]}
    </span>
  );
}
