import Link from "next/link";
import { ArrowRight, Fingerprint, Clock, QrCode, Check } from "lucide-react";
import { CertificadoPreview } from "@/components/CertificadoPreview";
import { ComoFuncionaDiagram } from "@/components/ComoFuncionaDiagram";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { registroDemo } from "@/lib/demo-data";

const heroRegistro = registroDemo;

const passos = [
  {
    numero: "01",
    titulo: "Envie a imagem",
    texto:
      "Faça upload do arquivo final — foto, ilustração ou peça de design. Fica só com você; usamos apenas para gerar a prova.",
  },
  {
    numero: "02",
    titulo: "Geramos o hash e o carimbo de tempo",
    texto:
      "Calculamos o SHA-256 do arquivo e registramos data e hora do envio. Esse par é a evidência de anterioridade.",
  },
  {
    numero: "03",
    titulo: "Emitimos o certificado",
    texto:
      "Um documento com seus dados, o hash, o carimbo e um QR code de verificação, pronto para baixar ou anexar a um processo.",
  },
  {
    numero: "04",
    titulo: "Qualquer pessoa pode conferir",
    texto:
      "Compartilhe o código de verificação. Quem receber confere a autenticidade numa página pública, sem precisar de conta.",
  },
];

const publicos = [
  "Fotógrafos",
  "Ilustradores",
  "Designers gráficos",
  "Estúdios criativos",
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-paper">
        <div className="bg-paper-texture absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 sm:py-28 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">
              Prova de anterioridade para imagens
            </p>
            <h1 className="mt-4 text-4xl leading-[1.08] text-ink sm:text-5xl lg:text-[3.25rem]">
              Registre a autoria da sua imagem antes que alguém duvide dela.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-muted">
              Revollution Lastro gera um carimbo de tempo e um certificado verificável
              para cada imagem que você registra — sua evidência de que a
              obra já existia, com o seu nome, numa data específica.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/cadastro"
                className={cn(buttonVariants({ size: "lg" }), "gap-2 px-5")}
              >
                Criar conta grátis
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#como-funciona"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-5")}
              >
                Ver como funciona
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-1 gap-5 border-t border-line pt-6 sm:grid-cols-3">
              <div className="flex items-start gap-2.5">
                <Fingerprint className="mt-0.5 size-4 shrink-0 text-ledger" />
                <div>
                  <dt className="text-sm font-medium text-ink">Hash SHA-256</dt>
                  <dd className="text-xs text-ink-muted">Impressão digital única do arquivo</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-ledger" />
                <div>
                  <dt className="text-sm font-medium text-ink">Carimbo de tempo</dt>
                  <dd className="text-xs text-ink-muted">Data e hora do registro</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <QrCode className="mt-0.5 size-4 shrink-0 text-ledger" />
                <div>
                  <dt className="text-sm font-medium text-ink">Verificação pública</dt>
                  <dd className="text-xs text-ink-muted">Qualquer pessoa confere o certificado</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <div className="absolute -inset-6 -z-10 hidden rounded-sm bg-ledger/5 sm:block" />
            <CertificadoPreview
              registro={heroRegistro}
              compact
              className="-rotate-2 shadow-[0_24px_60px_-24px_rgba(22,56,50,0.35)] transition-transform duration-500 hover:rotate-0"
            />
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-t border-line bg-paper-certificate">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl text-ink sm:text-4xl">
              Do arquivo ao certificado, em quatro etapas.
            </h2>
          </div>
          <ComoFuncionaDiagram className="mt-16 hidden lg:block" />

          <ol className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:hidden">
            {passos.map((passo, i) => (
              <li key={passo.numero} className="relative pl-16">
                <span className="absolute left-0 top-0 font-serif text-4xl italic text-line">
                  {passo.numero}
                </span>
                {i < passos.length - 1 && (
                  <span className="absolute left-6 top-12 hidden h-[calc(100%-1rem)] w-px bg-line sm:block" />
                )}
                <h3 className="text-lg font-medium text-ink">{passo.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">
                Para quem é
              </p>
              <h2 className="mt-3 text-3xl text-ink sm:text-4xl">
                Feito para quem vive de criar imagens.
              </h2>
              <p className="mt-4 max-w-md text-ink-muted">
                Se o seu trabalho pode ser copiado com um clique direito,
                vale ter uma prova de quando ele nasceu.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {publicos.map((p) => (
                  <li
                    key={p}
                    className="rounded-full border border-line bg-paper-certificate px-3.5 py-1.5 text-sm text-ink"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-line bg-paper-certificate p-8">
              <h3 className="font-serif text-xl text-ink">O que o certificado não é</h3>
              <ul className="mt-4 space-y-3 text-sm text-ink-muted">
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-ledger" />
                  Uma evidência de anterioridade, com data e hash verificáveis.
                </li>
                <li className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-ledger" />
                  Um documento que você pode anexar a uma negociação ou disputa.
                </li>
                <li className="flex gap-2.5 opacity-70">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center font-mono text-xs text-ink-muted">
                    ×
                  </span>
                  Não substitui o registro oficial junto a órgãos competentes.
                </li>
                <li className="flex gap-2.5 opacity-70">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center font-mono text-xs text-ink-muted">
                    ×
                  </span>
                  Não constitui aconselhamento jurídico.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-ledger">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl text-paper">Pronto para registrar sua primeira imagem?</h2>
            <p className="mt-2 text-paper/70">
              Leva menos de dois minutos, e o primeiro certificado é por nossa conta.
            </p>
          </div>
          <Link
            href="/cadastro"
            className={cn(
              buttonVariants({ size: "lg" }),
              "gap-2 bg-paper px-5 text-ledger hover:bg-paper/90"
            )}
          >
            Criar conta grátis
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
