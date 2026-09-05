import { Check } from "lucide-react";
import { ComprarPacoteButton } from "@/components/ComprarPacoteButton";
import { PlanoCards } from "@/components/PlanoCards";
import { cn } from "@/lib/utils";
import { resolverPacotes } from "@/lib/pacotes";
import { PLANOS } from "@/lib/planos";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { buscarConteudo, valorConteudo } from "@/lib/conteudo";

export const dynamic = "force-dynamic";

export default async function PrecosPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [mapa, pacotes] = await Promise.all([buscarConteudo(), resolverPacotes()]);
  const c = (chave: string) => valorConteudo(mapa, chave);
  const faq = [0, 1, 2, 3, 4].map((i) => ({
    pergunta: c(`precos.faq.${i}.pergunta`),
    resposta: c(`precos.faq.${i}.resposta`),
  }));
  const planos = PLANOS.map((plano) => ({
    ...plano,
    nome: c(`planos.${plano.id}.nome`),
    beneficios: plano.beneficios.map((_, i) => c(`planos.${plano.id}.beneficio.${i}`)),
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Preços</p>
        <h1 className="mt-3 text-4xl text-ink sm:text-5xl">{c("precos.header.titulo")}</h1>
        <p className="mt-4 text-lg text-ink-muted">{c("precos.header.subtitulo")}</p>
      </div>

      <div className="mt-14">
        <PlanoCards planos={planos} logado={Boolean(user)} />
      </div>

      <div className="mt-24">
        <h2 className="text-2xl text-ink">{c("precos.recarga.titulo")}</h2>
        <p className="mt-2 max-w-2xl text-ink-muted">{c("precos.recarga.subtitulo")}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {pacotes.map((pacote) => (
            <div
              key={pacote.id}
              className={cn(
                "relative flex flex-col border p-8",
                pacote.destaque
                  ? "border-ledger bg-paper-certificate shadow-[0_16px_40px_-24px_rgba(22,56,50,0.4)]"
                  : "border-line bg-paper-certificate/60"
              )}
            >
              {pacote.destaque && (
                <span className="absolute -top-3 left-8 bg-seal px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-paper">
                  Mais escolhido
                </span>
              )}
              <h3 className="font-serif text-2xl text-ink">{pacote.nome}</h3>
              <p className="mt-1 text-sm text-ink-muted">{pacote.creditos} créditos</p>
              <p className="mt-6 text-4xl text-ink">{pacote.preco}</p>
              <p className="mt-1 text-xs text-ink-muted">{pacote.porImagem}</p>

              <ul className="mt-7 flex-1 space-y-3 text-sm">
                {pacote.beneficios.map((b) => (
                  <li key={b} className="flex gap-2.5 text-ink-muted">
                    <Check className="mt-0.5 size-4 shrink-0 text-ledger" />
                    {b}
                  </li>
                ))}
              </ul>

              <ComprarPacoteButton
                pacoteId={pacote.id}
                nome={pacote.nome}
                logado={Boolean(user)}
                destaque={pacote.destaque}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-24">
        <h2 className="text-2xl text-ink">Perguntas frequentes</h2>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2">
          {faq.map((item) => (
            <div key={item.pergunta} className="border-t border-line pt-4">
              <dt className="font-medium text-ink">{item.pergunta}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-muted">{item.resposta}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
