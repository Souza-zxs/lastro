import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";
import { buscarConteudo, valorConteudo, CAMPOS_CONTEUDO } from "@/lib/conteudo";
import { salvarConteudoAdmin } from "@/lib/actions/conteudo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

const NOTAS_SECAO: Record<string, string> = {
  planos:
    "O preço de cada plano não é editável aqui: a assinatura é cobrada pelo checkout externo da Greenn, com valor fixado lá. Mudar só o texto aqui criaria uma diferença entre o que aparece no site e o que é cobrado de verdade. Pra mudar preço de plano, ajuste no painel da Greenn e no código (lib/planos.ts) juntos.",
  pacotes:
    "Aqui o preço É o valor real cobrado no checkout (Asaas) — editar o campo de preço muda quanto o cliente paga a partir da próxima compra.",
};

export default async function AdminConteudoSecaoPage({ params }: { params: Promise<{ secao: string }> }) {
  const { secao } = await params;
  const campos = CAMPOS_CONTEUDO.filter((c) => c.secao === secao);

  if (campos.length === 0) notFound();

  const mapa = await buscarConteudo();
  const nota = NOTAS_SECAO[secao];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/admin/conteudo" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ChevronLeft className="size-4" />
        Textos do site
      </Link>

      <p className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-seal">Painel admin</p>
      <h1 className="mt-2 text-3xl text-ink">{campos[0].secaoLabel}</h1>

      {nota && (
        <div className="mt-5 flex items-start gap-2.5 border border-line bg-paper-certificate/60 px-4 py-3 text-sm text-ink-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-seal" />
          {nota}
        </div>
      )}

      <form action={salvarConteudoAdmin} className="mt-8 space-y-5">
        {campos.map((campo) => (
          <div key={campo.chave} className="space-y-1.5">
            <Label htmlFor={campo.chave}>{campo.label}</Label>
            {campo.tipo === "textarea" ? (
              <Textarea
                id={campo.chave}
                name={campo.chave}
                defaultValue={valorConteudo(mapa, campo.chave)}
                rows={3}
              />
            ) : (
              <Input id={campo.chave} name={campo.chave} defaultValue={valorConteudo(mapa, campo.chave)} />
            )}
          </div>
        ))}
        <Button type="submit">Salvar</Button>
      </form>
    </div>
  );
}
