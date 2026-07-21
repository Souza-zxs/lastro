import Link from "next/link";
import { ShieldAlert, ExternalLink } from "lucide-react";
import { AlertaStatusBadge } from "@/components/AlertaStatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDataHora } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ativarMonitoramento, desativarMonitoramento, atualizarStatusAlerta } from "@/lib/actions/monitoramento";
import type { AlertaUsoIndevido, Registro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AlertasPage() {
  const supabase = await getSupabaseServerClient();

  const { data: usuario } = await supabase.from("usuarios").select("monitoramento_ativo").single();
  const monitoramentoAtivo = Boolean(usuario?.monitoramento_ativo);

  const { data: alertas } = monitoramentoAtivo
    ? await supabase
        .from("alertas_uso_indevido")
        .select("*, registros(titulo, imagem_thumb, codigo_verificacao)")
        .order("created_at", { ascending: false })
    : { data: null };

  const lista = (alertas ?? []) as (AlertaUsoIndevido & {
    registros: Pick<Registro, "titulo" | "imagem_thumb" | "codigo_verificacao">;
  })[];

  if (!monitoramentoAtivo) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Monitoramento</p>
        <h1 className="mt-2 text-3xl text-ink">Vigie suas imagens na web.</h1>
        <p className="mt-3 text-ink-muted">
          Com o monitoramento ativo, buscamos periodicamente cópias das suas imagens registradas
          em outros sites e avisamos aqui quando encontramos algo — mesmo se a imagem tiver sido
          redimensionada ou recomprimida.
        </p>
        <div className="mt-2 border border-dashed border-line bg-paper-certificate/60 p-4 text-xs text-ink-muted">
          Recurso em construção: a busca na web ainda não está ligada a um provedor real. Ativar
          aqui só liga o rastreamento por trás (hash perceptual, varredura periódica) — os
          resultados aparecerão nesta tela assim que o provedor de busca for integrado.
        </div>
        <form action={ativarMonitoramento} className="mt-6">
          <Button type="submit" size="lg">
            Ativar monitoramento
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Monitoramento</p>
          <h1 className="mt-2 text-3xl text-ink">Alertas de uso indevido</h1>
        </div>
        <form action={desativarMonitoramento}>
          <Button type="submit" variant="outline" size="sm">
            Desativar monitoramento
          </Button>
        </form>
      </div>

      {lista.length === 0 ? (
        <div className="mt-10 flex items-start gap-3 border border-line bg-paper-certificate/60 px-5 py-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <p className="text-sm text-ink-muted">
            Nenhum alerta ainda. Assim que uma cópia de uma das suas imagens registradas for
            encontrada em outro lugar, ela aparece aqui.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {lista.map((alerta) => (
            <div key={alerta.id} className="flex flex-col gap-4 border border-line bg-paper-certificate/60 p-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink">{alerta.registros.titulo}</p>
                  <AlertaStatusBadge status={alerta.status} />
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  Encontrado em <strong className="text-ink">{alerta.dominio}</strong> ·{" "}
                  {alerta.similaridade}% de similaridade · {formatDataHora(alerta.encontrado_em)}
                </p>
                <a
                  href={alerta.url_encontrada}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-ledger hover:underline"
                >
                  Ver página <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={`/dashboard/registro/${alerta.registro_id}`}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  Ver registro
                </Link>
                <Link
                  href={`/dashboard/alertas/${alerta.id}/disputa`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Abrir disputa
                </Link>
                {alerta.status !== "ignorado" && (
                  <form action={atualizarStatusAlerta.bind(null, alerta.id, "ignorado")}>
                    <Button type="submit" variant="outline" size="sm">
                      Ignorar
                    </Button>
                  </form>
                )}
                {alerta.status !== "resolvido" && (
                  <form action={atualizarStatusAlerta.bind(null, alerta.id, "resolvido")}>
                    <Button type="submit" size="sm">
                      Marcar resolvido
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
