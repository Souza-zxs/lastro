import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ScrollText } from "lucide-react";
import { ProcessoInpiTipoBadge } from "@/components/ProcessoInpiTipoBadge";
import { Button } from "@/components/ui/button";
import { formatData, formatDataHora } from "@/lib/format";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { marcarEventoInpiLido } from "@/lib/actions/inpi";
import type { EventoProcessoInpi, ProcessoInpi } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProcessoInpiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: processo } = (await supabase
    .from("processos_inpi")
    .select("*")
    .eq("id", id)
    .maybeSingle()) as { data: ProcessoInpi | null };

  if (!processo) notFound();

  const { data: eventos } = (await supabase
    .from("eventos_processo_inpi")
    .select("*")
    .eq("processo_id", id)
    .order("encontrado_em", { ascending: false })) as { data: EventoProcessoInpi[] | null };

  const lista = eventos ?? [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard/inpi"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="size-3.5" />
        Voltar aos processos
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Histórico</p>
        <ProcessoInpiTipoBadge tipo={processo.tipo} />
      </div>
      <h1 className="mt-2 text-3xl text-ink">{processo.apelido || processo.numero_processo}</h1>
      <p className="mt-2 text-ink-muted">
        Processo <strong className="text-ink">{processo.numero_processo}</strong>
        {processo.situacao && (
          <>
            {" "}
            · situação atual: <strong className="text-ink">{processo.situacao}</strong>
          </>
        )}
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        {processo.ultima_verificacao_em
          ? `Última verificação em ${formatDataHora(processo.ultima_verificacao_em)}`
          : "Ainda não verificado — entra na próxima varredura."}
      </p>

      {lista.length === 0 ? (
        <div className="mt-8 flex items-start gap-3 border border-line bg-paper-certificate/60 px-5 py-4">
          <ScrollText className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <p className="text-sm text-ink-muted">
            Nenhuma atualização registrada ainda. Assim que uma mudança de status ou despacho for
            encontrada, ela aparece aqui.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {lista.map((evento) => (
            <div key={evento.id} className="border border-line bg-paper-certificate/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-ink">{evento.situacao ?? "Atualização"}</p>
                {!evento.lido && (
                  <form action={marcarEventoInpiLido.bind(null, evento.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      Marcar como lido
                    </Button>
                  </form>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-muted">{evento.despacho_descricao}</p>
              <p className="mt-1 text-xs text-ink-muted">
                Encontrado em {formatDataHora(evento.encontrado_em)}
                {evento.despacho_data && <> · Despacho de {formatData(evento.despacho_data)}</>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
