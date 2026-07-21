"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CertificadoToolbar({ voltarHref }: { voltarHref: string }) {
  return (
    <div className="print:hidden mx-auto flex w-full max-w-2xl items-center justify-between px-6 pt-8">
      <Link href={voltarHref} className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="size-3.5" />
        Voltar
      </Link>
      <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
        <Download className="size-3.5" />
        Baixar PDF
      </Button>
    </div>
  );
}
