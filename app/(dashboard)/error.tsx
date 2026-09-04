"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErroDashboard({
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
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Erro inesperado</p>
      <h1 className="text-2xl text-ink">Não foi possível carregar esta página.</h1>
      <p className="max-w-sm text-ink-muted">
        Pode ter sido uma instabilidade de rede. Tente de novo em alguns segundos.
      </p>
      <Button onClick={() => reset()}>Tentar de novo</Button>
    </div>
  );
}
