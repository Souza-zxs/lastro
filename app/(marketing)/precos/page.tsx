import { Check } from "lucide-react";
import { ComprarPacoteButton } from "@/components/ComprarPacoteButton";
import { PlanoCards } from "@/components/PlanoCards";
import { cn } from "@/lib/utils";
import { PACOTES } from "@/lib/pacotes";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const faq = [
  {
    pergunta: "O que é um crédito?",
    resposta:
      "Cada crédito registra uma imagem: gera o hash SHA-256, o carimbo de tempo e o certificado correspondente. Créditos não expiram.",
  },
  {
    pergunta: "O certificado tem validade jurídica de registro de direitos autorais?",
    resposta:
      "Não. O certificado é uma prova de anterioridade baseada em carimbo de tempo — útil como evidência complementar, mas não substitui o registro oficial junto a órgãos como a Biblioteca Nacional.",
  },
  {
    pergunta: "Posso registrar a mesma imagem mais de uma vez?",
    resposta:
      "Sim, mas cada registro consome um crédito e gera um novo certificado com nova data.",
  },
  {
    pergunta: "Existe plano de assinatura?",
    resposta:
      "Sim — os planos Essencial, Estúdio e Portfólio incluem uma cota de registros de imagem e de processos do INPI acompanhados por mês, em ciclos mensal, semestral ou anual. A assinatura ainda está sendo habilitada; por enquanto o checkout funciona pelos pacotes avulsos abaixo.",
  },
  {
    pergunta: "O que acontece se eu usar todos os créditos do mês na assinatura?",
    resposta:
      "Dá pra comprar recarga avulsa de créditos a qualquer momento, sem esperar o próximo ciclo — são os mesmos pacotes vendidos hoje, listados abaixo dos planos.",
  },
];

export default async function PrecosPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Preços</p>
        <h1 className="mt-3 text-4xl text-ink sm:text-5xl">
          Um plano para provar e acompanhar.
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          Cada plano inclui registros de imagem e acompanhamento de processos do INPI por mês.
          Escolha o ciclo de cobrança que fizer mais sentido pra você.
        </p>
      </div>

      <div className="mt-14">
        <PlanoCards logado={Boolean(user)} />
      </div>

      <div className="mt-24">
        <h2 className="text-2xl text-ink">Recarga de créditos avulsa</h2>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Precisou de mais registros do que o incluso no plano deste mês? Compre créditos avulsos
          a qualquer momento, sem esperar o próximo ciclo — eles não expiram.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {PACOTES.map((pacote) => (
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
