"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErroPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Erro inesperado</p>
        <h1 className="mt-2 text-3xl text-ink">Algo deu errado.</h1>
        <p className="mt-2 max-w-sm text-ink-muted">
          Tente de novo. Se continuar acontecendo, volte ao início e tente outra vez em alguns
          minutos.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={() => reset()}>
          Tentar de novo
        </Button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
