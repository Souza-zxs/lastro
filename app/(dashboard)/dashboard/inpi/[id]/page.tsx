import { notFound } from "next/navigation";
import { ScrollText } from "lucide-react";
import { CertificadoToolbar } from "@/components/CertificadoToolbar";
import { ProcessoInpiTipoBadge } from "@/components/ProcessoInpiTipoBadge";
import { Button } from "@/components/ui/button";
import { formatData, formatDataHora } from "@/lib/format";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { marcarEventoInpiLido } from "@/lib/actions/inpi";
import type { EventoProcessoInpi, ProcessoInpi } from "@/lib/types";

export const dynamic = "force-dynamic";

const CAMPOS: { chave: keyof ProcessoInpi; rotulo: string }[] = [
  { chave: "situacao", rotulo: "Situação" },
  { chave: "titular", rotulo: "Titular" },
  { chave: "apresentacao", rotulo: "Apresentação" },
  { chave: "natureza", rotulo: "Natureza" },
  { chave: "classe", rotulo: "Classe" },
];

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
    <>
      <CertificadoToolbar voltarHref="/dashboard/inpi" />
      <div className="mx-auto max-w-2xl px-6 py-8 print:py-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Processo do INPI</p>
          <ProcessoInpiTipoBadge tipo={processo.tipo} />
        </div>
        <h1 className="mt-2 text-3xl text-ink">
          {processo.apelido || processo.nome || processo.numero_processo}
        </h1>
        <p className="mt-2 text-ink-muted">
          Processo <strong className="text-ink">{processo.numero_processo}</strong>
          {processo.nome && processo.apelido && (
            <>
              {" "}
              · <strong className="text-ink">{processo.nome}</strong>
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          {processo.ultima_verificacao_em
            ? `Última verificação em ${formatDataHora(processo.ultima_verificacao_em)}`
            : "Ainda não verificado — entra na próxima varredura."}
          {processo.numero_rpi && <> · Nº da Revista {processo.numero_rpi}</>}
        </p>

        <dl className="mt-6 grid gap-4 border border-line bg-paper-certificate/60 p-5 sm:grid-cols-2">
          {CAMPOS.filter((campo) => processo[campo.chave]).map((campo) => (
            <div key={campo.chave}>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">{campo.rotulo}</dt>
              <dd className="mt-0.5 text-sm text-ink">{processo[campo.chave] as string}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-2 max-w-2xl border border-dashed border-line bg-paper-certificate/60 p-4 text-xs text-ink-muted print:hidden">
          Consulta de conveniência, feita direto na base pública do INPI. Para efeitos legais, a
          Revista da Propriedade Industrial (RPI) é o único canal oficial de publicação de despachos.
        </div>

        <h2 className="mt-10 text-lg text-ink">Histórico de despachos</h2>
        {lista.length === 0 ? (
          <div className="mt-4 flex items-start gap-3 border border-line bg-paper-certificate/60 px-5 py-4">
            <ScrollText className="mt-0.5 size-5 shrink-0 text-ink-muted" />
            <p className="text-sm text-ink-muted">
              Nenhuma atualização registrada ainda. Assim que uma mudança de status ou despacho for
              encontrada, ela aparece aqui.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {lista.map((evento) => (
              <div key={evento.id} className="border border-line bg-paper-certificate/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">{evento.situacao ?? "Atualização"}</p>
                  {!evento.lido && (
                    <form action={marcarEventoInpiLido.bind(null, evento.id)} className="print:hidden">
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
    </>
  );
}
