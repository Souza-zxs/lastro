import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CAMPOS_CONTEUDO } from "@/lib/conteudo";

export const dynamic = "force-dynamic";

export default function AdminConteudoPage() {
  const secoes = Array.from(new Set(CAMPOS_CONTEUDO.map((c) => c.secao))).map((secao) => ({
    secao,
    secaoLabel: CAMPOS_CONTEUDO.find((c) => c.secao === secao)!.secaoLabel,
    total: CAMPOS_CONTEUDO.filter((c) => c.secao === secao).length,
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Painel admin</p>
      <h1 className="mt-2 text-3xl text-ink">Textos do site</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Escolha uma página para editar os textos dela. Um campo em branco volta a usar o texto
        padrão.
      </p>

      <div className="mt-8 divide-y divide-line border border-line">
        {secoes.map(({ secao, secaoLabel, total }) => (
          <Link
            key={secao}
            href={`/admin/conteudo/${secao}`}
            className="flex items-center justify-between gap-4 bg-paper-certificate/60 px-5 py-4 transition-colors hover:bg-paper-certificate"
          >
            <div>
              <p className="font-medium text-ink">{secaoLabel}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{total} campo(s) editável(is)</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-ink-muted" />
          </Link>
        ))}
      </div>
    </div>
  );
}
