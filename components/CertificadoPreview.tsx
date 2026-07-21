import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { SealMark } from "@/components/SealMark";
import { formatDataHora } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Registro } from "@/lib/types";

interface CertificadoPreviewProps {
  registro: Registro;
  className?: string;
  compact?: boolean;
  /**
   * Origem pública (ex.: "https://lastro.app") pra montar a URL de
   * verificação do QR code. Passe `origemAtual()` (lib/origem.ts) nas
   * páginas server-side — ela lê o host real da requisição, não depende de
   * NEXT_PUBLIC_SITE_URL estar configurada certinho no build de produção.
   * Omita em componentes client (ex.: NovoRegistroForm): o fallback usa
   * window.location.origin, que já é a origem real do navegador.
   */
  origem?: string;
}

export function CertificadoPreview({
  registro,
  className,
  compact = false,
  origem,
}: CertificadoPreviewProps) {
  const siteUrl =
    origem ??
    (typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
  const verifyUrlCompleta = `${siteUrl.replace(/\/$/, "")}/verificar/${registro.codigo_verificacao}`;
  const verifyUrlExibicao = verifyUrlCompleta.replace(/^https?:\/\//, "");

  return (
    <div
      className={cn(
        "relative border border-ledger/70 bg-paper-certificate text-ink shadow-[0_1px_0_rgba(22,56,50,0.4)]",
        compact ? "p-6 sm:p-8" : "p-8 sm:p-12",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-[6px] border border-ledger/30" />

      <div className="relative flex items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.25em] text-seal uppercase">
            Certificado de registro
          </p>
          <h3 className="mt-1 font-serif text-2xl italic text-ledger sm:text-3xl">
            Prova de anterioridade
          </h3>
        </div>
        <SealMark size={compact ? 40 : 52} className="mt-1 shrink-0 text-ledger" />
      </div>

      <div className="relative mt-6 grid gap-6 sm:grid-cols-[minmax(0,160px)_1fr]">
        <div className="relative aspect-4/3 overflow-hidden border border-line bg-muted sm:aspect-square">
          <Image
            src={registro.imagem_thumb}
            alt={registro.titulo}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div className="col-span-2">
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Obra</dt>
            <dd className="mt-0.5 font-serif text-lg text-ink">{registro.titulo}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Autor(a)</dt>
            <dd className="mt-0.5 text-ink">{registro.autor}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Categoria</dt>
            <dd className="mt-0.5 text-ink">{registro.categoria}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Registrado em</dt>
            <dd className="mt-0.5 text-ink">{formatDataHora(registro.data_registro)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Código de verificação</dt>
            <dd className="mt-0.5 font-mono text-ink">{registro.codigo_verificacao}</dd>
          </div>
        </dl>
      </div>

      <div className="relative mt-6 border-t border-line pt-5">
        <dt className="text-xs uppercase tracking-wide text-ink-muted">Hash SHA-256</dt>
        <dd className="mt-1 break-all font-mono text-xs text-ink sm:text-[0.8rem]">
          {registro.hash_sha256}
        </dd>
      </div>

      <div className="relative mt-7 flex flex-col items-start justify-between gap-5 border-t border-line pt-6 sm:flex-row sm:items-end">
        <p className="max-w-xs flex-1 text-xs leading-relaxed text-ink-muted">
          Este certificado atesta a existência do arquivo acima, com o hash
          indicado, na data e hora do registro. Não constitui registro
          oficial de direitos autorais.
        </p>
        <div className="flex shrink-0 items-center gap-3 self-center sm:self-auto">
          <div className="border border-seal/50 bg-paper p-1.5">
            <QRCodeSVG
              value={verifyUrlCompleta}
              size={compact ? 64 : 76}
              fgColor="#4c0c23"
              bgColor="transparent"
            />
          </div>
          <div className="max-w-[9rem] break-all font-mono text-[0.65rem] leading-tight text-ink-muted">
            <p>Verifique em</p>
            <p className="text-ink">{verifyUrlExibicao}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
