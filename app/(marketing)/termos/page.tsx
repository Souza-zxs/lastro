import Link from "next/link";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CLAUSULAS, CONTROLADOR, EMBASAMENTO_JURIDICO, INTRODUCAO, ULTIMA_ATUALIZACAO, type BlocoTexto } from "@/lib/termos/conteudo";

export const metadata = {
  title: "Termos de Uso e Política de Privacidade — Revollution Lastro",
};

function Bloco({ bloco }: { bloco: BlocoTexto }) {
  if (typeof bloco === "string") return <p>{bloco}</p>;
  const ListTag = bloco.ordenada ? "ol" : "ul";
  return (
    <ListTag className={cn("space-y-1 pl-5", bloco.ordenada ? "list-decimal" : "list-disc")}>
      {bloco.itens.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ListTag>
  );
}

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Documento legal</p>
          <h1 className="mt-2 text-3xl text-ink sm:text-4xl">
            Termo de Uso, Privacidade e Autorização para Tratamento e Compartilhamento de Dados
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Plataforma de registro de direitos autorais · Última atualização: {ULTIMA_ATUALIZACAO}
          </p>
        </div>
        <a href="/api/termos/pdf" className={cn(buttonVariants({ variant: "outline" }), "shrink-0 gap-1.5")}>
          <Download className="size-3.5" />
          Baixar em PDF
        </a>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-ink-muted">{INTRODUCAO}</p>

      {CLAUSULAS.map((clausula) => (
        <section key={clausula.numero} className="mt-10">
          <h2 className="text-lg font-medium text-ink">
            Cláusula {clausula.numero} - {clausula.titulo}
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-muted">
            {clausula.blocos.map((bloco, i) => (
              <Bloco key={i} bloco={bloco} />
            ))}
          </div>
        </section>
      ))}

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="text-lg font-medium text-ink">Embasamento jurídico da prova de anterioridade</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-muted">
          {EMBASAMENTO_JURIDICO.map((paragrafo, i) => (
            <p key={i} className={i === EMBASAMENTO_JURIDICO.length - 1 ? "font-medium text-ink" : undefined}>
              {paragrafo}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8 text-sm leading-relaxed text-ink-muted">
        <p>
          <strong className="text-ink">Controlador dos dados:</strong> {CONTROLADOR.nome}
        </p>
        <p>
          <strong className="text-ink">CNPJ:</strong> {CONTROLADOR.cnpj}
        </p>
        <p>
          <strong className="text-ink">E-mail para assuntos de privacidade:</strong>{" "}
          <span className="text-destructive">{CONTROLADOR.emailPrivacidade}</span>
        </p>
        <p>
          <strong className="text-ink">Encarregado (DPO):</strong> {CONTROLADOR.dpo}
        </p>
        <p>
          <strong className="text-ink">Endereço:</strong> {CONTROLADOR.endereco}
        </p>
        <p className="mt-4">
          <Link href="/" className="text-ledger hover:underline">
            Voltar ao início
          </Link>
        </p>
      </section>
    </div>
  );
}
