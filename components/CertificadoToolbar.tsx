"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CertificadoToolbarProps {
  voltarHref: string;
  /** Quando presente, baixa o PDF assinado eletronicamente de verdade. Sem isso, cai no print do navegador (ex.: página de processo do INPI, que não é um certificado). */
  registroId?: string;
}

export function CertificadoToolbar({ voltarHref, registroId }: CertificadoToolbarProps) {
  return (
    <div className="print:hidden mx-auto flex w-full max-w-2xl items-center justify-between px-6 pt-8">
      <Link href={voltarHref} className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="size-3.5" />
        Voltar
      </Link>
      {registroId ? (
        <a href={`/api/certificado/${registroId}/pdf`} className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
          <Download className="size-3.5" />
          Baixar PDF
        </a>
      ) : (
        <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Download className="size-3.5" />
          Baixar PDF
        </Button>
      )}
    </div>
  );
}
