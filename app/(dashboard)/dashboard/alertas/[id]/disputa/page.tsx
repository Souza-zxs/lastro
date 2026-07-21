import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CopiarTextoButton } from "@/components/CopiarTextoButton";
import { Button } from "@/components/ui/button";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { origemAtual } from "@/lib/origem";
import { gerarNoticiaDeRemocao } from "@/lib/monitoramento/disputa";
import { atualizarStatusAlerta } from "@/lib/actions/monitoramento";
import type { AlertaUsoIndevido, Registro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DisputaAlertaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: alerta } = (await supabase
    .from("alertas_uso_indevido")
    .select("*, registros(titulo, autor, email_autor, hash_sha256, codigo_verificacao)")
    .eq("id", id)
    .maybeSingle()) as {
    data:
      | (AlertaUsoIndevido & {
          registros: Pick<Registro, "titulo" | "autor" | "email_autor" | "hash_sha256" | "codigo_verificacao">;
        })
      | null;
  };

  if (!alerta) notFound();

  const origem = (await origemAtual()) ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const urlVerificacao = `${origem.replace(/\/$/, "")}/verificar/${alerta.registros.codigo_verificacao}`;

  const noticia = gerarNoticiaDeRemocao({
    autor: alerta.registros.autor,
    emailAutor: alerta.registros.email_autor,
    titulo: alerta.registros.titulo,
    codigoVerificacao: alerta.registros.codigo_verificacao,
    urlVerificacao,
    hashSha256: alerta.registros.hash_sha256,
    urlEncontrada: alerta.url_encontrada,
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/dashboard/alertas"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="size-3.5" />
        Voltar aos alertas
      </Link>

      <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-seal">Disputa</p>
      <h1 className="mt-2 text-3xl text-ink">Notificação de remoção</h1>
      <p className="mt-2 text-ink-muted">
        Um modelo de notificação para enviar a quem hospeda o conteúdo encontrado em{" "}
        <strong className="text-ink">{alerta.dominio}</strong>. Revise e adapte antes de enviar —
        não é aconselhamento jurídico.
      </p>

      <div className="mt-6 whitespace-pre-wrap border border-line bg-paper-certificate/60 p-5 font-mono text-xs leading-relaxed text-ink">
        {noticia}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <CopiarTextoButton texto={noticia} />
        {alerta.status !== "em_disputa" && (
          <form action={atualizarStatusAlerta.bind(null, alerta.id, "em_disputa")}>
            <Button type="submit" size="sm">
              Marcar como em disputa
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
