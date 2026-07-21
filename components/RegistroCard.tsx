import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatData } from "@/lib/format";
import type { Registro } from "@/lib/types";

export function RegistroCard({ registro }: { registro: Registro }) {
  return (
    <Link
      href={`/dashboard/registro/${registro.id}`}
      className="group block overflow-hidden border border-line bg-card transition-colors hover:border-ledger/50"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <Image
          src={registro.imagem_thumb}
          alt={registro.titulo}
          fill
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute right-2 top-2">
          <StatusBadge status={registro.status} />
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-ink-muted">
          {registro.categoria}
        </p>
        <h3 className="mt-1 flex items-start justify-between gap-2 font-serif text-lg text-ink">
          <span>{registro.titulo}</span>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ledger" />
        </h3>
        <p className="mt-2 font-mono text-xs text-ink-muted">
          {registro.codigo_verificacao} · {formatData(registro.data_registro)}
        </p>
      </div>
    </Link>
  );
}
