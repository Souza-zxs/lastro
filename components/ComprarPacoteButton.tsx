"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComprarPacoteButtonProps {
  pacoteId: string;
  nome: string;
  logado: boolean;
  destaque: boolean;
}

export function ComprarPacoteButton({ pacoteId, nome, logado, destaque }: ComprarPacoteButtonProps) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!logado) {
    return (
      <Link
        href="/cadastro"
        className={cn(buttonVariants({ variant: destaque ? "default" : "outline", size: "lg" }), "mt-8 w-full")}
      >
        Selecionar {nome.toLowerCase()}
      </Link>
    );
  }

  async function comprar() {
    setCarregando(true);
    setErro(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacoteId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErro(data?.error ?? "Não foi possível concluir a compra.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErro("Não foi possível concluir a compra. Verifique sua conexão e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={comprar}
        disabled={carregando}
        className={cn(buttonVariants({ variant: destaque ? "default" : "outline", size: "lg" }), "w-full")}
      >
        {carregando ? "Processando…" : `Selecionar ${nome.toLowerCase()}`}
      </button>
      {erro && <p className="mt-2 text-xs text-destructive">{erro}</p>}
    </div>
  );
}
