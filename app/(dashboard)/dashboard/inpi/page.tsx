import Link from "next/link";
import { Landmark, Trash2 } from "lucide-react";
import { ProcessoInpiTipoBadge } from "@/components/ProcessoInpiTipoBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatData, formatDataHora } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { adicionarProcessoInpi, removerProcessoInpi } from "@/lib/actions/inpi";
import type { ProcessoInpi } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProcessosInpiPage() {
  const supabase = await getSupabaseServerClient();

  const { data: processos } = await supabase
    .from("processos_inpi")
    .select("*")
    .order("created_at", { ascending: false });

  const lista = (processos ?? []) as ProcessoInpi[];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Acompanhamento</p>
      <h1 className="mt-2 text-3xl text-ink">Processos do INPI</h1>
      <p className="mt-3 max-w-2xl text-ink-muted">
        Cadastre o número de um processo de marca, patente ou desenho industrial que você já
        depositou. Verificamos periodicamente a base pública do INPI e avisamos por e-mail quando o
        status ou o despacho mudar.
      </p>
      <div className="mt-2 max-w-2xl border border-dashed border-line bg-paper-certificate/60 p-4 text-xs text-ink-muted">
        Consulta de conveniência, feita direto na base pública do INPI. Para efeitos legais, a
        Revista da Propriedade Industrial (RPI) é o único canal oficial de publicação de despachos.
      </div>

      <form action={adicionarProcessoInpi} className="mt-8 grid gap-4 border border-line bg-paper-certificate/60 p-5 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="numero_processo">Número do processo</Label>
          <Input id="numero_processo" name="numero_processo" placeholder="Ex.: 823767730" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tipo">Tipo</Label>
          <Select name="tipo" defaultValue="marca">
            <SelectTrigger id="tipo" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marca">Marca</SelectItem>
              <SelectItem value="patente">Patente</SelectItem>
              <SelectItem value="desenho_industrial">Desenho industrial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="apelido">Apelido (opcional)</Label>
          <Input id="apelido" name="apelido" placeholder="Ex.: Logo da marca X" />
        </div>

        <Button type="submit">Adicionar</Button>
      </form>

      {lista.length === 0 ? (
        <div className="mt-8 flex items-start gap-3 border border-line bg-paper-certificate/60 px-5 py-4">
          <Landmark className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <p className="text-sm text-ink-muted">
            Nenhum processo cadastrado ainda. Adicione um número de processo acima para começar a
            acompanhar.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {lista.map((processo) => (
            <div
              key={processo.id}
              className="flex flex-col gap-4 border border-line bg-paper-certificate/60 p-5 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink">{processo.apelido || processo.numero_processo}</p>
                  <ProcessoInpiTipoBadge tipo={processo.tipo} />
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  Processo <strong className="text-ink">{processo.numero_processo}</strong>
                  {processo.situacao && (
                    <>
                      {" "}
                      · <strong className="text-ink">{processo.situacao}</strong>
                    </>
                  )}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {processo.ultima_verificacao_em
                    ? `Verificado em ${formatDataHora(processo.ultima_verificacao_em)}`
                    : "Ainda não verificado — entra na próxima varredura."}
                  {processo.despacho_data && (
                    <> · Último despacho em {formatData(processo.despacho_data)}</>
                  )}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={`/dashboard/inpi/${processo.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Ver histórico
                </Link>
                <form action={removerProcessoInpi.bind(null, processo.id)}>
                  <Button type="submit" variant="ghost" size="sm" className="gap-1.5 text-ink-muted">
                    <Trash2 className="size-3.5" />
                    Remover
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
