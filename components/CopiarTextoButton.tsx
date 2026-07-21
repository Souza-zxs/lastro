"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopiarTextoButton({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Clipboard indisponível (permissão negada, contexto não seguro etc.):
      // o texto já está visível na tela pra seleção manual.
    }
  }

  return (
    <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={copiar}>
      {copiado ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copiado ? "Copiado" : "Copiar texto"}
    </Button>
  );
}
