import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Hash, Calendar, HardDrive, Ruler } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { formatDataHora, formatBytes, truncateHash } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RegistroDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: registro } = await supabase
    .from("registros")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!registro) notFound();

  const campos = [
    { icon: Hash, label: "Código de verificação", valor: registro.codigo_verificacao, mono: true },
    { icon: Calendar, label: "Registrado em", valor: formatDataHora(registro.data_registro) },
    { icon: FileText, label: "Formato", valor: registro.formato },
    { icon: Ruler, label: "Dimensões", valor: registro.dimensoes },
    { icon: HardDrive, label: "Tamanho", valor: formatBytes(registro.tamanho_bytes) },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="size-3.5" />
        Voltar ao painel
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative aspect-square overflow-hidden border border-line bg-muted">
          <Image src={registro.imagem_thumb} alt={registro.titulo} fill unoptimized className="object-cover" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-ink-muted">{registro.categoria}</p>
          <h1 className="mt-1 font-serif text-3xl text-ink">{registro.titulo}</h1>
          <div className="mt-3">
            <StatusBadge status={registro.status} />
          </div>

          <dl className="mt-8 space-y-4 border-t border-line pt-6">
            {campos.map((campo) => (
              <div key={campo.label} className="flex items-start gap-3">
                <campo.icon className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                <div className="min-w-0">
                  <dt className="text-xs uppercase tracking-wide text-ink-muted">{campo.label}</dt>
                  <dd className={cn("mt-0.5 truncate text-sm text-ink", campo.mono && "font-mono")}>
                    {campo.valor}
                  </dd>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3">
              <Hash className="mt-0.5 size-4 shrink-0 text-ink-muted" />
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-wide text-ink-muted">Hash SHA-256</dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-ink" title={registro.hash_sha256}>
                  {truncateHash(registro.hash_sha256)}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/certificado/${registro.id}`} className={buttonVariants({ size: "lg" })}>
              Ver certificado completo
            </Link>
            <Link
              href={`/verificar/${registro.codigo_verificacao}`}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Abrir página de verificação
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
