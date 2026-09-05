"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CICLOS, type CicloCobranca, type Plano } from "@/lib/planos";

// O botão de assinar leva direto pro checkout hospedado da Greenn
// (payfast.greenn.com.br) de cada plano+ciclo — não passa pelo backend do
// Lastro, então ainda não há como saber automaticamente quem pagou e
// liberar os créditos/processos INPI do plano (isso depende do webhook da
// Greenn, ainda não implementado). Alguns desses links podem estar
// marcados como "produto não disponível para pagamento" do lado da
// Greenn até o cadastro do produto ser concluído lá.
export function PlanoCards({ planos, logado }: { planos: Plano[]; logado: boolean }) {
  const [ciclo, setCiclo] = useState<CicloCobranca>("mensal");
  const cicloAtual = CICLOS.find((c) => c.id === ciclo) ?? CICLOS[0];

  return (
    <div>
      <Tabs value={ciclo} onValueChange={(valor) => valor && setCiclo(valor as CicloCobranca)}>
        <TabsList>
          {CICLOS.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {planos.map((plano) => {
          const preco = plano.precoPorCiclo[ciclo];
          return (
            <div
              key={plano.id}
              className={cn(
                "relative flex flex-col border p-8",
                plano.destaque
                  ? "border-ledger bg-paper-certificate shadow-[0_16px_40px_-24px_rgba(22,56,50,0.4)]"
                  : "border-line bg-paper-certificate/60"
              )}
            >
              {plano.destaque && (
                <span className="absolute -top-3 left-8 bg-seal px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-paper">
                  Mais escolhido
                </span>
              )}
              <h2 className="font-serif text-2xl text-ink">{plano.nome}</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {plano.creditosPorMes} créditos/mês · {plano.processosInpiInclusos} processos INPI
              </p>
              <p className="mt-6 text-4xl text-ink">{preco.total}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {cicloAtual.cobranca}
                {ciclo !== "mensal" && <> · equivale a {preco.porMes}</>}
              </p>

              {plano.id === "estudio" && ciclo === "anual" && (
                <p className="mt-3 border border-seal/30 bg-seal-light px-3 py-2 text-xs font-medium text-seal">
                  Promoção do anual: +15 processos do INPI de bônus
                </p>
              )}

              <ul className="mt-7 flex-1 space-y-3 text-sm">
                {plano.beneficios.map((b) => (
                  <li key={b} className="flex gap-2.5 text-ink-muted">
                    <Check className="mt-0.5 size-4 shrink-0 text-ledger" />
                    {b}
                  </li>
                ))}
              </ul>

              {logado ? (
                <a
                  href={preco.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: plano.destaque ? "default" : "outline", size: "lg" }),
                    "mt-8 w-full"
                  )}
                >
                  Assinar {plano.nome.toLowerCase()}
                </a>
              ) : (
                <Link
                  href="/cadastro"
                  className={cn(
                    buttonVariants({ variant: plano.destaque ? "default" : "outline", size: "lg" }),
                    "mt-8 w-full"
                  )}
                >
                  Criar conta
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
